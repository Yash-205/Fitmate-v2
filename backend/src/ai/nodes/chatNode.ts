import { ChatGroq } from "@langchain/groq";
import { MessagesAnnotation } from "@langchain/langgraph";
import { SystemMessage } from "@langchain/core/messages";
import { buildChatAgentSystemPrompt } from "../prompts/chatPrompt";
import { getMem0Client } from "../memory/mem0Service";

const getModel = () => new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.1-8b-instant",
  temperature: 0.7,
});

export const chatNode = async (state: typeof MessagesAnnotation.State, config: any) => {
  const profile = config.configurable?.profile;
  const userId = profile?._id || "default_user";
  const lastMessage = state.messages[state.messages.length - 1].content as string;

  // 1. Retrieve relevant memories from Mem0 using a Dual-Search Strategy
  let memoryContext = "";
  try {
    const mem0 = getMem0Client();
    
    // Perform two searches in parallel:
    // - Search 1: Specific to the user's current message (Contextual)
    // - Search 2: Foundational facts about identity/name (Foundational)
    const [contextualMemories, foundationalMemories] = await Promise.all([
      mem0.search(lastMessage, { filters: { user_id: String(userId) } }),
      mem0.search("user name, identity, preferred nickname, baseline personality", { filters: { user_id: String(userId) } })
    ]);

    // Merge and deduplicate memories based on content
    const allMemories = [...(contextualMemories?.results || []), ...(foundationalMemories?.results || [])];
    const uniqueMemories = Array.from(new Set(allMemories.map((m: any) => m.memory)));
    
    memoryContext = uniqueMemories.join("\n");
  } catch (err) {
    console.error("Mem0 search error:", err);
  }

  // 2. Inject memories (LTM) and summary (STM) into system prompt
  const basePrompt = buildChatAgentSystemPrompt(profile);
  const summaryContext = (state as any).summary || "This is the start of a new training conversation.";
  const fullPrompt = basePrompt
    .replace("{{memory_context}}", memoryContext || "No prior athlete history discovered in LTM.")
    .replace("{{summary_context}}", summaryContext);

  const sysMsg = new SystemMessage(fullPrompt);
  
  const model = getModel();
  const response = await model.invoke([sysMsg, ...state.messages]);

  // 3. Store the new interaction in Mem0 (asynchronously)
  try {
    const mem0 = getMem0Client();
    const conversation: any[] = [
      { role: "user", content: lastMessage },
      { role: "assistant", content: response.content as string }
    ];
    // We don't await this to avoid blocking the response
    mem0.add(conversation, { user_id: String(userId) }).catch(e => console.error("Mem0 add error:", e));
  } catch (err) {
    console.error("Mem0 storage error initiation:", err);
  }

  return { messages: [response] };
};
