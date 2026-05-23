import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@repo/db";

const JWT_SECRET = process.env.JWT_SECRET ?? "change_me_in_production";
const SALT_ROUNDS = 10;

/**
 * POST /api/auth
 * Single endpoint: if user exists → login, else → signup then login.
 * Body: { username: string, password: string }
 */
export async function authHandler(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  if (!username?.trim() || !password) {
    res.status(400).json({ error: "username and password are required" });
    return;
  }

  const cleanUsername = username.trim().toLowerCase();

  try {
    let user = await db.user.findUnique({
      where: { username: cleanUsername },
    });

    if (!user) {
      // ── SIGNUP ──────────────────────────────────────────────
      const hashed = await bcrypt.hash(password, SALT_ROUNDS);
      user = await db.user.create({
        data: { username: cleanUsername, password: hashed },
      });
    } else {
      // ── LOGIN ───────────────────────────────────────────────
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        res.status(401).json({ error: "Invalid password" });
        return;
      }
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, username: user.username, userId: user.id });
  } catch (err) {
    console.error("[auth]", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
