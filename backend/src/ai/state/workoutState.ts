import { Annotation } from "@langchain/langgraph";
import { z } from "zod";
// Removed old schema import as we now use decoupled strategy/microcycle nodes.

export const WorkoutState = Annotation.Root({
  profile: Annotation<any>(),
  userId: Annotation<string>(),
  currentMeso: Annotation<any>(), // Context for Phase 2
  feedback: Annotation<string | null>(), // User feedback/edit instructions
  finalPlan: Annotation<any>(),   // Result of Phase 1 or 2
  strategyNeeded: Annotation<boolean>(), // Decision from Evaluator
});
