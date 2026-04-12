import express from "express";
import { upsertProfile, getProfile } from "../controllers/profileController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

// 🔹 Create or update profile
router.post("/", authMiddleware, upsertProfile);

// 🔹 Get profile
router.get("/", authMiddleware, getProfile);

export default router;