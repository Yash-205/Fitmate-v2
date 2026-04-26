import { fetchClient } from './client';

/**
 * Profile Service
 * Handles user physical profiles and baseline assessments.
 */
export const ProfileService = {
  get: () => fetchClient('/profile'),
  upsert: (profileData: Record<string, any>) =>
    fetchClient('/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    }),
  selectTrainer: (trainerId: string) =>
    fetchClient(`/profile/select-trainer/${trainerId}`, {
      method: 'POST',
    }),
};
