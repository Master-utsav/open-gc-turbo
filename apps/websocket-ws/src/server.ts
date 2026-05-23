
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { db } from "@repo/db";
import {  pub , sub, connectRedis,
  notifyChannel, roomChannel,
  registerRoom, roomExists, deleteRoom, } from "@repo/redis";


const PORT          = Number(process.env.WS_PORT) || 3002;
const JWT_SECRET    = process.env.JWT_SECRET ?? "change_me_in_production";
const MSG_CAP       = 500;
const HISTORY_LIMIT = 100;
const KNOCK_COOLDOWN_MS = 10_000; // 10s between knocks per sender

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuthPayload { userId: number; username: string; }

interface ConnectedClient {
  socket:        WebSocket;
  clientId:      string;
  userId:        number;
  username:      string;
  privateRoomId: string | null;
}

// ── State ─────────────────────────────────────────────────────────────────────

const clients     = new Map<number, ConnectedClient>();

// Rate limiting: userId → timestamp of last knock sent
// Scoped per sender — 1000 users can all knock simultaneously to different targets,
// but each individual user must wait 10s between their own knocks.
const lastKnockAt = new Map<number, number>();

// ── Helpers ───────────────────────────────────────────────────────────────────

function send(socket: WebSocket, msg: unknown): void {
  if (socket.readyState === WebSocket.OPEN)
    socket.send(JSON.stringify(msg));
}

function broadcastGlobal(msg: unknown, excludeUserId?: number): void {
  const frame = JSON.stringify(msg);
  for (const [uid, c] of clients.entries()) {
    if (uid === excludeUserId) continue;
    if (c.socket.readyState === WebSocket.OPEN) c.socket.send(frame);
  }
}

function parseToken(url: string): AuthPayload | null {
  try {
    const token = new URL(url, "http://localhost").searchParams.get("token");
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch { return null; }
}

async function enforceGlobalCap(): Promise<void> {
  const count = await db.globalMessage.count();
  if (count > MSG_CAP) {
    const oldest = await db.globalMessage.findMany({
      orderBy: { createdAt: "asc" }, take: count - MSG_CAP, select: { id: true },
    });
    await db.globalMessage.deleteMany({ where: { id: { in: oldest.map(m => m.id) } } });
  }
}

async function closePrivateRoom(roomId: string, byUsername: string): Promise<void> {
  await deleteRoom(roomId);
  await pub.publish(roomChannel(roomId), JSON.stringify({
    type: "private:room_closed", roomId, byUsername,
    reason: "User left — room destroyed. Send a new knock to chat again.",
  }));
  for (const c of clients.values()) {
    if (c.privateRoomId === roomId) c.privateRoomId = null;
  }
}
// // ── Redis pub/sub router ──────────────────────────────────────────────────────

async function setupRedisRouter(): Promise<void> {
  await sub.pSubscribe("room:*", (message, channel) => {
    const roomId = channel.slice("room:".length);
    const parsed = JSON.parse(message);
    for (const c of clients.values()) {
      if (c.privateRoomId === roomId) send(c.socket, parsed);
    }
  });

  await sub.pSubscribe("notify:*", (message, channel) => {
    const userId = Number(channel.slice("notify:".length));
    const c = clients.get(userId);
    if (c) send(c.socket, JSON.parse(message));
  });
}

// ── WS Server ─────────────────────────────────────────────────────────────────

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", async (socket: WebSocket, req) => {
  const user = parseToken(req.url ?? "");
  if (!user) {
    send(socket, { type: "error", message: "Unauthorized" });
    socket.close(4001, "Unauthorized");
    return;
  }

  const clientId = randomUUID();
  const client: ConnectedClient = {
    socket, clientId, userId: user.userId, username: user.username, privateRoomId: null,
  };
  clients.set(user.userId, client);
  console.log(`[ws] + ${user.username} (${user.userId})`);

  // Send history
  try {
    const history = await db.globalMessage.findMany({
      orderBy: { createdAt: "desc" }, take: HISTORY_LIMIT,
      include: { author: { select: { username: true} } },
    });
    send(socket, {
      type: "global:history",
      messages: history.reverse().map(m => ({
        id: m.id, userId: m.authorId, username: m.author.username,
        content: m.content, msgType: m.type, createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (err) { console.error("[ws] history failed:", err); }

  send(socket, { type: "connected", clientId, username: user.username });
  broadcastGlobal({ type: "global:user_joined", username: user.username, onlineCount: clients.size }, user.userId);

  // ── Message handling ──────────────────────────────────────────────────────

  socket.on("message", async (raw) => {
    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(raw.toString()); }
    catch { send(socket, { type: "error", message: "Invalid JSON" }); return; }

    const type = String(parsed.type ?? "");

    switch (type) {

      // ── GLOBAL ───────────────────────────────────────────────────────────

      case "global:message": {
        const content = String(parsed.content ?? "").trim();
        const msgType = parsed.msgType === "GIF" ? "GIF" as const : "TEXT" as const;
        if (!content) { send(socket, { type: "error", message: "Empty content" }); return; }
        try {
          const saved = await db.globalMessage.create({
            data: { content, type: msgType, authorId: user.userId },
            include: { author: { select: { username: true } } },
          });
          await enforceGlobalCap();
          broadcastGlobal({
            type: "global:message", id: saved.id, userId: saved.authorId,
            username: saved.author.username, content: saved.content,
            msgType: saved.type, createdAt: saved.createdAt.toISOString(),
          });
        } catch (err) {
          console.error("[ws] global message failed:", err);
          send(socket, { type: "error", message: "Failed to send" });
        }
        break;
      }

      // ── PRIVATE: knock ────────────────────────────────────────────────────
      // Rate limit: 10s cooldown per sender across ALL knocks they send.
      // This lets 1000 users knock to different targets simultaneously —
      // each is rate-limited only against themselves.

      case "private:knock": {
        const targetUserId = Number(parsed.targetUserId);
        if (!targetUserId || targetUserId === user.userId) return;

        // ── Rate limit check ─────────────────────────────────────────────
        const now      = Date.now();
        const lastKnock = lastKnockAt.get(user.userId) ?? 0;
        const elapsed  = now - lastKnock;

        if (elapsed < KNOCK_COOLDOWN_MS) {
          const remaining = Math.ceil((KNOCK_COOLDOWN_MS - elapsed) / 1000);
          send(socket, {
            type:      "private:knock_failed",
            reason:    `Please wait ${remaining}s before sending another knock`,
            cooldown:  remaining,
          });
          return;
        }

        // ── Target checks ────────────────────────────────────────────────
        if (!clients.has(targetUserId)) {
          send(socket, { type: "private:knock_failed", reason: "User is offline" });
          return;
        }

        const targetClient = clients.get(targetUserId)!;
        if (targetClient.privateRoomId) {
          send(socket, { type: "private:knock_failed", reason: "User is in another private room" });
          return;
        }

        if (client.privateRoomId) {
          send(socket, { type: "private:knock_failed", reason: "You are already in a private room" });
          return;
        }

        const roomId = [user.userId, targetUserId].sort((a, b) => a - b).join("-");

        try {
          if (await roomExists(roomId)) {
            send(socket, { type: "private:knock_failed", reason: "Already in a room with this user" });
            return;
          }

          // Record knock time AFTER all checks pass
          lastKnockAt.set(user.userId, now);

          await pub.publish(notifyChannel(targetUserId), JSON.stringify({
            type: "private:incoming_knock",
            fromUserId:   user.userId,
            fromUsername: user.username,
            roomId,
            // Tell client when this notification auto-expires
            expiresAt: now + KNOCK_COOLDOWN_MS,
          }));

          send(socket, {
            type:    "private:knock_sent",
            roomId,
            toUserId: targetUserId,
            cooldownMs: KNOCK_COOLDOWN_MS,
          });
        } catch (err) {
          console.error("[ws] knock error:", err);
          send(socket, { type: "error", message: "Could not send knock — try again" });
        }
        break;
      }

      // ── PRIVATE: accept ───────────────────────────────────────────────────

      case "private:accept": {
        const fromUserId = Number(parsed.fromUserId);
        const roomId     = String(parsed.roomId ?? "");
        if (!roomId || !fromUserId) return;

        // Can't accept if already in a room
        if (client.privateRoomId) {
          send(socket, { type: "error", message: "You are already in a private room" });
          return;
        }

        try {
          if (await roomExists(roomId)) {
            send(socket, { type: "error", message: "Room already active. Send a new knock." });
            return;
          }

          await registerRoom(roomId, fromUserId, user.userId);

          const requester = clients.get(fromUserId);
          if (requester) requester.privateRoomId = roomId;
          client.privateRoomId = roomId;

          await pub.publish(roomChannel(roomId), JSON.stringify({
            type: "private:room_ready", roomId,
            participants: [
              { userId: fromUserId,  username: requester?.username },
              { userId: user.userId, username: user.username },
            ],
          }));
        } catch (err) {
          console.error("[ws] accept error:", err);
          send(socket, { type: "error", message: "Could not create room — try again" });
        }
        break;
      }

      // ── PRIVATE: decline ──────────────────────────────────────────────────

      case "private:decline": {
        const fromUserId = Number(parsed.fromUserId);
        if (!fromUserId) return;
        try {
          await pub.publish(notifyChannel(fromUserId), JSON.stringify({
            type: "private:knock_declined", byUsername: user.username,
          }));
        } catch (err) { console.error("[ws] decline error:", err); }
        break;
      }

      // ── PRIVATE: text/GIF ─────────────────────────────────────────────────

      case "private:message": {
        const roomId  = String(parsed.roomId  ?? "");
        const content = String(parsed.content ?? "").trim();
        const msgType = parsed.msgType === "GIF" ? "GIF" : "TEXT";
        if (!roomId || !content || client.privateRoomId !== roomId) return;
        try {
          await pub.publish(roomChannel(roomId), JSON.stringify({
            type: "private:message", fromUserId: user.userId,
            fromUsername: user.username, content, msgType,
            createdAt: new Date().toISOString(),
          }));
        } catch (err) { console.error("[ws] private message error:", err); }
        break;
      }

      // ── PRIVATE: media notification (mediaId only, data via HTTP) ─────────
      // Media bytes are uploaded via POST /api/v1/media/upload (Express + Redis)
      // WS server only receives the mediaId and broadcasts it to the room.
 
      case "private:media_ready": {
        const roomId    = String(parsed.roomId    ?? "");
        const mediaId   = String(parsed.mediaId   ?? "");
        const mimeType  = String(parsed.mimeType  ?? "");
        const mediaKind = parsed.mediaKind === "video" ? "video" : "picture";
        if (!roomId || !mediaId || client.privateRoomId !== roomId) return;
        try {
          await pub.publish(roomChannel(roomId), JSON.stringify({
            type: "private:media", fromUserId: user.userId,
            fromUsername: user.username, mediaId, roomId,
            mimeType, mediaKind, expiresIn: 20,
            createdAt: new Date().toISOString(),
          }));
        } catch (err) { console.error("[ws] media notify error:", err); }
        break;
      }

      // ── PRIVATE: leave ────────────────────────────────────────────────────

      case "private:leave": {
        const roomId = String(parsed.roomId ?? "");
        if (!roomId || client.privateRoomId !== roomId) return;
        try { await closePrivateRoom(roomId, user.username); }
        catch (err) { console.error("[ws] leave error:", err); }
        break;
      }

      case "ping":
        send(socket, { type: "pong", timestamp: Date.now() });
        break;

      default:
        send(socket, { type: "error", message: `Unknown type: ${type}` });
    }
  });

  // ── Disconnect ────────────────────────────────────────────────────────────

  socket.on("close", async () => {
    console.log(`[ws] - ${user.username} (${user.userId})`);
    if (client.privateRoomId) {
      try { await closePrivateRoom(client.privateRoomId, user.username); }
      catch (err) { console.error("[ws] close room error:", err); }
    }
    clients.delete(user.userId);
    lastKnockAt.delete(user.userId); // clean up rate limit entry
    broadcastGlobal({ type: "global:user_left", username: user.username, onlineCount: clients.size });
  });

  socket.on("error", (err) => console.error(`[ws] error (${user.username}):`, err.message));
});

// ── Boot ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("[boot] connecting Redis…");
  await connectRedis();
  await setupRedisRouter();
  console.log(`[ws] ready → ws://localhost:${PORT}`);
}

main().catch(err => { console.error("[boot] fatal:", err); process.exit(1); });