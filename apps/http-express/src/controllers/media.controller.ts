import { Request, Response } from "express";
import { storeEphemeralMedia, ensureRedis, pub } from "@repo/redis";
import { randomUUID } from "crypto";

export async function mediaCtrl(req: Request, res: Response): Promise<void> {
  const { roomId, mediaId } = req.params;
  try {
    await ensureRedis();
    console.log(mediaId, " : ", roomId);
    const raw = await pub.get(`media:${roomId}:${mediaId}`);

    // const media = await fetchEphemeralMedia(roomId!, mediaId!);

    if (!raw) {
      res.status(410).json({ error: "Media expired or already viewed" });
      return;
    }
    const media = JSON.parse(raw) as {
      data: string;
      mimeType: string;
    };
    const binary = Buffer.from(media.data, "base64");
    res.writeHead(200, {
      "Content-Type": media.mimeType,
      "Content-Length": binary.length,
      "Cache-Control": "no-store",
    });
    res.end(binary);
  } catch (err) {
    console.error("[media/get]", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function uploadMedia(req: Request, res: Response): Promise<void> {
  const file = ((req as unknown) as any).file;
  const roomId = req.body?.roomId as string | undefined;
  const mediaKind = req.body?.mediaKind as string | undefined;

  if (!file || !roomId || !mediaKind) {
    res.status(400).json({ error: "file, roomId and mediaKind are required" });
    return;
  }

  try {
    await ensureRedis();
    const mediaId = randomUUID();
    const base64 = file.buffer.toString("base64");
    const stored = await storeEphemeralMedia(
      roomId,
      mediaId,
      base64,
      file.mimetype
    );

    if (!stored) {
      res.status(413).json({ error: "File too large" });
      return;
    }

    res.json({ mediaId, mimeType: file.mimetype, mediaKind });
  } catch (err) {
    console.error("[media/upload]", err);
    res.status(500).json({ error: "Upload failed" });
  }
}
