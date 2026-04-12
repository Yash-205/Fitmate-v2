import mongoose, { Schema, Document } from "mongoose";

export interface IChatSession extends Document {
  userId: mongoose.Types.ObjectId;
  threadId: string;
  title: string;
  updatedAt: Date;
}

const ChatSessionSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  threadId: { type: String, required: true },
  title: { type: String, required: true, default: "New Chat" },
}, { timestamps: true });

export default mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);
