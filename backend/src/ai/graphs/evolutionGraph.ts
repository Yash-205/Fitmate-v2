import { StateGraph, START, END } from "@langchain/langgraph";
import { WorkoutState } from "../state/workoutState";
import { 
  generateStrategy, 
  generateMicrocycle, 
  evaluateAdjustmentIntent 
} from "../nodes/workoutGenerator";
import { getMongoCheckpointer } from "../memory/checkpointer";

/**
 * Evolution Graph
 * ---------------
 * This graph manages the "Interconnected" evolution of a fitness plan.
 * It decides whether to shift the strategic Roadmap OR just tweak the routine schedule.
 */

const evolutionWorkflow = new StateGraph(WorkoutState)
  // 1. Add nodes
  .addNode("evaluator", evaluateAdjustmentIntent)
  .addNode("strategy", generateStrategy)
  .addNode("microcycle", generateMicrocycle)

  // 2. Define edges
  .addEdge(START, "evaluator")

  // 3. Conditional Routing from Evaluator
  .addConditionalEdges(
    "evaluator",
    (state) => (state as any).strategyNeeded ? "strategy" : "microcycle",
    {
      strategy: "strategy",
      microcycle: "microcycle"
    }
  )

  // 4. Sequential flow if strategy was regenerated
  .addEdge("strategy", "microcycle")
  
  // 5. Termination
  .addEdge("microcycle", END);

const checkpointer = getMongoCheckpointer();

export const evolutionApp = evolutionWorkflow.compile({ checkpointer });

/**
 * Main entry point for evolving a training plan (Adjustment flow)
 */
export const runEvolutionAgent = async (
  profile: any, 
  userId: string, 
  finalPlan: any, 
  feedback: string
) => {
  const result = await evolutionApp.invoke(
    { 
      profile, 
      userId, 
      finalPlan, 
      feedback 
    },
    { 
      configurable: { 
        thread_id: `evolution_${userId}` 
      } 
    }
  );
  
  return result.finalPlan;
};
