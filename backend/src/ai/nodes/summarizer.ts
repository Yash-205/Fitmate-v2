import { SystemMessage, RemoveMessage } from "@langchain/core/messages";
import { ChatState } from "../graphs/chatGraph";
import { getFastModel } from "../utils/modelRegistry";

/**
 * Summarization Node
 * -------------------
 * This node triggers when the short-term memory (message list) gets too long.
 * It condenses the history into a single 'summary' string and prunes the old messages.
 */
export const summarizeMessages = async (state: typeof ChatState.State) => {
  const { messages, summary } = state;

  // We only summarize if the conversation exceeds 6 messages (3 rotations)
  // to keep the context window compact and the AI fast.
  if (messages.length <= 6) {
    return {};
  }

  const model = getFastModel();
  
  const prompt = summary 
    ? `This is a summary of the conversation so far: "${summary}". 
       Below is a list of new messages. Update the summary to include any new athlete preferences, 
       goals, or key context from these new messages. Keep it highly concise.`
    : `Create a concise, high-level summary of the training conversation below. 
       Focus on the athlete's current goals, fatigue levels, and specific exercise preferences.`;

  const response = await model.invoke([
    new SystemMessage(prompt),
    ...messages,
  ]);

  // Delete all messages except the last 2 (the absolute immediate context)
  // This is where "Efficient STM" happens.
  const deleteMessages = messages.slice(0, -2).map((m: any) => {
    // If LangGraph didn't assign an ID yet, we skip pruning for that specific message
    if (!m.id) return null;
    return new RemoveMessage({ id: m.id });
  }).filter(Boolean);

  return {
    summary: response.content as string,
    messages: deleteMessages,
  };
};
