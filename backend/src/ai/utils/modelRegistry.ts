import { ChatGroq } from "@langchain/groq";

/**
 * Model Registry
 * --------------
 * Centralized configuration for AI models.
 * Standardized on llama-3.1-8b-instant as per user request.
 */

export const getModel = (temperature = 0.1) => {
  return new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.1-8b-instant",
    temperature: temperature,
    maxTokens: 2500, // Hard limit to stay under 6,000 TPM (Prompt + Output)
  });
};

export const getFastModel = () => getModel(0); // For summarization/structured tasks
export const getCreativeModel = () => getModel(0.7); // For chat interactions
