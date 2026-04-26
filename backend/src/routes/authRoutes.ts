import express from "express";
import { signup, login, googleAuth } from "../controllers/authController";
import authMiddleware from "../middleware/authMiddleware";
import { AuthRequest } from "../types/express";

/**
 * Authentication Routes
 * 
 * Defines endpoints for user registration, login, and Google OAuth.
 */
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleAuth); // future use
// test route
router.get("/me", authMiddleware, (req: AuthRequest, res) => {
  res.json({
    userId: req.userId,
  });
});


export default router;