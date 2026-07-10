import express from "express";
import { getMessages } from "../controllers/messageController";

const router = express.Router();

// GET /api/messages/:userId1/:userId2
router.get("/:userId1/:userId2", getMessages);

export default router;
