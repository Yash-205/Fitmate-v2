import { fetchClient, API_URL } from './client';

/**
 * Chat Service
 * Handles AI chat communications and session history.
 */
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
