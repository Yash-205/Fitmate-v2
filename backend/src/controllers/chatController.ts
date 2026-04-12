import { Response } from "express";
import { AuthRequest } from "../types/express";
import Profile from "../models/Profile";
import ChatSession from "../models/ChatSession";
import { runAgent, getAgentHistory } from "../ai/agent";

export const chat = async (req: AuthRequest, res: Response) => {
  try {
    const { message, threadId: providedThreadId } = req.body;

    const profile = await Profile.findOne({ userId: req.userId });
    if (!profile) {
      return res.status(400).json({ message: "Profile not found" });
    }

    let threadId = providedThreadId;
    if (!threadId) {
      threadId = "thread_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
      await ChatSession.create({
        userId: req.userId,
        threadId,
        title: message.substring(0, 30) + (message.length > 30 ? "..." : "")
      });
    } else {
      await ChatSession.findOneAndUpdate({ threadId, userId: req.userId }, { updatedAt: new Date() });
    }

    const reply = await runAgent(message, profile, threadId);

    res.json({ reply, threadId });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ message: "Chat failed: " + err.message });
  }
};

export const getSessions = async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await ChatSession.find({ userId: req.userId }).sort({ updatedAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
};

export const getHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { threadId } = req.params;
    
    // verify ownership
    const session = await ChatSession.findOne({ threadId, userId: req.userId });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // load from LangGraph
    const messages = await getAgentHistory(threadId as string);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
};