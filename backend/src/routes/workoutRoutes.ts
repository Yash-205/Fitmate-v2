import { Router } from "express";
import { getWorkoutPlan, generateWorkoutPlan } from "../controllers/workoutController";
import authMiddleware from "../middleware/authMiddleware";

/**
 * Workout Routes
 * 
 * Defines endpoints for generating and retrieving workout plans.
 */
const router = Router();

// Protect routes
router.use(authMiddleware);

router.get("/", getWorkoutPlan);
router.post("/generate", generateWorkoutPlan);

export default router;
