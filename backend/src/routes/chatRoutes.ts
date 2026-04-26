import express from "express";
import { chat, getSessions, getHistory } from "../controllers/chatController";
import authMiddleware from "../middleware/authMiddleware";

/**
 * Chat Routes
 * 
 * Defines endpoints for AI-powered chat interactions and session history management.
 */
const router = express.Router();

router.post("/", authMiddleware, chat);
router.get("/sessions", authMiddleware, getSessions);
router.get("/:threadId/history", authMiddleware, getHistory);

export default router;