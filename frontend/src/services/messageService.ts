/**
 * Message Service
 * Handles user-to-user direct messages via REST API.
 */
export const MessageService = {
  /**
   * Fetches the direct message history between two specific users
   */
  getConversationHistory: (userId1: string, userId2: string) => {
    // Note: We are using port 8001 here directly just to ensure it hits your backend.
    // In production, you would configure your fetchClient to use the correct API_URL automatically.
    return fetch(`http://localhost:8001/api/messages/${userId1}/${userId2}`).then(res => res.json());
  }
};
