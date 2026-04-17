import { Request, Response } from "express";
import { runEvolutionAgent } from "../ai/graphs/evolutionGraph";
import WorkoutPlan from "../models/WorkoutPlan";
import Profile from "../models/Profile";

/**
 * Fetch current user's workout plan
 */
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

/**
 * Generate OR Evolve a workout plan (Interconnected Adjustment)
 */
export const generateWorkoutPlan = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { feedback } = req.body;
    
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(400).json({ message: "Profile incomplete." });
    }

    // 1. Get existing plan for context
    const existingPlan = await WorkoutPlan.findOne({ userId });
    if (!existingPlan) {
      return res.status(400).json({ message: "No training plan found. Please generate one first." });
    }

    // 2. Run the Unified Evolution Agent (Interconnected Graph)
    // This node decides if we need a new Strategy OR just a new Microcycle
    const updatedPlanData = await runEvolutionAgent(
      profile, 
      userId, 
      existingPlan.toObject(), 
      feedback
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 3. Inject dates for the Strategic Roadmap (Mesocycles)
    let runningDate = new Date(today);
    const mesoPhasesWithDates = updatedPlanData.mesoPhases.map((phase: any) => {
      const startDate = new Date(runningDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (phase.durationWeeks * 7) - 1);
      
      // Update runningDate for next phase
      runningDate = new Date(endDate);
      runningDate.setDate(endDate.getDate() + 1);

      return {
        ...phase,
        startDate,
        endDate
      };
    });

    // 4. Inject dates for the 7-day schedule (Microcycle)
    // We start the current week's schedule from today
    const scheduleWithDates = updatedPlanData.schedule.map((dayPlan: any, index: number) => {
      const planDate = new Date(today);
      planDate.setDate(today.getDate() + index);
      return { ...dayPlan, date: planDate };
    });

    // 5. Update the entire plan document
    const savedPlan = await WorkoutPlan.findOneAndUpdate(
      { userId },
      {
        $set: {
          goal: updatedPlanData.goal,
          splitType: updatedPlanData.splitType,
          experienceLevel: updatedPlanData.experienceLevel,
          overarchingStrategy: updatedPlanData.overarchingStrategy,
          weeklyFrequency: updatedPlanData.weeklyFrequency,
          mesoPhases: mesoPhasesWithDates,
          currentPhase: updatedPlanData.currentPhase,
          schedule: scheduleWithDates,
          progressionRule: updatedPlanData.progressionRule,
          deloadStrategy: updatedPlanData.deloadStrategy,
          createdAt: new Date(),
        }
      },
      { returnDocument: 'after', upsert: true }
    );
    
    res.status(201).json(savedPlan);
  } catch (error: any) {
    console.error("Plan Evolution error:", error);
    res.status(500).json({ message: "Failed to evolve plan: " + (error.message || "Unknown error") });
  }
};

