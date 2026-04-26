import express from "express";
import authMiddleware, { isRole } from "../middleware/authMiddleware";
import {
  upsertTrainerProfile,
  getTrainerProfile,
  getClients,
  getDiscoveryList,
} from "../controllers/trainerController";

/**
 * Trainer Routes
 * 
 * Defines endpoints for trainer discovery, professional profile management,
 * and client tracking.
 */
const router = express.Router();

// 🔹 Public/Learner Routes
router.get("/discovery", getDiscoveryList);

// 🔹 Trainer-Only Routes (Restricted)
router.get("/clients", authMiddleware, isRole(["trainer"]), getClients);

// 🔹 Mixed/Transition Routes
// We allow 'learner' here so they can call this to become a trainer.
router.post("/profile", authMiddleware, isRole(["learner", "trainer"]), upsertTrainerProfile);
router.get("/profile", authMiddleware, isRole(["trainer"]), getTrainerProfile);

export default router;
