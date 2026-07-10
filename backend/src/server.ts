import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db";
import app from "./app";
import { initializeSocket } from "./socket"; 

/**
 * FitMate Backend Server
 * 
 * Entry point for the Express application. 
 * Initializes middleware, routes, and database connections.
 */

// connect database
connectDB();

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
initializeSocket(server);
// 🛡️ Global "Safety Net" - Prevents the server from crashing during DB resets/fast tests
process.on("unhandledRejection", (err: any) => {
    console.error("Unhandled Rejection:", err.message);
    // We don't exit the process here to keep the test server running
});

process.on("uncaughtException", (err: any) => {
    console.error("Uncaught Exception:", err.message);
    // Optional: Graceful shutdown if needed, but for testing we keep it alive
});
