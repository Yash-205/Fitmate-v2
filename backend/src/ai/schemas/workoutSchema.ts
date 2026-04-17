import { z } from "zod";

export const ExerciseSchema = z.object({
  name: z.string().describe("Exercise name"),
  sets: z.number().describe("Sets count"),
  reps: z.string().describe("Reps (e.g. '8-12')"),
  intensity: z.string().optional().describe("Intensity (e.g. 'RPE 8')"),
  notes: z.string().optional().describe("Short coaching tips"),
});

export const DayPlanSchema = z.object({
  day: z.string().describe("e.g. 'Day 1'"),
  focus: z.string().describe("Training focus (e.g. 'Upper Body')"),
  isRestDay: z.boolean().describe("true if recovery day"),
  dailyObjective: z.string().optional().describe("Today's main goal"),
  warmup: z.array(ExerciseSchema).optional().describe("Preparation movements"),
  exercises: z.array(ExerciseSchema).describe("Main training exercises"),
  cooldown: z.array(ExerciseSchema).optional().describe("Mobility work"),
});

export const MesoPhaseSchema = z.object({
  name: z.string().describe("Phase name"),
  goal: z.string().describe("Phase goal"),
  focus: z.string().describe("Phase focus"),
  durationWeeks: z.number().describe("Duration in weeks"),
});

export const StrategyGeneratorSchema = z.object({
  goal: z.string().describe("Main fitness goal"),
  splitType: z.string().describe("Strategy split type"),
  experienceLevel: z.string().describe("Beginner/Intermediate/Advanced"),
  overarchingStrategy: z.string().describe("Professional rationale for this plan"),
  weeklyFrequency: z.number().describe("Days per week"),
  mesoPhases: z.array(MesoPhaseSchema).min(3).describe("Complete roadmap"),
});

export const MicrocycleGeneratorSchema = z.object({
  currentPhase: z.string().describe("Active phase name"),
  schedule: z.array(DayPlanSchema).length(7).describe("Exactly 7-day schedule"),
  progressionRule: z.string().describe("Week-over-week progress rule"),
  deloadStrategy: z.string().describe("Recovery strategy"),
});

