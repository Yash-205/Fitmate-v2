import mongoose, { Schema, Document } from "mongoose";

export interface ITrainer extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  specialization: string[];
  bio: string;
  certifications: string[];
  experienceYears: number;
  hourlyRate?: number;
  rating: number;
  totalClients: number;
  isActive: boolean;
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
}

const TrainerSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    specialization: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      default: "",
    },
    certifications: {
      type: [String],
      default: [],
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    hourlyRate: {
      type: Number,
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalClients: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    socialLinks: {
      instagram: String,
      linkedin: String,
      twitter: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITrainer>("Trainer", TrainerSchema);
