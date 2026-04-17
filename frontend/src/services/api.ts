const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Advanced Core API Client
 * Automatically intercepts every request to inject the Authorization Bearer token 
 * from localStorage, drastically reducing repetitive code across the app.
 */
async function fetchClient(endpoint: string, options: RequestInit = {}) {
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

// ----------------------------------------------------
// Specialized Domain Services
// ----------------------------------------------------

export const ChatService = {
  getSessions: () => fetchClient('/chat/sessions'),
  getHistory: (threadId: string) => fetchClient(`/chat/${threadId}/history`),
  sendMessage: (message: string, threadId: string | null) => {
    const payload: any = { message };
    if (threadId) payload.threadId = threadId;
    return fetchClient('/chat', { 
      method: 'POST', 
      body: JSON.stringify(payload) 
    });
  },
  // Modular streaming service
  streamMessage: async (
    message: string, 
    threadId: string | null, 
    onChunk: (text: string) => void,
    onDone: (data: any) => void,
    onError: (err: Error) => void
  ) => {
    try {
      const token = localStorage.getItem('token');
      const payload: any = { message };
      if (threadId) payload.threadId = threadId;
      
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Network response was not ok");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) onChunk(data.chunk);
              if (data.done) onDone(data);
              if (data.error) throw new Error(data.error);
            } catch (e) {
              // Ignore partial JSON
            }
          }
        }
      }
    } catch (err: any) {
      onError(err);
    }
  }
};

export const WorkoutService = {
  getPlan: () => fetchClient('/workout'),
  generatePlan: (feedback: string | null = null) => 
    fetchClient('/workout/generate', { 
      method: 'POST',
      body: JSON.stringify({ feedback })
    })
};

export const AuthService = {
  login: async (credentials: { email: string; password: string }) => {
    const data = await fetchClient('/auth/login', { 
      method: 'POST', 
      body: JSON.stringify(credentials) 
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', credentials.email);
    return data;
  },
  signup: async (userData: { email: string; password: string; name?: string }) => {
    const data = await fetchClient('/auth/signup', { 
      method: 'POST', 
      body: JSON.stringify(userData) 
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', userData.email);
    return data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
  }
};

export const ProfileService = {
  get: () => fetchClient('/profile'),
  upsert: (profileData: Record<string, any>) =>
    fetchClient('/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    }),
};
