import 'dotenv/config';
import request from 'supertest';
import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';
import mongoose from 'mongoose';
import app from '../src/app';
import connectDB from '../src/config/db';
import User from '../src/models/User';

// NO MOCKS - This is a TRUE End-to-End Integration Test
// It will call real LLMs (Groq) and real Long-Term Memory (Mem0)

describe('Complete User Onboarding Flow (Auth + Profile)', () => {
  let token: string;
  const testUser = {
    email: `flow-${Date.now()}@example.com`,
    password: 'Password123!',
    name: 'Flow Tester'
  };

  beforeAll(async () => {
    // Force NODE_ENV to test to ensure we use the test database
    process.env.NODE_ENV = 'test';
    await connectDB();
    console.log('\n🚀 --- TEST START: Initializing Isolated Test Database ---');
    
    if (mongoose.connection.db) {
      // 1. Find all lingering test users and delete their Mem0 memories
      const users = await User.find({});
      if (users.length > 0) {
        const { deleteAllMemories } = await import('../src/ai/memory/mem0Service');
        for (const user of users) {
          await deleteAllMemories(user._id.toString());
        }
      }
      
      // 2. Drop the test database
      try {
        await mongoose.connection.db.dropDatabase();
        console.log('🧹 --- TEST START: Previous Test Database Cleaned ---\n');
      } catch (err: any) {
        if (err.message && err.message.includes('currently being dropped')) {
          console.log('🧹 --- TEST START: Database already being cleaned by another process ---\n');
        } else {
          console.error('Error dropping database:', err);
        }
      }
    }
  }, 60000);

  afterAll(async () => {
    // Cleanup: Close connection
    await mongoose.connection.close();
  });

  it('Full Sequential Flow: Signup -> Login -> Create Profile -> Fetch Profile', async () => {
    const testUser = {
      email: `flow-${Date.now()}@example.com`,
      password: 'Password123!',
      name: 'Flow Tester'
    };

    // 1. Signup
    console.log(`\n[Step 1] Registering User: ${testUser.email}`);
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send(testUser);
    
    console.log(`[Step 1 Status]: ${signupRes.status}`);
    console.log(`[Step 1 Body]:`, JSON.stringify(signupRes.body, null, 2));
    expect(signupRes.status).toBe(201);
    console.log('✅ Signup Successful.');

    // 2. Login
    console.log('\n[Step 2] Logging In...');
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    
    console.log(`[Step 2 Status]: ${loginRes.status}`);
    console.log(`[Step 2 Body]:`, JSON.stringify(loginRes.body, null, 2));
    expect(loginRes.status).toBe(200);
    token = loginRes.body.token;
    console.log('✅ Login Successful.');

    // 3. Create Profile (Includes Real AI Graph Generation)
    console.log('\n[Step 3] Creating Profile (Triggering REAL AI Strategy Graph)...');
    const profileData = {
      age: 25,
      gender: 'male',
      weight: 80,
      height: 180,
      goal: 'Build Muscle',
      trainingExperience: 'intermediate',
      availableDays: 4,
      sessionDuration: 60,
      sleepQuality: 'good',
      stressLevel: 'low',
      diet: 'high protein'
    };

    const profileRes = await request(app)
      .post('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(profileData);
    
    console.log(`[Step 3 Status]: ${profileRes.status}`);
    console.log(`[Step 3 Body]:`, JSON.stringify(profileRes.body, null, 2));
    expect(profileRes.status).toBe(200);
    console.log('✅ Profile & AI Strategy Created.');

    // 4. Verify Profile Retrieval
    console.log('\n[Step 4] Verifying Profile Retrieval...');
    const getProfileRes = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${token}`);
    
    console.log(`[Step 4 Status]: ${getProfileRes.status}`);
    console.log(`[Step 4 Body]:`, JSON.stringify(getProfileRes.body, null, 2));
    expect(getProfileRes.status).toBe(200);
    console.log('✅ Profile Data Verified.');

    // 4.5 Chat with Agent about an injury
    console.log('\n[Step 4.5] Chatting about an injury...');
    const chatMsg = "I recently hurt my lower back and cannot do heavy squats. Can you keep this in mind?";
    console.log(`[Chat Input]: ${chatMsg}`);

    const chatRes = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: chatMsg });

    console.log(`[Chat Status]: ${chatRes.status}`);
    
    // Parse the SSE chunks to build the full response string
    const rawText = chatRes.text || "";
    const lines = rawText.split('\n');
    let fullResponse = '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.replace('data: ', ''));
          if (data.chunk) fullResponse += data.chunk;
        } catch (e) {
        }
      }
    }
    console.log(`[Chat Response Text]:\n${fullResponse || rawText}`);
    expect(chatRes.status).toBe(200);

    // 5. Retrieve Mem0 Memories
    console.log('\n[Step 5] Retrieving Long-Term Memories (Mem0)...');
    console.log('--- ⏳ Waiting 10 seconds for Cloud AI indexing to complete... ---');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const { getAllMemories } = await import('../src/ai/memory/mem0Service');
    const memories = await getAllMemories(profileRes.body.userId);
    console.log('✅ Real User Memories:');
    console.log(JSON.stringify(memories, null, 2));
    
    console.log('\n✨ --- AUTH FLOW COMPLETED WITH REAL AI RESULTS ---\n');
  }, 180000); // 180 Second Timeout for Real AI work
});
