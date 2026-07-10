import express from "express";
import { upsertProfile, getProfile, selectTrainer, getUserMemories } from "../controllers/profileController";
import authMiddleware from "../middleware/authMiddleware";

/**
 * Profile Routes
 * 
 * Defines endpoints for managing user profiles and trainer assignments.
 */
const router = express.Router();

// 🔹 Create or update profile
router.post("/", authMiddleware, upsertProfile);

// 🔹 Get profile
router.get("/", authMiddleware, getProfile);

// 🔹 Get AI Memories
router.get("/memories", authMiddleware, getUserMemories);

// 🔹 Select Personal Trainer
router.post("/select-trainer/:trainerId", authMiddleware, selectTrainer);

export default router;