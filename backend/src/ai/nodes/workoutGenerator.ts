import { ChatGroq } from "@langchain/groq";
import { WorkoutState } from "../state/workoutState";
import { StrategyGeneratorSchema, MicrocycleGeneratorSchema } from "../schemas/workoutSchema";
import { buildStrategyPrompt } from "../prompts/strategyPrompt";
import { buildMicrocyclePrompt } from "../prompts/microcyclePrompt";
import { getMem0Client } from "../memory/mem0Service";

const getModel = () => new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.4,
});

/**
 * PHASE 1: Generate Strategic Roadmap (Macro/Meso)
 */
export async function generateStrategy(state: typeof WorkoutState.State) {
  const model = getModel();
  const p = state.profile;
  const userId = state.userId;

  let historicalContext = "No prior strategy found. Starting initial assessment.";
  try {
    const mem0 = getMem0Client();
    const memories = await mem0.search("workout preference, fitness style, past success", { filters: { user_id: String(userId) } });
    if (memories?.results?.length > 0) {
      historicalContext = memories.results.map((m: any) => m.memory).join("\n");
    }
  } catch (err) {}

  const prompt = buildStrategyPrompt(p, historicalContext);
  const structuredModel = model.withStructuredOutput(StrategyGeneratorSchema, { name: "training_strategy" });
  const response = await structuredModel.invoke(prompt);

  // Sync Strategy to LTM
  try {
    const mem0 = getMem0Client();
    mem0.add([{ role: "assistant", content: `Established Strategic Roadmap: ${response.overarchingStrategy}. Selected Split: ${response.splitType}.` }], { user_id: String(userId) });
  } catch (err) {}

  return { finalPlan: response };
}

/**
 * PHASE 2: Generate Detailed Microcycle (7-day schedule)
 */
export async function generateMicrocycle(state: typeof WorkoutState.State) {
  const model = getModel();
  const p = state.profile;
  const userId = state.userId;
  const currentMeso = state.currentMeso;
  const feedback = state.feedback;

  if (!currentMeso) throw new Error("No current mesocycle context found for microcycle generation.");

  let historicalContext = "First microcycle for this phase.";
  try {
    const mem0 = getMem0Client();
    const memories = await mem0.search("exercise performance, strength numbers, form issues", { filters: { user_id: String(userId) } });
    if (memories?.results?.length > 0) {
      historicalContext = memories.results.map((m: any) => m.memory).join("\n");
    }
  } catch (err) {}

  const prompt = buildMicrocyclePrompt(p, currentMeso, historicalContext, feedback);
  const structuredModel = model.withStructuredOutput(MicrocycleGeneratorSchema, { name: "weekly_microcycle" });
  const response = await structuredModel.invoke(prompt);

  // Ensure 7 days and correct structure
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

  // Sync Microcycle to LTM
  try {
    const mem0 = getMem0Client();
    mem0.add([{ role: "assistant", content: `Programmed Microcycle for ${currentMeso.name}: ${response.schedule.map((d:any) => d.focus).join(", ")}. Progression rule: ${response.progressionRule}.` }], { user_id: String(userId) });
  } catch (err) {}

  return { finalPlan: response };
}

