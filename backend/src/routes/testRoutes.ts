import express from 'express';
import mongoose from 'mongoose';
import { getMem0Client } from '../ai/memory/mem0Service';

const router = express.Router();

router.get('/ping', (req, res) => res.json({ message: 'Test routes are active!' }));

router.post('/reset', async (req, res) => {
  if (process.env.NODE_ENV !== 'test') {
    return res.status(403).json({ error: 'Reset only allowed in test mode' });
  }

  try {
    // 1. Drop the MongoDB test database
    if (mongoose.connection.db) {
       await mongoose.connection.db.dropDatabase();
       console.log('Test database dropped successfully');
    }

    // 2. Clear Mem0 for the test user if provided
    const testUserId = req.body.userId;
    if (testUserId) {
      const mem0 = getMem0Client();
      try {
        // mem0ai v3 uses deleteAll for bulk deletion
        await mem0.deleteAll({ userId: String(testUserId) });
        console.log(`Mem0 memories cleared for user: ${testUserId}`);
      } catch (e: any) {
        console.warn('Mem0 cleanup error (might be expected if user has no memories):', e.message);
      }
    }

    res.json({ message: 'Database and Memory reset successfully' });
  } catch (error: any) {
    console.error('Reset endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
