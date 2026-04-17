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
    const apiKey = process.env.MEM0_API_KEY;
    if (!apiKey) {
      console.warn("MEM0_API_KEY not found in .env. Memory retrieval/storage will fail.");
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
