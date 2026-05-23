import { createClient, RedisClientType } from "redis";

// Two clients — Redis requires a dedicated connection per subscriber
export const pub: RedisClientType = createClient({ url: process.env.REDIS_URL ?? "redis://localhost:6379" }) as RedisClientType;
export const sub: RedisClientType = pub.duplicate() as RedisClientType;

pub.on("error", (err) => console.error("[redis:pub]", err.message));
sub.on("error", (err) => console.error("[redis:sub]", err.message));

export async function connectRedis(): Promise<void> {
  await Promise.all([pub.connect(), sub.connect()]);
  console.log("[redis] connected");
}

// ── Channel names ─────────────────────────────────────────────────────────────

export const notifyChannel = (userId: number) => `notify:${userId}`;
export const roomChannel   = (roomId: string) => `room:${roomId}`;

// ── Active room registry ──────────────────────────────────────────────────────

export async function registerRoom(roomId: string, userAId: number, userBId: number): Promise<void> {
  await pub.hSet("active_rooms", roomId, JSON.stringify({ userAId, userBId, createdAt: Date.now() }));
}

export async function roomExists(roomId: string): Promise<boolean> {
  return (await pub.hGet("active_rooms", roomId)) !== null;
}

export async function deleteRoom(roomId: string): Promise<void> {
  await pub.hDel("active_rooms", roomId);
}

export async function ensureRedis() {
  if (!pub.isOpen) {
    await pub.connect();
  }

  if (!sub.isOpen) {
    await sub.connect();
  }
}

// ── Ephemeral media ───────────────────────────────────────────────────────────
//
// HOW IT WORKS:
// 1. storeEphemeralMedia  → stores blob at  media:{roomId}:{mediaId}        (TTL = MEDIA_TTL)
//                        → stores flag at   media:{roomId}:{mediaId}:viewed  (TTL = MEDIA_TTL)
//
// 2. fetchEphemeralMedia  → checks the :viewed flag first
//                        → if flag missing → already fetched, return null (410)
//                        → if flag present → delete the flag, return the data
//                        → data key is left alone — the TTL expires it naturally
//                           (this means the blob stays in Redis until TTL even after viewed,
//                            but the flag being gone prevents any second fetch)
//
// WHY NOT del() ON FETCH:
//   del() runs server-side the instant pub.get() resolves, but the HTTP response
//   is still streaming res.blob() on the client. The client has the data already
//   (it's in the response stream) so deleting the Redis key after get() is safe —
//   but deleting BEFORE the client calls res.blob() would break nothing either,
//   because the data is already in the HTTP response buffer at that point.
//
//   The real reason we use a flag instead: if TWO clients somehow race to fetch
//   the same mediaId (e.g. both sides of the private room), we want exactly one
//   winner. The :viewed flag with NX (set-if-not-exists) gives us atomic once-only
//   semantics without a Lua script.

const MEDIA_TTL = 20; // seconds — 20s to display, then auto-expires
const MAX_B64_LENGTH = 30 * 1024 * 1024 * 1.37; // ~30 MB binary as base64

export async function storeEphemeralMedia(
  roomId: string,
  mediaId: string,
  base64Data: string,
  mimeType: string
): Promise<boolean> {

  await ensureRedis();

  if (base64Data.length > MAX_B64_LENGTH) {
    return false;
  }

  const dataKey = `media:${roomId}:${mediaId}`;

  await pub.set(
    dataKey,
    JSON.stringify({
      data: base64Data,
      mimeType,
    }),
    {
      EX: MEDIA_TTL,
    }
  );

  return true;
}

export async function fetchEphemeralMedia(
  roomId: string,
  mediaId: string
): Promise<{ data: string; mimeType: string } | null> {

  await ensureRedis();

  const dataKey = `media:${roomId}:${mediaId}`;
  const viewedKey = `media:${roomId}:${mediaId}:viewed`;

  // First viewer wins
  const firstView = await pub.set(
    viewedKey,
    "1",
    {
      NX: true,
      EX: MEDIA_TTL,
    }
  );

  // Already viewed
  if (firstView === null) {
    return null;
  }

  const raw = await pub.get(dataKey);

  if (!raw) return null;

  return JSON.parse(raw) as {
    data: string;
    mimeType: string;
  };
}