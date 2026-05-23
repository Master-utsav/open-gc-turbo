import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "change_me_in_production";

export interface AuthPayload {
  userId: number;
  username: string;
}

function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing token" });
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as AuthPayload;
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

/** Verifies a raw JWT string — used by the WS server */
function verifyTokenRaw(token: string): AuthPayload {
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
}
export {verifyToken , verifyTokenRaw}