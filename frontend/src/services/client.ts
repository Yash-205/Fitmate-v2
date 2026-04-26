export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

/**
 * Advanced Core API Client
 * Automatically intercepts every request to inject the Authorization Bearer token 
 * from localStorage, drastically reducing repetitive code across the app.
 */
export async function fetchClient(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle distinct 404 responses gracefully (like missing Workout Plans)
  if (response.status === 404) {
    throw { status: 404, message: 'Not found' };
  }

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'An unexpected API error occurred');
  }
  
  return data;
}
