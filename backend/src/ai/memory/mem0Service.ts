import { MemoryClient } from "mem0ai";

/**
 * Mem0 Service for intelligent long-term memory.
 * This client provides persistent, self-improving memory for our AI agents.
 */
let mem0Client: MemoryClient | null = null;

/**
 * Get the standardized Mem0 client
 */
export const getMem0Client = () => {
  if (!mem0Client) {
    const apiKey = process.env.MEM0_API_KEY2;
    if (!apiKey) {
      console.warn("MEM0_API_KEY2 not found in .env. Memory retrieval/storage will fail.");
    }
    mem0Client = new MemoryClient({
      apiKey: apiKey || "dummy-key",
    });
  }
  return mem0Client;
};

/**
 * Standardized search functionality for LTM context
 */
export const searchMemories = async (userId: string, query: string): Promise<string> => {
  try {
    const mem0 = getMem0Client();
    const memories = await mem0.search(query, { filters: { user_id: String(userId) } });
    if (memories?.results?.length > 0) {
      return memories.results.map((m: any) => m.memory).join("\n");
    }
    return "";
  } catch (err) {
    console.error("Mem0 search error:", err);
    return "";
  }
};

/**
 * Standardized interaction storage
 */
export const addInteraction = async (userId: string, interaction: { role: 'user' | 'assistant'; content: string }[]) => {
  try {
    const mem0 = getMem0Client();
    // Non-blocking fire and forget
    mem0.add(interaction, { user_id: String(userId) }).catch(e => console.error("Mem0 add error:", e));
  } catch (err) {
    console.error("Mem0 add initiation error:", err);
  }
};

/**
 * Retrieve all memories for a specific user
 */
export const getAllMemories = async (userId: string) => {
  try {
    const mem0 = getMem0Client();
    // Retrieve ALL memories for the user
    const response: any = await mem0.getAll({ 
      filters: { 
        AND: [{ user_id: String(userId) }] 
      } 
    });
    
    // Some versions of the SDK return a paginated object { results: [...], ... }
    const rawMemories = response?.results || response || [];
    
    // Clean up null/empty fields to keep the UI and logs clean
    if (Array.isArray(rawMemories)) {
      return rawMemories.map((m: any) => {
        const cleaned: any = {};
        Object.keys(m).forEach(key => {
          if (m[key] !== null && m[key] !== undefined) {
            cleaned[key] = m[key];
          }
        });
        return cleaned;
      });
    }
    
    return rawMemories;
  } catch (err) {
    console.error("Mem0 getAll error:", err);
    return [];
  }
};

/**
 * Delete all memories for a specific user
 */
export const deleteAllMemories = async (userId: string) => {
  try {
    const mem0 = getMem0Client();
    await mem0.deleteAll({ userId: String(userId) });
    console.log(`[Mem0] Successfully deleted all memories for user ${userId}`);
  } catch (err) {
    console.error("Mem0 delete error:", err);
  }
};
