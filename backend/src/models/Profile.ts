import mongoose, { Schema, Document } from "mongoose";

// ─────────────────────────────────────────────────────────
// Profile — Client Assessment Data (Coach's intake form)
// Based on: Assessment Phase from professional trainer workflow
// ─────────────────────────────────────────────────────────

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;

  // Physical baseline
  age: number;
  gender: string;
  weight: number;
  height: number;

  // Goal definition (most critical variable)
  goal: string;

  // Training background (training age)
  trainingExperience: string;   // Beginner (<1yr) / Intermediate (1-3yr) / Advanced (3+yr)

  // Injury / limitations
  injuries: string;            // free text, optional

  // Lifestyle constraints
  availableDays: number;       // training days per week (3-6)
  sessionDuration: number;     // minutes per session (30-120)
  sleepQuality: string;        // Good / Average / Poor
  stressLevel: string;         // Low / Moderate / High

  // Nutrition baseline
  diet: string;                // Vegetarian / Vegan / Standard / etc.

  // Assignment
  trainerId?: mongoose.Types.ObjectId;
}

const ProfileSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Physical baseline
  age: Number,
  gender: String,
  weight: Number,
  height: Number,

  // Goal
  goal: String,

  // Training background
  trainingExperience: String,

  // Injuries
  injuries: String,

  // Lifestyle
  availableDays: Number,
  sessionDuration: Number,
  sleepQuality: String,
  stressLevel: String,

  // Nutrition
  diet: String,

  // Assignment
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trainer",
  },
});

export default mongoose.model<IProfile>("Profile", ProfileSchema);