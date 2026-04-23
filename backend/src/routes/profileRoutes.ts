import express from "express";
import { upsertProfile, getProfile, selectTrainer } from "../controllers/profileController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

// 🔹 Create or update profile
router.post("/", authMiddleware, upsertProfile);

// 🔹 Get profile
router.get("/", authMiddleware, getProfile);

// 🔹 Select Personal Trainer
router.post("/select-trainer/:trainerId", authMiddleware, selectTrainer);

export default router;