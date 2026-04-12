import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/db"
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes"; 
import chatRoutes from "./routes/chatRoutes";
import workoutRoutes from "./routes/workoutRoutes";



// connect database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/workout", workoutRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("FitMate API is running 🚀");
});

// Port
const PORT = process.env.PORT || 8000;

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
