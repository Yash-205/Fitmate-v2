import mongoose, { Schema, Document } from "mongoose";

export interface IExercise {
  name: string;
  sets: number;
  reps: string;
  notes?: string;
}

export interface IDayPlan {
  day: string;
  date: Date;
  focus: string;
  dailyObjective: string;
  exercises: IExercise[];
}

export interface IWorkoutPlan extends Document {
  userId: mongoose.Types.ObjectId;
  goal: string;
  splitType: string;
  overarchingStrategy: string;
  weeklyGoal: string;
  schedule: IDayPlan[];
  createdAt: Date;
}

const WorkoutPlanSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  goal: { type: String, required: true },
  splitType: { type: String, required: true },
  overarchingStrategy: { type: String, required: true },
  weeklyGoal: { type: String, required: true },
  schedule: [
    {
      day: { type: String, required: true },
      date: { type: Date, required: true },
      focus: { type: String, required: true },
      dailyObjective: { type: String, required: true },
      exercises: [
        {
          name: { type: String, required: true },
          sets: { type: Number, required: true },
          reps: { type: String, required: true },
          notes: { type: String },
        },
      ],
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IWorkoutPlan>("WorkoutPlan", WorkoutPlanSchema);
