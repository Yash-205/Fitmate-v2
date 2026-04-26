import { fetchClient } from './client';

/**
 * Trainer Service
 * Handles professional trainer profiles and client lists.
 */
export const TrainerService = {
  getProfile: () => fetchClient('/trainer/profile'),
  upsertProfile: (trainerData: Record<string, any>) =>
    fetchClient('/trainer/profile', {
      method: 'POST',
      body: JSON.stringify(trainerData),
    }),
  getClients: () => fetchClient('/trainer/clients'),
  getDiscovery: () => fetchClient('/trainer/discovery'),
};
