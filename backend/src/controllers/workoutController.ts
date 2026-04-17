import { Request, Response } from "express";
import { runMicrocycleAgent } from "../ai/graphs/microcycleGraph";
import WorkoutPlan from "../models/WorkoutPlan";
import Profile from "../models/Profile";

// Fetch current user's workout plan
export const getWorkoutPlan = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const plan = await WorkoutPlan.findOne({ userId }).sort({ createdAt: -1 });
    
    if (!plan) {
      return res.status(404).json({ message: "No workout plan found" });
    }
    
    res.json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch workout plan" });
  }
};

// Generate a new microcycle training schedule based on the existing strategic roadmap
export const generateWorkoutPlan = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const profile = await Profile.findOne({ userId });
    
    if (!profile) {
      return res.status(400).json({ message: "Profile incomplete." });
    }

    // 1. Get existing strategy strategy
    const existingPlan = await WorkoutPlan.findOne({ userId });
    if (!existingPlan || !existingPlan.mesoPhases.length) {
      return res.status(400).json({ message: "No training roadmap found. Please complete profile assessment again." });
    }

    // 2. Locate current mesocycle context
    const currentMeso = existingPlan.mesoPhases.find((m: any) => m.name === existingPlan.currentPhase) || existingPlan.mesoPhases[0];

    // 3. Run Microcycle Agent (Phase 2)
    const { feedback } = req.body;
    const aiResponse = await runMicrocycleAgent(profile, userId, currentMeso, feedback);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 4. Inject dates for 7-day schedule
    const scheduleWithDates = aiResponse.schedule.map((dayPlan: any, index: number) => {
      const planDate = new Date(today);
      planDate.setDate(today.getDate() + index);
      return { ...dayPlan, date: planDate };
    });

    // 5. Update existing plan with new microcycle execution (using $set to avoid subdocument _id conflicts)
    const updatedPlan = await WorkoutPlan.findOneAndUpdate(
      { _id: existingPlan._id },
      {
        $set: {
          schedule: scheduleWithDates,
          progressionRule: aiResponse.progressionRule,
          deloadStrategy: aiResponse.deloadStrategy,
          createdAt: new Date(),
        }
      },
      { returnDocument: 'after' }
    );
    
    res.status(201).json(updatedPlan);
  } catch (error: any) {
    console.error("Microcycle Generate error:", error);
    res.status(500).json({ message: "Failed to generate schedule: " + (error.message || "Unknown error") });
  }
};

