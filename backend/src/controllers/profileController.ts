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

    // Phase 1: Generate Strategic Roadmap
    try {
      if (!userId) throw new Error("Unauthorized: User ID missing");
      console.log(`[Profile] Triggering baseline strategy for User ${userId}...`);
      
      const strategy = await runStrategyAgent(profile, userId);
      
      if (!strategy || !strategy.mesoPhases) {
        throw new Error("AI failed to return mesoPhases for strategy.");
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let currentMarkerDate = new Date(today);
      
      const phasesWithDates = strategy.mesoPhases.map((phase: any) => {
        const start = new Date(currentMarkerDate);
        const end = new Date(currentMarkerDate);
        // Correct date range (end of the week is start + 7days - 1)
        end.setDate(end.getDate() + (phase.durationWeeks * 7) - 1);
        
        // Next phase starts the day after this one ends
        currentMarkerDate = new Date(end);
        currentMarkerDate.setDate(end.getDate() + 1);
        
        return { ...phase, startDate: start, endDate: end };
      });

      await WorkoutPlan.findOneAndUpdate(
        { userId },
        {
          $set: {
            goal: strategy.goal,
            splitType: strategy.splitType,
            experienceLevel: strategy.experienceLevel,
            overarchingStrategy: strategy.overarchingStrategy,
            weeklyFrequency: strategy.weeklyFrequency,
            mesoPhases: phasesWithDates,
            currentPhase: strategy.mesoPhases[0]?.name,
            schedule: [], // Force new microcycle on first visit
            userId: userId
          }
        },
        { upsert: true, new: true }
      );
      console.log(`[Profile] Strategy successfully generated and saved for User ${userId}.`);
    } catch (err) {
      console.error("Strategy generation failed during profile upsert:", err);
      // We don't throw here - we want the profile save to succeed even if AI is slow
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