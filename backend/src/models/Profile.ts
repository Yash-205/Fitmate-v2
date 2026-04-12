import mongoose, { Schema, Document } from "mongoose";

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  age: number;
  weight: number;
  height: number;
  goal: string;
  diet: string;
  activityLevel: string;
}

const ProfileSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // links to User model
    required: true,
  },
  age: Number,
  weight: Number,
  height: Number,
  goal: String, // muscle gain / fat loss
  diet: String, // veg / non-veg
  activityLevel: String, // low / medium / high
});

export default mongoose.model<IProfile>("Profile", ProfileSchema);