import { StateGraph, START, END } from "@langchain/langgraph";
import { WorkoutState } from "../state/workoutState";
import { generateMicrocycle } from "../nodes/workoutGenerator";
import { getMongoCheckpointer } from "../memory/checkpointer";

const microcycleWorkflow = new StateGraph(WorkoutState)
  .addNode("microcycle", generateMicrocycle)
  .addEdge(START, "microcycle")
  .addEdge("microcycle", END);

const checkpointer = getMongoCheckpointer();
const microcycleApp = microcycleWorkflow.compile({ checkpointer });

/**
 * PHASE 2: Build the daily training schedule
 */
export const runMicrocycleAgent = async (profile: any, userId: string, currentMeso: any, feedback: string | null = null) => {
  const result = await microcycleApp.invoke(
    { profile, userId, currentMeso, feedback },
    { configurable: { thread_id: `microcycle_${userId}` } }
  );
  return result.finalPlan;
};
