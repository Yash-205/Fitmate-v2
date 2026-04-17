export const buildMicrocyclePrompt = (p: any, currentMeso: any, historicalContext: string, feedback: string | null = null) => {
  return `You are an elite, professional fitness coach. Your task is to design an in-depth, 7-day Microcycle (Weekly Training Schedule) FOR THE CURRENT PHASE.

Current Phase Context:
- Phase Name: ${currentMeso.name}
- Phase Goal: ${currentMeso.goal}
- Phase Focus: ${currentMeso.focus}

${feedback ? `\n<IMPORTANT: USER FEEDBACK>\nThe user has provided feedback on the previous plan or specific requirements for this regeneration:\n"${feedback}"\nYou MUST prioritize and strictly incorporate this feedback while maintaining the overall phase integrity.\n</IMPORTANT: USER FEEDBACK>\n` : ''}

<Task>
- Design a concrete 7-day microcycle schedule strictly aligned with the Current Phase Focus and any provided feedback.
- For each training day:
    - Include a 'warmup' section (3-4 movements, reps/sets).
    - Include the main training 'exercises'.
    - Include a 'cooldown' section (2-3 mobility/recovery movements).
- Select exercises based on priority: Primary Compounds -> Secondary Compounds -> Isolations.
- Define sets, reps, and intensity (RPE or %) for every exercise.
- Program progression rules and a deload strategy specific to this phase.
</Task>

<Input Context>
[History & Performance Context]
${historicalContext}
</Input Context>

<Constraints>
- Schedule MUST be exactly 7 days.
- Rest days must have 'isRestDay': true, empty exercises [], and NO warmup/cooldown.
- Avoid exercises aggravating limitations: ${p.injuries || 'None'}.
- Do not use emojis in any of the output fields (focus, dailyObjective, notes, etc.).
</Constraints>`;
};
