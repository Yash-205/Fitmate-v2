import { z } from "zod";

export const ExerciseSchema = z.object({
  name: z.string().describe("Exercise name (e.g. 'Barbell Bench Press')"),
  sets: z.number().describe("Number of sets (e.g. 3, 4)"),
  reps: z.string().describe("Rep range as a string (e.g. '8-12', '15', 'to failure')"),
  intensity: z.string().optional().describe("Intensity guidance — RPE or percentage (e.g. 'RPE 7', '70% 1RM')"),
  notes: z.string().optional().describe("Form cues, rest time, or coaching tips (e.g. 'Rest 90s between sets. Keep back flat.')"),
});

export const DayPlanSchema = z.object({
  day: z.string().describe("Day label (e.g. 'Day 1', 'Day 2')"),
  focus: z.string().describe("REQUIRED. Training focus for this day (e.g. 'Full Body A', 'Upper Body', 'Rest & Recovery')"),
  isRestDay: z.boolean().describe("true if this is a rest/recovery day, false if it is a training day"),
  dailyObjective: z.string().optional().describe("Specific training objective (omit for rest days)"),
  warmup: z.array(ExerciseSchema).optional().describe("3-4 light movements to prepare for the main work. (Omit for rest days)"),
  exercises: z.array(ExerciseSchema).describe("Array of main training exercises. MUST be empty [] for rest days."),
  cooldown: z.array(ExerciseSchema).optional().describe("2-3 mobility or low-intensity movements to finish. (Omit for rest days)"),
});

export const MesoPhaseSchema = z.object({
  name: z.string().describe("Phase name (e.g. 'Phase 1: Foundation Building')"),
  goal: z.string().describe("What this phase aims to achieve (e.g. 'Build base strength and movement quality')"),
  focus: z.string().describe("Training focus of this mesocycle (e.g. 'Compound movement proficiency, hypertrophy base')"),
  durationWeeks: z.number().describe("Duration of this phase in weeks (e.g. 4, 6, 8)"),
});

export const StrategyGeneratorSchema = z.object({
  goal: z.string().describe("The user's overarching fitness goal"),
  splitType: z.string().describe("Training split (e.g. 'Full Body', 'Upper/Lower', 'Push/Pull/Legs')"),
  experienceLevel: z.string().describe("User's training level: 'Beginner', 'Intermediate', or 'Advanced'"),
  overarchingStrategy: z.string().describe("Professional rationale explaining WHY this periodization strategy fits this user's profile, goal, and experience level"),
  weeklyFrequency: z.number().describe("Number of training days per week (e.g. 3, 4, 5)"),
  mesoPhases: z.array(MesoPhaseSchema).min(3).describe("Complete chronological roadmap of ALL mesocycle phases. Minimum 3 phases."),
});

export const MicrocycleGeneratorSchema = z.object({
  currentPhase: z.string().describe("The name string of the currently active mesocycle phase"),
  schedule: z.array(DayPlanSchema).length(7).describe("Exactly 7-day microcycle (one week). Must include rest days with isRestDay=true and empty exercises array."),
  progressionRule: z.string().describe("How the user should progress week-over-week (e.g. 'Add 2.5kg to compounds weekly, add 1 rep to isolations')"),
  deloadStrategy: z.string().describe("When and how to deload (e.g. 'Every 4th week: reduce volume by 40%, keep intensity at RPE 6')"),
});

