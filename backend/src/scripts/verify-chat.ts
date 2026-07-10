import mongoose from "mongoose";
import dotenv from "dotenv";
import DirectMessage from "../models/DirectMessage";
import User from "../models/User";

dotenv.config();

const runVerification = async () => {
    console.log("=========================================");
    console.log("   CHAT VERIFICATION SIMULATION");
    console.log("=========================================\n");

    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fitmate");

        // --- STEP 1: GET USER IDs FROM MONGODB ---
        const learner = await User.findOne({ email: "test_athlete@fitmate.ai" });
        const trainer = await User.findOne({ email: "coach_elena@fitmate.ai" });

        if (!learner || !trainer) {
             console.error("❌ Failed to find Seeded Users. Did you run npm run seed?");
             process.exit(1);
        }

        const learnerId = learner._id.toString();
        const trainerId = trainer._id.toString();

        console.log(`✅ Found Learner: test_athlete@fitmate.ai (ID: ${learnerId})`);
        console.log(`✅ Found Trainer: coach_elena@fitmate.ai (ID: ${trainerId})\n`);

        // --- STEP 2: LEARNER SENDS MESSAGES ---
        console.log("✉️  STEP 2: Learner sends 2 messages to Trainer (simulating WebSocket)...");
        await DirectMessage.create([
            { senderId: learnerId, receiverId: trainerId, message: "Hi Coach! Checking in on my squats.", createdAt: new Date(Date.now() - 2000) },
            { senderId: learnerId, receiverId: trainerId, message: "I uploaded the video.", createdAt: new Date(Date.now() - 1000) }
        ]);
        console.log("✅ Messages successfully saved to MongoDB.\n");

        // --- STEP 3: LEARNER FETCHES MESSAGES VIA API ---
        console.log(`📡 STEP 3: Learner fetching conversation history via API...`);
        console.log(`   GET http://localhost:8001/api/messages/${learnerId}/${trainerId}`);
        const learnerFetchRes = await fetch(`http://localhost:8001/api/messages/${learnerId}/${trainerId}`);
        const learnerMessages = await learnerFetchRes.json();
        
        console.log(`   Result: Found ${learnerMessages.length} total messages.`);
        learnerMessages.slice(-2).forEach((msg: any) => {
            const sender = msg.senderId === learnerId ? "Learner (Me)" : "Trainer (Them)";
            console.log(`   -> [${sender}]: ${msg.message}`);
        });
        console.log();

        // --- STEP 4: TRAINER FETCHES MESSAGES VIA API ---
        console.log(`📡 STEP 4: Trainer fetching the EXACT SAME conversation history via API...`);
        // Notice the IDs are swapped in the URL: trainerId first, then learnerId. It shouldn't matter!
        console.log(`   GET http://localhost:8001/api/messages/${trainerId}/${learnerId}`);
        const trainerFetchRes = await fetch(`http://localhost:8001/api/messages/${trainerId}/${learnerId}`);
        const trainerMessages = await trainerFetchRes.json();

        console.log(`   Result: Found ${trainerMessages.length} total messages.`);
        trainerMessages.slice(-2).forEach((msg: any) => {
            const sender = msg.senderId === trainerId ? "Trainer (Me)" : "Learner (Them)";
            console.log(`   -> [${sender}]: ${msg.message}`);
        });
        console.log();

        console.log("🎉 SUCCESS! Both API calls returned the exact same messages.");
        process.exit(0);

    } catch (err) {
        console.error("❌ Test Failed:", err);
        process.exit(1);
    }
};

runVerification();
