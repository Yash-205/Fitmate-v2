import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { MongoClient } from "mongodb";

export const getMongoClient = () => {
  const mongoUri = process.env.MONGO_URI as string;
  if (!mongoUri) throw new Error("MONGO_URI not defined");
  
  // Reuse a global client instance or create a new one
  if (!(global as any)._mongoClient) {
    const dbName = process.env.NODE_ENV === "test" ? "fitmate-test" : undefined;
    (global as any)._mongoClient = new MongoClient(mongoUri, { dbName } as any);
  }
  return (global as any)._mongoClient as MongoClient;
};

// Shared Checkpointer explicitly for LangGraph short-term memory
export const getMongoCheckpointer = () => {
    return new MongoDBSaver({ client: getMongoClient() as any });
};
