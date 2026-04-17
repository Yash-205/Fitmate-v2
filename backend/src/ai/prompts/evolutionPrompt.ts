export const buildIntentEvaluationPrompt = (currentPlan: any, feedback: string) => {
  return `You are a high-level fitness program architect. Your task is to evaluate if a user's adjustment feedback warrants a full STRATEGIC RE-EVALUATION of their fitness journey or just a ROUTINE TWEAK to their weekly schedule.

Current Plan Context:
- Split Type: ${currentPlan.splitType}
- Current Phase: ${currentPlan.currentPhase}
- Weekly Frequency: ${currentPlan.weeklyFrequency} days/week

User Feedback:
"${feedback}"

<Decision Criteria>
- STRATEGIC SHIFT (true): If the user wants to change their fundamental training goal, training frequency (days/week), training split, says they are more/less advanced than the current phase suggests (e.g., "skip foundation", "I'm an expert"), or has a major lifestyle change.
- ROUTINE TWEAK (false): If the user wants to swap an exercise, change sets/reps for a specific day, shorten a specific workout, or adjust intensity without changing the overall phase focus.
</Decision Criteria>

Your output MUST be a JSON object with:
{
  "requiresStrategyShift": boolean,
  "reasoning": "string explain why"
}`;
};
