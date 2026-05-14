import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes"; 
import chatRoutes from "./routes/chatRoutes";
import workoutRoutes from "./routes/workoutRoutes";
import testRoutes from "./routes/testRoutes";
import trainerRoutes from "./routes/trainerRoutes";

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

app.get("/", (req, res) => {
    res.send("FitMate API is running 🚀");
});

export default app;
