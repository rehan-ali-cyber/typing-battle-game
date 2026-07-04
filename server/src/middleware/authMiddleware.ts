import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/token.js";
import { prisma } from "../config/db.js";

/**
 * Middleware that validates the session cookie and populates req.user.
 * If authentication fails, it returns a 401 response for API calls.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.cookies?.arena_session;

  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: "Session expired or invalid" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true,
        rating: true,
        profilePicture: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    req.userId = user.id;
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: "Authentication internal error" });
  }
}

/**
 * Soft authenticate middleware that checks credentials but does not reject unauthenticated users.
 */
export async function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.cookies?.arena_session;

  if (!token) {
    next();
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    next();
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true,
        rating: true,
        profilePicture: true,
      },
    });

    if (user) {
      req.userId = user.id;
      req.user = user;
    }
    next();
  } catch (err) {
    next();
  }
}
