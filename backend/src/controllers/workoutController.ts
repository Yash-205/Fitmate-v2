import { Request, Response } from "express";
import WorkoutPlan from "../models/WorkoutPlan";
import Profile from "../models/Profile";
import { ChatGroq } from "@langchain/groq";
import { z } from "zod";

// Schema for structured AI response
const ExerciseSchema = z.object({
  name: z.string().describe("Name of the exercise"),
  sets: z.number().describe("Number of sets"),
  reps: z.string().describe("Rep range (e.g. '8-12', 'to failure', '15')"),
  notes: z.string().optional().describe("Any tip or form instruction"),
});

const DayPlanSchema = z.object({
  day: z.string().describe("Name of the day (e.g. 'Day 1', 'Day 2')"),
  focus: z.string().describe("Focus of the day (e.g. 'Chest & Triceps', 'Lower Body', 'Rest & Mobility')"),
  dailyObjective: z.string().describe("What is the specific goal for this day? (e.g., 'Focus on deep mind-muscle connection during lateral raises', 'Active recovery with light stretching')"),
  exercises: z.array(ExerciseSchema).describe("List of exercises for this day"),
});

const WorkoutPlanGeneratorSchema = z.object({
  goal: z.string().describe("The user's overarching fitness goal (e.g., 'Hypertrophy & Fat Loss')"),
  splitType: z.string().describe("The type of split (e.g. '4-Day Upper/Lower Split')"),
  overarchingStrategy: z.string().describe("A professional thesis statement explaining *why* this plan was chosen based on their exact metrics and experience level."),
  weeklyGoal: z.string().describe("The primary milestone to focus on for this immediate first week (e.g., 'Prioritize form and mobility before adding weight')."),
  schedule: z.array(DayPlanSchema).describe("The detailed structured schedule per workout day"),
});

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

// Generate a new workout plan using AI
export const generateWorkoutPlan = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    // 1. Get user profile
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(400).json({ message: "Profile incomplete. Please set up your profile first." });
    }
    
    // 2. Setup Groq Model with structured output
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile", // Use a big model for structured output
      temperature: 0.5,
    });
    
    const structuredModel = model.withStructuredOutput(WorkoutPlanGeneratorSchema, { name: "workout_plan" });
    
    // 3. Generate Workout
    const prompt = `
      You are a world-class, elite fitness coach. Generate a highly effective, personalized weekly workout plan.
      
      User Profile:
      - Age: ${profile.age}
      - Weight: ${profile.weight} kg
      - Height: ${profile.height} cm
      - Goal: ${profile.goal}
      - Diet Status/Preference: ${profile.diet}
      - Activity/Experience Level: ${profile.activityLevel}
      
      REQUIREMENTS:
      1. Create a strict 7-Day split (Day 1 through Day 7) tailored to their experience level. Do not output more or less than 7 days.
      2. Provide an 'overarchingStrategy' explaining to the user exactly *why* this split is best for their body and goal.
      3. Set a 'weeklyGoal' that they should focus on for this starting week.
      4. For EVERY day (even rest days), give a 'dailyObjective' explaining what they should achieve or feel that day.
    `;
    
    const aiResponse = await structuredModel.invoke(prompt);
    
    // Mathematically inject real chronological dates for the next 7 days
    const today = new Date();
    const scheduleWithDates = aiResponse.schedule.map((dayPlan: any, index: number) => {
      const planDate = new Date(today);
      planDate.setDate(today.getDate() + index); // Add days for chronological timeline
      return {
        ...dayPlan,
        date: planDate
      };
    });
    
    // 4. Save to Database
    await WorkoutPlan.deleteMany({ userId });
    
    const newPlan = await WorkoutPlan.create({
      userId,
      goal: aiResponse.goal,
      splitType: aiResponse.splitType,
      overarchingStrategy: aiResponse.overarchingStrategy,
      weeklyGoal: aiResponse.weeklyGoal,
      schedule: scheduleWithDates,
    });
    
    res.status(201).json(newPlan);
  } catch (error: any) {
    console.error("Generate error:", error);
    res.status(500).json({ message: "Failed to generate: " + (error.message || "Unknown error") });
  }
};
