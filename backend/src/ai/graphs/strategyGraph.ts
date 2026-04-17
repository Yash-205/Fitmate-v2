import { StateGraph, START, END } from "@langchain/langgraph";
import { WorkoutState } from "../state/workoutState";
import { generateStrategy } from "../nodes/workoutGenerator";
import { getMongoCheckpointer } from "../memory/checkpointer";

const strategyWorkflow = new StateGraph(WorkoutState)
  .addNode("strategy", generateStrategy)
  .addEdge(START, "strategy")
  .addEdge("strategy", END);

const checkpointer = getMongoCheckpointer();
const strategyApp = strategyWorkflow.compile({ checkpointer });

/**
 * PHASE 1: Build the long-term Roadmap
 */
export const runStrategyAgent = async (profile: any, userId: string) => {
  const result = await strategyApp.invoke(
    { profile, userId },
    { configurable: { thread_id: `strategy_${userId}` } }
  );
  return result.finalPlan;
};
