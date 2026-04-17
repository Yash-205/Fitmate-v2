import { Response } from "express";
import Profile from "../models/Profile";
import { AuthRequest } from "../types/express";
import { getMem0Client } from "../ai/memory/mem0Service";
import { runStrategyAgent } from "../ai/graphs/strategyGraph";
import WorkoutPlan from "../models/WorkoutPlan";

// 🔹 Create or Update Profile
export const upsertProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

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

    let profile = await Profile.findOne({ userId });

    if (profile) {
      profile = await Profile.findOneAndUpdate(
        { userId },
        profileData,
        { new: true }
      );
    } else {
      profile = await Profile.create({
        userId,
        ...profileData,
      });
    }

    // Sync foundational data to LTM (Fire & Forget)
    try {
      const mem0 = getMem0Client();
      const baselineContext = `User Baseline Assessment:
Goal: ${goal}
Metrics: ${age} years old, ${gender}, ${weight}kg, ${height}cm.
Training Age/Experience: ${trainingExperience}.
Limitations/Injuries: ${injuries || "None"}.
Availability: ${availableDays} days/week, ${sessionDuration} mins/session.
Lifestyle/Readiness: Sleep (${sleepQuality}), Stress (${stressLevel}), Diet (${diet}).`;

      const memoryUpdate = [
        {
          role: "user" as const,
          content: baselineContext
        }
      ];
      mem0.add(memoryUpdate, { user_id: String(userId) }).catch(e => console.error("Mem0 add error during profile upsert:", e));
    } catch (err) {
      console.error("Mem0 storage error initiation in profile upsert:", err);
    }

    // Phase 1: Generate Strategic Roadmap (Fire & Forget or Await?)
    // We'll await it so the user sees it immediately on the next page
    try {
      
      if (!userId) throw new Error("Unauthorized: User ID missing");
      const strategy = await runStrategyAgent(profile, userId);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let currentMarkerDate = new Date(today);
      
      const phasesWithDates = strategy.mesoPhases.map((phase: any) => {
        const start = new Date(currentMarkerDate);
        const end = new Date(currentMarkerDate);
        end.setDate(end.getDate() + (phase.durationWeeks * 7));
        currentMarkerDate = new Date(end);
        return { ...phase, startDate: start, endDate: end };
      });

      await WorkoutPlan.findOneAndUpdate(
        { userId },
        {
          goal: strategy.goal,
          splitType: strategy.splitType,
          experienceLevel: strategy.experienceLevel,
          overarchingStrategy: strategy.overarchingStrategy,
          weeklyFrequency: strategy.weeklyFrequency,
          mesoPhases: phasesWithDates,
          currentPhase: strategy.mesoPhases[0]?.name,
          schedule: [], // Reset schedule to force new microcycle generation
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error("Strategy generation failed during profile upsert:", err);
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