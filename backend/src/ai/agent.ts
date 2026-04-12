import { ChatGroq } from "@langchain/groq";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { MongoClient } from "mongodb";

// Initialize the MongoDB client for LangGraph persistence.
// It will automatically connect upon the first checkpoint save/read.

const mongoUri = process.env.MONGO_URI as string;
const mongoClient = new MongoClient(mongoUri);
const checkpointer = new MongoDBSaver({ client: mongoClient as any });

// Initialize the model
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.1-8b-instant",
  temperature: 0.7,
});

// Define the node that calls the model
const callModel = async (state: typeof MessagesAnnotation.State, config: any) => {
  const profile = config.configurable?.profile;
  const sysMsg = new SystemMessage(
    `You are a fitness coach.

User Profile:
- Age: ${profile?.age || 'N/A'}
- Weight: ${profile?.weight || 'N/A'} kg
- Height: ${profile?.height || 'N/A'} cm
- Goal: ${profile?.goal || 'N/A'}
- Diet: ${profile?.diet || 'N/A'}
- Activity Level: ${profile?.activityLevel || 'N/A'}

Give a short, practical, personalized answer.`
  );
  
  // Prepend the system message to the message history
  const response = await model.invoke([sysMsg, ...state.messages]);
  return { messages: [response] };
};

// Define and compile the graph
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge("__start__", "agent")
  .addEdge("agent", "__end__");

// Compile with the checkpointer to enable persistence
const app = workflow.compile({ checkpointer });

export const runAgent = async (message: string, profile: any, threadId: string) => {
  try {
    // Run the graph
    const result = await app.invoke(
      { messages: [new HumanMessage(message)] },
      { 
        configurable: { 
          thread_id: threadId,
          profile: profile
        } 
      }
    );

    // Get the most recent message added to the state
    const finalMessage = result.messages[result.messages.length - 1];
    
    // finalMessage.content can be a string or Array. Usually string for standard chat models.
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