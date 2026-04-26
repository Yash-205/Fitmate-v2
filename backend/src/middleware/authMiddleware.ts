import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/express";
import User from "../models/User";

/**
 * Auth Middleware
 * 
 * Provides security by verifying JWT tokens and enforcing role-based access control (RBAC).
 */

/**
 * @desc    Verifies JWT token and attaches userId to the request object
 */
const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { userId: string };

    // Attach userId to request
    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};


/**
 * @desc    Enforces role-based access (e.g., only 'trainer' or 'admin' can access certain routes)
 * @param   roles Array of allowed roles
 */
export const isRole = (roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: "Access denied: Unauthorized role" });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: "Role verification failed" });
    }
  };
};

export default authMiddleware;