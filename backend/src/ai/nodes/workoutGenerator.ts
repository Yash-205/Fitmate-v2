import { WorkoutState } from "../state/workoutState";
import { StrategyGeneratorSchema, MicrocycleGeneratorSchema } from "../schemas/workoutSchema";
import { buildStrategyPrompt } from "../prompts/strategyPrompt";
import { buildMicrocyclePrompt } from "../prompts/microcyclePrompt";
import { buildIntentEvaluationPrompt } from "../prompts/evolutionPrompt";
import { searchMemories, addInteraction } from "../memory/mem0Service";
import { getFastModel } from "../utils/modelRegistry";
import { z } from "zod";

/**
 * NEW: Intent Evaluator Node
 * Determines if feedback warrants a full strategic shift or just a routine tweak.
 */
export async function evaluateAdjustmentIntent(state: typeof WorkoutState.State) {
  try {
    const { feedback, finalPlan } = state;
    console.log(`[Node: Evaluator] Starting... Feedback: "${feedback?.slice(0, 50)}..."`);
    
    if (!feedback || !finalPlan) {
      console.log(`[Node: Evaluator] No feedback/plan found. Defaulting to ROUTINE.`);
      return { strategyNeeded: false };
    }

    const model = getFastModel();
    // HARDENING: Overriding "Elite Coach" personality for strict logic
    const prompt = `STRICT DATA MODE: Analyze the following request and plan. Output ONLY the tool call. No preamble.
    ${buildIntentEvaluationPrompt(finalPlan, feedback)}`;
    
    const IntentSchema = z.object({
      requiresStrategyShift: z.boolean(),
      reasoning: z.string()
    });

    const structuredModel = model.withStructuredOutput(IntentSchema);
    const decision = await structuredModel.invoke(prompt);

    console.log(`[Node: Evaluator] Decision: ${decision.requiresStrategyShift} | Reason: ${decision.reasoning}`);

    return { strategyNeeded: decision.requiresStrategyShift };
  } catch (error) {
    console.error(`[Node: Evaluator] FATAL ERROR:`, error);
    throw error;
  }
}

/**
 * PHASE 1: Generate Strategic Roadmap (Macro/Meso)
 * Enhanced to handle feedback-driven shifts.
 */
export async function generateStrategy(state: typeof WorkoutState.State) {
  try {
    const model = getFastModel();
    const p = state.profile;
    const userId = state.userId;
    const feedback = state.feedback;

    console.log(`[Node: Strategy] Starting regeneration for User ${userId}...`);

    const historicalContext = await searchMemories(String(userId), "workout preference, fitness style, past success") 
      || "No prior strategy found. Starting initial assessment.";

    let strategyPrompt = buildStrategyPrompt(p, historicalContext);
    if (feedback) {
      strategyPrompt += `\n\n<CRITICAL ADJUSTMENT REQUEST>\n${feedback}\nYou MUST rebuild the entire strategy roadmap to reflect this instruction.\n</CRITICAL ADJUSTMENT REQUEST>`;
    }

    // HARDENING: Ensure tool-calling stability
    const finalPrompt = `STRICT DATA MODE: GENERATE LONG-TERM STRATEGY. Output ONLY the tool call. No preamble.
    ${strategyPrompt}`;

    const structuredModel = model.withStructuredOutput(StrategyGeneratorSchema, { name: "training_strategy" });
    const response = await structuredModel.invoke(finalPrompt);

    addInteraction(String(userId), [
      { role: "assistant", content: `Strategic Roadmap Updated: ${response.overarchingStrategy}. New Split: ${response.splitType}. Reason: ${feedback || "Initial Generation"}` }
    ]);

    console.log(`[Node: Strategy] Roadmap rebuilt: ${response.splitType} | ${response.mesoPhases.length} phases.`);

    return { 
      finalPlan: {
        ...response,
        userId: state.userId,
        currentPhase: response.mesoPhases[0].name,
        schedule: [] 
      }
    };
  } catch (error) {
    console.error(`[Node: Strategy] FATAL ERROR:`, error);
    throw error;
  }
}

/**
 * PHASE 2: Generate Detailed Microcycle (7-day schedule)
 */
export async function generateMicrocycle(state: typeof WorkoutState.State) {
  try {
    const model = getFastModel();
    const p = state.profile;
    const userId = state.userId;
    const feedback = state.feedback;
    
    const currentPlan = state.finalPlan;
    if (!currentPlan) throw new Error("No training context found for microcycle generation.");

    console.log(`[Node: Microcycle] Generating schedule for Phase: ${currentPlan.currentPhase}...`);

    const currentMeso = currentPlan.mesoPhases.find((m: any) => m.name === currentPlan.currentPhase) || currentPlan.mesoPhases[0];
    const historicalContext = await searchMemories(String(userId), "exercise performance, strength numbers, form issues")
      || "First microcycle for this phase.";

    const microcyclePrompt = buildMicrocyclePrompt(p, currentMeso, historicalContext, feedback);
    
    // HARDENING: Multi-layer instruction to suppress conversational output
    const finalPrompt = `STRICT DATA MODE: GENERATE 7-DAY SCHEDULE. Output ONLY the tool call. No preamble. No conversational text.
    ${microcyclePrompt}`;

    const structuredModel = model.withStructuredOutput(MicrocycleGeneratorSchema, { name: "weekly_microcycle" });
    const response = await structuredModel.invoke(finalPrompt);

    if (Array.isArray(response.schedule) && response.schedule.length < 7) {
      const existingDays = response.schedule.map((d: any) => d.day);
      for (let i = 1; i <= 7; i++) {
        const dayLabel = `Day ${i}`;
        if (!existingDays.includes(dayLabel)) {
          response.schedule.push({
            day: dayLabel,
            focus: "Rest & Recovery",
            isRestDay: true,
            exercises: [],
          });
        }
      }
      response.schedule.sort((a: any, b: any) => {
        const getNum = (dayStr: string) => parseInt(dayStr.replace(/[^0-9]/g, ""), 10) || 0;
        return getNum(a.day) - getNum(b.day);
      });
    }

    addInteraction(String(userId), [
      { role: "assistant", content: `Programmed Microcycle for ${currentMeso.name}: ${response.schedule.map((d:any) => d.focus).join(", ")}.` }
    ]);

    console.log(`[Node: Microcycle] Schedule complete. User: ${userId}`);

    return { 
      finalPlan: {
        ...currentPlan,
        schedule: response.schedule,
        progressionRule: response.progressionRule,
        deloadStrategy: response.deloadStrategy,
      }
    };
  } catch (error) {
    console.error(`[Node: Microcycle] FATAL ERROR:`, error);
    throw error;
  }
}

