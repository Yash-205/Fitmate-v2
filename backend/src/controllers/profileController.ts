import { Response } from "express";
import Profile from "../models/Profile";
import { AuthRequest } from "../types/express";

// 🔹 Create or Update Profile
export const upsertProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const { age, weight, height, goal, diet, activityLevel } = req.body;

    let profile = await Profile.findOne({ userId });

    if (profile) {
      // update existing profile
      profile = await Profile.findOneAndUpdate(
        { userId },
        { age, weight, height, goal, diet, activityLevel },
        { new: true }
      );
    } else {
      // create new profile
      profile = await Profile.create({
        userId,
        age,
        weight,
        height,
        goal,
        diet,
        activityLevel,
      });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Profile save failed" });
  }
};

// 🔹 Get Profile
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};