import mongoose, { Schema, Document } from "mongoose";

/**
 * WorkoutPlan Model
 * 
 * The core data structure for the AI-generated fitness programs.
 * It contains a Strategic Roadmap (mesoPhases) and a tactical Weekly Schedule (schedule).
 * This schema mirrors the Zod validation schemas used in the AI generation nodes.
 */

export interface IExercise {
  name: string;
  sets: number;
  reps: string;
  intensity?: string;
  notes?: string;
}

export interface IDayPlan {
  day: string;
  date: Date;           // injected by controller, not by AI
  focus: string;
  isRestDay: boolean;
  dailyObjective?: string;
  warmup?: IExercise[];
  exercises: IExercise[];
  cooldown?: IExercise[];
}

export interface IMesoPhase {
  name: string;
  goal: string;
  focus: string;
  durationWeeks: number;
  startDate: Date;      // injected by controller
  endDate: Date;        // injected by controller
}

export interface IWorkoutPlan extends Document {
  userId: mongoose.Types.ObjectId;
  goal: string;
  splitType: string;
  experienceLevel: string;
  overarchingStrategy: string;
  currentPhase: string;
  weeklyFrequency: number;
  mesoPhases: IMesoPhase[];
  schedule: IDayPlan[];
  progressionRule: string;
  deloadStrategy: string;
  completedDays: number;
  createdAt: Date;
}

// ─────────────────────────────────────────────────────────
// MONGOOSE SCHEMA — Dumb mirror of Zod. No extra required.
// Zod is the validation layer. Mongoose just stores.
// ─────────────────────────────────────────────────────────

const WorkoutPlanSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  goal: { type: String },
  splitType: { type: String },
  experienceLevel: { type: String },
  overarchingStrategy: { type: String },
  currentPhase: { type: String },
  weeklyFrequency: { type: Number },
  mesoPhases: [
    {
      _id: false,
      name: { type: String },
      goal: { type: String },
      focus: { type: String },
      durationWeeks: { type: Number },
      startDate: { type: Date },
      endDate: { type: Date },
    }
  ],
  schedule: [
    {
      _id: false,
      day: { type: String },
      date: { type: Date },
      focus: { type: String },
      isRestDay: { type: Boolean },
      dailyObjective: { type: String },
      warmup: [
        {
          _id: false,
          name: { type: String },
          sets: { type: Number },
          reps: { type: String },
          intensity: { type: String },
          notes: { type: String },
        },
      ],
      exercises: [
        {
          _id: false,
          name: { type: String },
          sets: { type: Number },
          reps: { type: String },
          intensity: { type: String },
          notes: { type: String },
        },
      ],
      cooldown: [
        {
          _id: false,
          name: { type: String },
          sets: { type: Number },
          reps: { type: String },
          intensity: { type: String },
          notes: { type: String },
        },
      ],
    },
  ],
  progressionRule: { type: String },
  deloadStrategy: { type: String },
  completedDays: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IWorkoutPlan>("WorkoutPlan", WorkoutPlanSchema);
