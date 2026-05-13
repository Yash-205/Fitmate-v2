/**
 * App Routes
 * Centralized route constants for scalability.
 */
export const ROUTES = {
  HOME: '/',
  CHAT: '/chat',
  WORKOUT: '/workout',
  PROFILE: '/profile',
  TRAINERS: '/trainers',
  TRAINER_DASHBOARD: '/trainer/dashboard',
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];
