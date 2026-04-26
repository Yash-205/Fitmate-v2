import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/db"
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes"; 
import chatRoutes from "./routes/chatRoutes";
import workoutRoutes from "./routes/workoutRoutes";
import testRoutes from "./routes/testRoutes";
import trainerRoutes from "./routes/trainerRoutes";

/**
 * FitMate Backend Server
 * 
 * Entry point for the Express application. 
 * Initializes middleware, routes, and database connections.
 */

// connect database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === "test") {
  app.use("/api/test", testRoutes);
}

app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/workout", workoutRoutes);
app.use("/api/trainer", trainerRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("FitMate API is running 🚀");
});

// Port
const PORT = process.env.PORT || 8000;

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// 🛡️ Global "Safety Net" - Prevents the server from crashing during DB resets/fast tests
process.on("unhandledRejection", (err: any) => {
    console.error("Unhandled Rejection:", err.message);
    // We don't exit the process here to keep the test server running
});

process.on("uncaughtException", (err: any) => {
    console.error("Uncaught Exception:", err.message);
    // Optional: Graceful shutdown if needed, but for testing we keep it alive
});
