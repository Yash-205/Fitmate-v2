import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  /** 'local' or 'google' - helps differentiate auth methods */
  provider: "local" | "google";
  googleId?: string;
  role: "learner" | "trainer" | "admin";
}

/**
 * User Model
 * 
 * Represents a registered user in the system. 
 * Stores core credentials and role information.
 */

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
    },
    role: {
      type: String,
      enum: ["learner", "trainer", "admin"],
      default: "learner",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);