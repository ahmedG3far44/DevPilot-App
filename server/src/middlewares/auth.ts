import { Response, NextFunction, Request } from "express";
import Jwt, { JwtPayload } from "jsonwebtoken";
import { AuthRequest } from "../types";

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.session;

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = Jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    if (!decoded || typeof decoded !== "object") {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = {
      id: decoded.id,
      name: decoded.name,
      username: decoded.username,
      repos_url:decoded.repos_url,
      avatar_url: decoded.avatar_url,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
