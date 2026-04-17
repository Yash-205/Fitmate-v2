import { Annotation, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { chatNode } from "../nodes/chatNode";
import { summarizeMessages } from "../nodes/summarizer";
import { getMongoCheckpointer } from "../memory/checkpointer";

// Define professional state with summarization support
export const ChatState = Annotation.Root({
  ...MessagesAnnotation.spec,
  summary: Annotation<string>,
});

const workflow = new StateGraph(ChatState)
  .addNode("agent", chatNode)
  .addNode("summarize", summarizeMessages)
  .addEdge("__start__", "agent")
  .addEdge("agent", "summarize")
  .addEdge("summarize", "__end__");

// Compile with MongoDB checkpointer for short-term thread memory
const app = workflow.compile({ checkpointer: getMongoCheckpointer() });

export const streamAgent = (message: string, profile: any, threadId: string) => {
  return app.streamEvents(
    { messages: [new HumanMessage(message)] },
    { 
      version: "v2",
      configurable: { 
        thread_id: threadId,
        profile: profile
      } 
    }
  );
};

export const runAgent = async (message: string, profile: any, threadId: string) => {
  try {
    const result = await app.invoke(
      { messages: [new HumanMessage(message)] },
      { 
        configurable: { 
          thread_id: threadId,
          profile: profile
        } 
      }
    );
    const finalMessage = result.messages[result.messages.length - 1];
    return finalMessage.content;
  } catch (err: any) {
    console.error("Agent error:", err.message);
    throw new Error("AI failed");
  }
};

export const getAgentHistory = async (threadId: string) => {
  try {
    const state = await app.getState({ configurable: { thread_id: threadId } });
    if (!state || !state.values || !state.values.messages) {
      return [];
    }
    return state.values.messages.map((m: any) => ({
      role: m._getType() === "human" ? "user" : "assistant",
      content: m.content
    }));
  } catch (err) {
    console.error("History fetch error:", err);
    return [];
  }
};
