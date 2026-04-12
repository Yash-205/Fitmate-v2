import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import generateToken from "../utils/generateToken";
import Profile from "../models/Profile";

// 🔹 Signup (local)
export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      provider: "local",
    });

    res.status(201).json({
      token: generateToken(user._id.toString()),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Signup failed" });
  }
};

// 🔹 Login (local)
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.provider !== "local") {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password as string
    );

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const profile = await Profile.findOne({ userId: user._id });

    res.json({
      token: generateToken(user._id.toString()),
      hasProfile: !!profile,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Login failed" });
  }
};

// 🔹 Google Auth (future-ready)
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { email, googleId } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        googleId,
        provider: "google",
      });
    }

    const profile = await Profile.findOne({ userId: user._id });

    res.json({
      token: generateToken(user._id.toString()),
      hasProfile: !!profile,
    });
  } catch (error) {
    res.status(500).json({ message: "Google auth failed" });
  }
};