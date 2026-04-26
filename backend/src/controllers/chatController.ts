import { Response } from "express";
import { randomUUID } from "crypto";
import { AuthRequest } from "../types/express";
import Profile from "../models/Profile";
import ChatSession from "../models/ChatSession";
import { streamAgent, getAgentHistory } from "../ai/graphs/chatGraph";

/**
 * Chat Controller
 * 
 * Manages AI-powered chat sessions, including streaming responses and session history.
 */

/**
 * @desc    Stream chat response from AI agent
 * @route   POST /api/chat
 * @access  Private
 */
export const chat = async (req: AuthRequest, res: Response) => {
  try {
    const { message, threadId: providedThreadId } = req.body;

    const profile = await Profile.findOne({ userId: req.userId });
    if (!profile) {
      return res.status(400).json({ message: "Profile not found" });
    }

    let threadId = providedThreadId;
    if (!threadId) {
      threadId = "thread_" + randomUUID();
      await ChatSession.create({
        userId: req.userId,
        threadId,
        title: message.substring(0, 30) + (message.length > 30 ? "..." : "")
      });
    } else {
      await ChatSession.findOneAndUpdate({ threadId, userId: req.userId }, { updatedAt: new Date() });
    }

    // Prepare SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const eventStream = await streamAgent(message, profile, threadId);
    
    for await (const event of eventStream) {
      if (event.event === "on_chat_model_stream") {
        const chunk = event.data?.chunk?.content;
        if (chunk) {
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
      }
    }

    res.write(`data: ${JSON.stringify({ done: true, threadId })}\n\n`);
    res.end();
  } catch (err: any) {
    console.error("Streaming error:", err);
    // If headers already sent, we can't send status 500
    if (!res.headersSent) {
      res.status(500).json({ message: "Chat failed: " + err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
};

/**
 * @desc    Get all chat sessions for the authenticated user
 * @route   GET /api/chat/sessions
 * @access  Private
 */
export const getSessions = async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await ChatSession.find({ userId: req.userId }).sort({ updatedAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
};

/**
 * @desc    Get message history for a specific thread
 * @route   GET /api/chat/history/:threadId
 * @access  Private
 */
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