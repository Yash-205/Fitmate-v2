import { fetchClient } from './client';

/**
 * Workout Service
 * Handles workout plan generation and retrieval.
 */
export const WorkoutService = {
  getPlan: () => fetchClient('/workout'),
  generatePlan: (feedback: string | null = null) => 
    fetchClient('/workout/generate', { 
      method: 'POST',
      body: JSON.stringify({ feedback })
    })
};
