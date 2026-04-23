import { Response } from "express";
import { AuthRequest } from "../types/express";
import Trainer from "../models/Trainer";
import Profile from "../models/Profile";
import User from "../models/User";

// 🔹 Upsert Trainer Profile (Handles both first-time "promotion" and subsequent updates)
// This is the core of our "Persona-based" architecture. A user starts as a learner,
// and by calling this, they "activate" their Trainer persona.
export const upsertTrainerProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, specialization, bio, certifications, experienceYears, hourlyRate, socialLinks } = req.body;

    // 1. Create or Update the Trainer professional document
    const trainer = await Trainer.findOneAndUpdate(
      { userId: req.userId },
      {
        fullName,
        specialization,
        bio,
        certifications,
        experienceYears,
        hourlyRate,
        socialLinks,
      },
      { new: true, upsert: true }
    );

    // 2. Role Transition Logic:
    // If the user was a learner, promote them to trainer status.
    // This unlocks trainer-specific dashboards and capabilities across the app.
    await User.findByIdAndUpdate(req.userId, { role: "trainer" });

    res.status(200).json({
      message: "Trainer profile successfully updated and role promoted.",
      trainer,
    });
  } catch (error) {
    console.error("[Upsert Trainer Profile Error]", error);
    res.status(500).json({ message: "Failed to update trainer profile" });
  }
};

// 🔹 Get Own Trainer Profile
export const getTrainerProfile = async (req: AuthRequest, res: Response) => {
  try {
    const trainer = await Trainer.findOne({ userId: req.userId });
    if (!trainer) {
      return res.status(404).json({ message: "Trainer profile not found" });
    }
    res.status(200).json(trainer);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trainer profile" });
  }
};

// 🔹 Get Assigned Clients
export const getClients = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Missing user ID" });
    }

    const trainer = await Trainer.findOne({ userId });
    if (!trainer) {
      return res.status(404).json({ message: "Trainer profile not found" });
    }

    // Fetch clients assigned to this trainer
    const clients = await Profile.find({ trainerId: trainer._id }).lean();

    res.status(200).json(clients || []);
  } catch (error) {
    console.error("[getClients Error]", error);
    res.status(500).json({ message: "Failed to fetch clients" });
  }
};

// 🔹 Discovery: Get All Active Trainers
export const getDiscoveryList = async (req: AuthRequest, res: Response) => {
  try {
    const trainers = await Trainer.find({ isActive: true }).select("-userId -createdAt -updatedAt");
    res.status(200).json(trainers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trainer list" });
  }
};
