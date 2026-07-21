import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import generateToken from "../utils/generateToken";
import Profile from "../models/Profile";
import Trainer from "../models/Trainer";
import { OAuth2Client } from "google-auth-library";

// Initialize Google OAuth2 client with the environment's client ID.
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Handles user registration via email and password.
 * Checks for existing users, hashes the password, and creates the User record.
 */
export const signup = async (req: Request, res: Response) => {
  try {
    // Extract required fields from the incoming request body.
    const { email, password, name, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Verify that the email is not already registered in the system.
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password for secure storage before creating the user.
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      name,
      password: hashedPassword,
      provider: "local",
      role: role || "learner",
    });

    // Return the created user data along with a generated JWT and default profile flags.
    res.status(201).json({
      message: "User created successfully",
      token: generateToken(user._id.toString()),
      role: user.role,
      name: user.name,
      hasProfile: false,
      hasTrainerProfile: false,
    });
  } catch (error) {
    console.error("[Signup Error]", error);
    res.status(500).json({ message: "Signup failed" });
  }
};

/**
 * Authenticates an existing local user and issues a JWT token.
 * Validates credentials and checks for existing profile/trainer records.
 */
export const login = async (req: Request, res: Response) => {
  try {
    // Extract credentials from the request body.
    const { email, password } = req.body;

    if (!email || !password) {
      console.log("[Login Failed] Missing email or password");
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find the user by email and ensure they registered via local email/password.
    const user = await User.findOne({ email });
    if (!user) {
      console.log("[Login Failed] User not found:", email);
      return res.status(400).json({ message: "Invalid credentials: User not found" });
    }
    if (user.provider !== "local") {
      console.log("[Login Failed] Wrong provider:", user.provider);
      return res.status(400).json({ message: "Invalid credentials: Wrong auth provider" });
    }

    // Compare the provided password against the stored bcrypt hash.
    const isMatch = await bcrypt.compare(
      password,
      user.password as string
    );

    if (!isMatch) {
      console.log("[Login Failed] Password mismatch for:", email);
      return res.status(400).json({ message: "Invalid credentials: Password incorrect" });
    }

    // Check if the user has completed their learner or trainer onboarding profiles.
    const profile = await Profile.findOne({ userId: user._id });
    const trainerProfile = await Trainer.findOne({ userId: user._id });

    // Return auth token and profile presence flags to direct frontend routing.
    res.json({
      token: generateToken(user._id.toString()),
      role: user.role,
      name: user.name,
      hasProfile: !!profile,
      hasTrainerProfile: !!trainerProfile,
    });
  } catch (error) {
    console.error("[Login Error]", error);
    res.status(500).json({ message: "Login failed" });
  }
};

/**
 * Handles authentication via Google OAuth.
 * Verifies the Google ID token and creates or logs in the user automatically.
 */
export const googleAuth = async (req: Request, res: Response) => {
  try {
    // Extract the Google ID token credential from the request body.
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    // Verify the Google token against your application's client ID.
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    // Extract the payload to get user identity details like email and name.
    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    // Extract relevant identifiers from the payload, using 'sub' as the permanent Google ID.
    const { email, sub: googleId, name } = payload;

    // Search for an existing user or create a new Google-provider record.
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        googleId,
        provider: "google",
        role: "learner",
      });
    }

    // Look for associated Profile and Trainer records to inform the frontend onboarding state.
    const profile = await Profile.findOne({ userId: user._id });
    const trainerProfile = await Trainer.findOne({ userId: user._id });

    // Return our application's JWT along with user status flags.
    res.json({
      token: generateToken(user._id.toString()),
      role: user.role,
      name: user.name,
      hasProfile: !!profile,
      hasTrainerProfile: !!trainerProfile,
    });
  } catch (error) {
    console.error("[Google Auth Error]", error);
    res.status(500).json({ message: "Google auth failed" });
  }
};