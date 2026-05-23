import { Request, Response } from "express";
import { db } from "@repo/db";

export async function getMessages(_req: Request, res: Response): Promise<void> {
   try {
    const messages = await db.globalMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { author: { select: { username: true } } },
    });
 
    res.json(
      messages.reverse().map((m:any) => ({
        id:        m.id,
        username:  m.author.username,
        content:   m.content,
        msgType:   m.type,
        createdAt: m.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    console.error("[messages]", err);
    res.status(500).json({ error: "Internal server error" });
  }
}