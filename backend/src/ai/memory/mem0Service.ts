import { MemoryClient } from "mem0ai";

/**
 * Mem0 Service for intelligent long-term memory.
 * This client provides persistent, self-improving memory for our AI agents.
 */
let mem0Client: MemoryClient | null = null;

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
