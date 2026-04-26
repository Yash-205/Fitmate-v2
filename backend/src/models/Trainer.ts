import mongoose, { Schema, Document } from "mongoose";

/**
 * Trainer Model
 * 
 * Stores professional details for users who have opted into the Trainer persona.
 * Contains specialization, certifications, and business-related fields.
 */

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
