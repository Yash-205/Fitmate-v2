import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app";
import User from "../src/models/User";
import DirectMessage from "../src/models/DirectMessage";

describe("Message Service Integration Tests", () => {
  let learnerId: string;
  let coachId: string;

  beforeAll(async () => {
    // 1. Connect to the test database
    const mongoUri = process.env.MONGO_URI_TEST || "mongodb://127.0.0.1:27017/fitmate_test";
    await mongoose.connect(mongoUri);

    // 2. Clear existing test data
    await User.deleteMany({});
    await DirectMessage.deleteMany({});

    // 3. Create a Learner
    const learner = await User.create({
      name: "Test Learner",
      email: "learner@test.com",
      password: "password123",
      role: "learner"
    });
    learnerId = learner._id.toString();

    // 4. Create a Coach
    const coach = await User.create({
      name: "Test Coach",
      email: "coach@test.com",
      password: "password123",
      role: "trainer"
    });
    coachId = coach._id.toString();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should store and retrieve message history between a learner and a coach", async () => {
    // 1. Seed the database with a conversation history
    await DirectMessage.create([
      {
        senderId: learnerId,
        receiverId: coachId,
        message: "Hey Coach! When is my next leg day?",
        createdAt: new Date(Date.now() - 10000) // 10 seconds ago
      },
      {
        senderId: coachId,
        receiverId: learnerId,
        message: "Hey! We have legs scheduled for tomorrow morning.",
        createdAt: new Date(Date.now() - 5000) // 5 seconds ago
      },
      {
        senderId: learnerId,
        receiverId: coachId,
        message: "Awesome, I'll be ready.",
        createdAt: new Date() // Just now
      }
    ]);

    // 2. Fetch the conversation via the REST API endpoint
    const response = await request(app).get(`/api/messages/${learnerId}/${coachId}`);

    // 3. Assertions
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(3);

    // 4. Verify ordering and content
    expect(response.body[0].message).toBe("Hey Coach! When is my next leg day?");
    expect(response.body[0].senderId).toBe(learnerId);

    expect(response.body[1].message).toBe("Hey! We have legs scheduled for tomorrow morning.");
    expect(response.body[1].senderId).toBe(coachId);

    expect(response.body[2].message).toBe("Awesome, I'll be ready.");
    expect(response.body[2].senderId).toBe(learnerId);
  });
});
