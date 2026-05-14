import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import generateToken from "../utils/generateToken";
import Profile from "../models/Profile";
import Trainer from "../models/Trainer";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Authentication Controller
 * 
 * Handles user registration, login, and external authentication (Google).
 * 
 * --- THE PROVIDER FIELD ---
 * What: The 'provider' field in the User model identifies the source of the authentication.
 * Values: 'local' (email/password) or 'google' (Google OAuth).
 * 
 * Why: 
 * 1. Security: It prevents "account takeover" via credential stuffing. For example, if a user 
 *    signed up via Google, they don't have a password. Checking 'provider !== local' ensures 
 *    that someone can't log in using just the email through the standard login form.
 * 2. Logic Routing: Different providers may require different validation steps or store 
 *    different identifiers (like googleId).
 */

/**
 * @desc    Register a new user (Local)
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      name,
      password: hashedPassword,
      provider: "local",
      role: role || "learner",
    });

    res.status(201).json({
      message: "User created successfully",
      token: generateToken(user._id.toString()),
      role: user.role,
      name: user.name,
    });
  } catch (error) {
    console.error("[Signup Error]", error);
    res.status(500).json({ message: "Signup failed" });
  }
};

/**
 * @desc    Authenticate user & get token (Local)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log("[Login Failed] Missing email or password");
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("[Login Failed] User not found:", email);
      return res.status(400).json({ message: "Invalid credentials: User not found" });
    }
    if (user.provider !== "local") {
      console.log("[Login Failed] Wrong provider:", user.provider);
      return res.status(400).json({ message: "Invalid credentials: Wrong auth provider" });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password as string
    );

    if (!isMatch) {
      console.log("[Login Failed] Password mismatch for:", email);
      return res.status(400).json({ message: "Invalid credentials: Password incorrect" });
    }

    const profile = await Profile.findOne({ userId: user._id });
    const trainerProfile = await Trainer.findOne({ userId: user._id });

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
 * @desc    Google Authentication
 * @route   POST /api/auth/google
 * @access  Public
 */
export const googleAuth = async (req: Request, res: Response) => {
  try {
    // 1. Extract the Google ID Token (credential) sent from the frontend
    const { credential } = req.body;

    // 2. Immediate validation: Ensure the token exists
    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    // 3. Verify the token using Google's public keys. 
    // The 'audience' check ensures the token was intended for YOUR application (your Client ID).
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    // 4. Extract the payload containing user data (email, name, picture, etc.)
    const payload = ticket.getPayload();
    
    // 5. Verify that the payload is valid and contains an email address
    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    // sub: The unique, permanent ID Google gives to this user
    const { email, sub: googleId, name } = payload;

    // 6. Check if a user with this email already exists in our database
    let user = await User.findOne({ email });

    // 7. If the user doesn't exist, create a new record in MongoDB
    if (!user) {
      user = await User.create({
        email,
        name,
        googleId,
        provider: "google", // Mark as Google provider to differentiate from email/password users
        role: "learner",    // Default role
      });
    }

    // 8. Look for associated Profile and Trainer records to inform the frontend
    const profile = await Profile.findOne({ userId: user._id });
    const trainerProfile = await Trainer.findOne({ userId: user._id });

    // 9. Return our app's own JWT token and user status flags
    res.json({
      token: generateToken(user._id.toString()),
      role: user.role,
      name: user.name,
      hasProfile: !!profile,          // Tells frontend if it needs to show onboarding
      hasTrainerProfile: !!trainerProfile,
    });
  } catch (error) {
    // 10. Log the internal error for debugging and return a 500 status
    console.error("[Google Auth Error]", error);
    res.status(500).json({ message: "Google auth failed" });
  }
};