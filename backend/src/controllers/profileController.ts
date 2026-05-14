import { Response } from "express";
import mongoose from "mongoose";
import Profile from "../models/Profile";
import { AuthRequest } from "../types/express";
import { getMem0Client } from "../ai/memory/mem0Service";
import { runStrategyAgent } from "../ai/graphs/strategyGraph";
import WorkoutPlan from "../models/WorkoutPlan";

/**
 * Profile Controller
 */

export const upsertProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const {
      age, gender, weight, height,
      goal, trainingExperience, injuries,
      availableDays, sessionDuration, sleepQuality, stressLevel,
      diet
    } = req.body;

    const profileData = {
      age, gender, weight, height,
      goal, trainingExperience, injuries,
      availableDays, sessionDuration, sleepQuality, stressLevel,
      diet
    };

    // Explicitly cast to ObjectId to ensure query consistency
    const userObjectId = new mongoose.Types.ObjectId(String(userId));

    let profile = await Profile.findOne({ userId: userObjectId });

    if (profile) {
      profile = await Profile.findOneAndUpdate(
        { userId: userObjectId },
        profileData,
        { new: true }
      );
    } else {
      profile = await Profile.create({
        userId: userObjectId,
        ...profileData,
      });
    }

    // Mem0 Sync (Fire & Forget)
    try {
      const mem0 = getMem0Client();
      const memoryUpdate = [{
        role: "user" as const,
        content: `User Profile Update: Goal is ${goal}, ${age}yo ${gender}, ${weight}kg.`
      }];
      mem0.add(memoryUpdate, { user_id: String(userId) }).catch(e => console.error("Mem0 error:", e));
    } catch (e) {}

    // Strategy Agent
    try {
      const strategy = await runStrategyAgent(profile, userId);
      if (strategy && strategy.mesoPhases) {
        await WorkoutPlan.findOneAndUpdate(
          { userId: userObjectId },
          { $set: { ...strategy, userId: userObjectId } },
          { upsert: true }
        );
      }
    } catch (e) {
      console.error("Strategy generation failed:", e);
    }

    res.json(profile);
  } catch (error) {
    console.error("Upsert error:", error);
    res.status(500).json({ message: "Profile save failed" });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const userObjectId = new mongoose.Types.ObjectId(String(userId));
    console.log(`[Debug] Searching for Profile with userId (ObjectId): ${userObjectId}`);

    const profile = await Profile.findOne({ userId: userObjectId });
    
    if (!profile) {
      const allProfiles = await Profile.find({});
      console.log(`[Debug] 404! Found ${allProfiles.length} total profiles in DB.`);
      console.log(`[Debug] All Profile userIds in DB:`, allProfiles.map(p => p.userId.toString()));
      return res.status(404).json({ message: "Profile not found" });
    }
    
    res.json(profile);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/**
 * @desc    Connect a user to a specific trainer
 * @route   POST /api/profile/select-trainer/:trainerId
 * @access  Private
 */
export const selectTrainer = async (req: AuthRequest, res: Response) => {
  try {
    const { trainerId } = req.params;
    const userId = req.userId;

    if (!trainerId) {
      return res.status(400).json({ message: "Trainer ID is required" });
    }

    const profile = await Profile.findOneAndUpdate(
      { userId },
      { trainerId },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ message: "Successfully connected to trainer", profile });
  } catch (error) {
    res.status(500).json({ message: "Failed to connect to trainer" });
  }
};