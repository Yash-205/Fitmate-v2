import mongoose from "mongoose";
import dotenv from "dotenv";
import DirectMessage from "../models/DirectMessage";
import User from "../models/User";

// Load env variables to get MONGO_URI
dotenv.config();

const testChatAPI = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fitmate");
        console.log("✅ Connected to Database");

        // 1. Find the seeded Coach and Athlete
        const coach = await User.findOne({ email: "coach_elena@fitmate.ai" });
        const athlete = await User.findOne({ email: "test_athlete@fitmate.ai" });

        if (!coach || !athlete) {
            throw new Error("Could not find seeded users. Make sure you ran npm run seed first!");
        }

        const coachId = coach._id.toString();
        const athleteId = athlete._id.toString();

        // 2. Simulate the Socket sending 3 messages and storing them in the DB
        console.log("💬 Sending 3 messages from Athlete to Coach...");
        await DirectMessage.create([
            { senderId: athleteId, receiverId: coachId, message: "Hi Elena! Ready to start my yoga journey.", createdAt: new Date(Date.now() - 3000) },
            { senderId: athleteId, receiverId: coachId, message: "I am specifically looking to improve flexibility.", createdAt: new Date(Date.now() - 2000) },
            { senderId: athleteId, receiverId: coachId, message: "What time works best for our first session?", createdAt: new Date(Date.now() - 1000) }
        ]);
        console.log("✅ Messages successfully stored in MongoDB.");

        // 3. Test the REST API Route by fetching the conversation between these two specific IDs
        console.log(`\n📡 Fetching history via API route... (GET http://localhost:8000/api/messages/${athleteId}/${coachId})`);
        
        const response = await fetch(`http://localhost:8000/api/messages/${athleteId}/${coachId}`);
        const messages = await response.json();

        console.log(`\n✅ API returned ${messages.length} total messages for this conversation. Here are the last 3:`);
        
        // Print the last 3 messages received
        messages.slice(-3).forEach((msg: any) => {
            const sender = msg.senderId === athleteId ? "Athlete" : "Coach";
            console.log(`[${sender}]: ${msg.message}`);
        });

        console.log("\n🎉 Test Completed Successfully!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Test Failed:", error);
        process.exit(1);
    }
};

testChatAPI();
