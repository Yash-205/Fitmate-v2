import { Request, Response } from "express";
import { runEvolutionAgent } from "../ai/graphs/evolutionGraph";
import { runStrategyAgent } from "../ai/graphs/strategyGraph";
import { generateMicrocycle } from "../ai/nodes/workoutGenerator";
import WorkoutPlan from "../models/WorkoutPlan";
import Profile from "../models/Profile";

/**
 * Workout Controller
 * 
 * Manages the generation, retrieval, and evolution of personalized workout plans.
 * Leverages AI agents for strategic roadmapping (StrategyAgent) and 
 * iterative plan adjustment based on feedback (EvolutionAgent).
 */

/**
 * @desc    Fetch current user's workout plan
 * @route   GET /api/workout
 * @access  Private
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
 * @desc    Generate a new plan or evolve an existing one based on feedback
 * @route   POST /api/workout
 * @access  Private
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
    
    let updatedPlanData;

    if (!existingPlan) {
      // FOUNDATION FLOW: User has no plan yet. Generate everything from scratch.
      console.log(`[Controller] No existing plan for User ${userId}. Starting Foundation Flow...`);
      const strategy = await runStrategyAgent(profile, userId);
      // For initial run, we assume feedback is null or the strategy handles it
      updatedPlanData = await generateMicrocycle({ 
        profile, 
        userId, 
        currentMeso: strategy.mesoPhases[0],
        finalPlan: { ...strategy, userId, schedule: [] }, 
        feedback: null,
        strategyNeeded: true 
      });
    } else {
      // EVOLUTION FLOW: tweak existing plan
      updatedPlanData = await runEvolutionAgent(
        profile, 
        userId, 
        existingPlan.toObject(), 
        feedback
      );
    }

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

