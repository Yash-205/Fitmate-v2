import { MessagesAnnotation } from "@langchain/langgraph";
import { SystemMessage } from "@langchain/core/messages";
import { buildChatAgentSystemPrompt } from "../prompts/chatPrompt";
import { searchMemories, addInteraction } from "../memory/mem0Service";
import { getCreativeModel } from "../utils/modelRegistry";

export const chatNode = async (state: typeof MessagesAnnotation.State, config: any) => {
  const profile = config.configurable?.profile;
  const userId = profile?.userId || profile?._id || "default_user";
  const lastMessage = state.messages[state.messages.length - 1].content as string;

  // 1. Retrieve relevant memories (LTM) using centralized helper
  const [contextualMemories, foundationalMemories] = await Promise.all([
    searchMemories(String(userId), lastMessage),
    searchMemories(String(userId), "user name, identity, preferred nickname, baseline personality")
  ]);

  const memoryContext = [contextualMemories, foundationalMemories]
    .filter(Boolean)
    .join("\n");

  // 2. Inject memories (LTM) and summary (STM) into system prompt
  const basePrompt = buildChatAgentSystemPrompt(profile);
  const summaryContext = (state as any).summary || "This is the start of a new training conversation.";
  
  const fullPrompt = basePrompt
    .replace("{{memory_context}}", memoryContext || "No prior athlete history discovered in LTM.")
    .replace("{{summary_context}}", summaryContext);

  const sysMsg = new SystemMessage(fullPrompt);
  
  // 3. Generate response using standardized model
  const model = getCreativeModel();
  const response = await model.invoke([sysMsg, ...state.messages]);

  // 4. Store the new interaction in Mem0
  addInteraction(String(userId), [
    { role: "user", content: lastMessage },
    { role: "assistant", content: response.content as string }
  ]);

  return { messages: [response] };
};
