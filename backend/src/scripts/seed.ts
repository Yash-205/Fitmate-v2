import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import connectDB from "../config/db";
import User, { IUser } from "../models/User";
import Trainer from "../models/Trainer";
import Profile from "../models/Profile";
import WorkoutPlan from "../models/WorkoutPlan";

/**
 * FitMate Database Seeder
 * 
 * This script populates the database with a set of demo trainers and users.
 * It ensures that the app has immediate, high-quality content for testing.
 */

dotenv.config();

const seed = async () => {
  try {
    // 1. Initialize connection
    await connectDB();
    console.log("🌱 Starting Database Seeding...");

    // 2. Clear existing collections
    console.log("🧹 Clearing existing data...");
    await User.deleteMany({});
    await Trainer.deleteMany({});
    await Profile.deleteMany({});
    await WorkoutPlan.deleteMany({});

    // 3. Helper: Create User with Hashed Password
    const createHashedUser = async (email: string, name: string, role: "learner" | "trainer" | "admin") => {
      const hashedPassword = await bcrypt.hash("Password123!", 10);
      return await User.create({
        email,
        name,
        password: hashedPassword,
        role,
        provider: "local"
      }) as unknown as IUser;
    };

    // ────────────────────────────────────────────────────────────────
    // STEP 1: CREATE PROFESSIONAL TRAINERS
    // ────────────────────────────────────────────────────────────────
    console.log("🏋️ Creating Demo Trainers...");

    // Coach Sarah
    const sarahUser = await createHashedUser("coach_sarah@fitmate.ai", "Sarah Strength", "trainer");
    const sarahProfile = await Trainer.create({
      userId: sarahUser._id,
      fullName: "Sarah Strength",
      specialization: ["Powerlifting", "Strength Training"],
      bio: "Certified CSCS with 8 years of experience. I focus on technical precision and progressive overload.",
      certifications: ["CSCS", "NASM-CPT"],
      experienceYears: 8,
      hourlyRate: 85,
      rating: 4.9,
      totalClients: 124,
      socialLinks: { instagram: "@sarah_lifts" }
    });

    // Coach Mike
    const mikeUser = await createHashedUser("coach_mike@fitmate.ai", "Mike Cardio", "trainer");
    const mikeProfile = await Trainer.create({
      userId: mikeUser._id,
      fullName: "Mike Cardio",
      specialization: ["HIIT", "Weight Loss"],
      bio: "High energy, high impact. torch fat and build metabolic conditioning.",
      certifications: ["NASM-CPT"],
      experienceYears: 5,
      hourlyRate: 65,
      rating: 4.8,
      totalClients: 89,
      socialLinks: { twitter: "@mike_hiit" }
    });

    // Coach Elena
    const elenaUser = await createHashedUser("coach_elena@fitmate.ai", "Elena Flow", "trainer");
    const elenaProfile = await Trainer.create({
      userId: elenaUser._id,
      fullName: "Elena Flow",
      specialization: ["Yoga", "Mobility"],
      bio: "Balance is everything. mobility science meets traditional yoga.",
      certifications: ["RYT-500"],
      experienceYears: 10,
      hourlyRate: 95,
      rating: 5.0,
      totalClients: 210,
      socialLinks: { instagram: "@elena_zen" }
    });

    // ────────────────────────────────────────────────────────────────
    // STEP 2: CREATE SAMPLE ATHLETES
    // ────────────────────────────────────────────────────────────────
    console.log("🏃 Creating Demo Athletes...");

    // Athlete 1 (Connected to Sarah)
    const testAthleteUser = await createHashedUser("test_athlete@fitmate.ai", "John Athlete", "learner");
    await Profile.create({
      userId: testAthleteUser._id,
      age: 28,
      gender: "Male",
      weight: 78,
      height: 182,
      goal: "Build lean muscle and improve squat depth.",
      trainingExperience: "Intermediate (1-3 years)",
      availableDays: 4,
      sessionDuration: 60,
      sleepQuality: "Good",
      stressLevel: "Moderate",
      diet: "High Protein",
      trainerId: sarahProfile._id
    });

    // Athlete 2 (Unconnected)
    const demoUser = await createHashedUser("demo_user@fitmate.ai", "Demo User", "learner");
    await Profile.create({
      userId: demoUser._id,
      age: 34,
      gender: "Female",
      weight: 68,
      height: 165,
      goal: "Lose 5kg and improve cardio.",
      trainingExperience: "Beginner (<1 year)",
      availableDays: 3,
      sessionDuration: 45,
      sleepQuality: "Average",
      stressLevel: "High",
      diet: "Balanced",
    });

    console.log("✅ Seeding Completed Successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Failed:", error);
    process.exit(1);
  }
};

seed();
