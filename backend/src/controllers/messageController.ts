import { Request, Response } from "express";
import DirectMessage from "../models/DirectMessage";

export const getMessages = async (req: Request, res: Response) => {
    try {
        const { userId1, userId2 } = req.params;
        
        const messages = await DirectMessage.find({
            $or: [
                { senderId: userId1, receiverId: userId2 },
                { senderId: userId2, receiverId: userId1 }
            ]
        }).sort({ timestamp: 1, createdAt: 1 }); // Sort oldest to newest
        
        res.json(messages);
    } catch (err) {
        console.error("Message Fetch Error:", err);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};
