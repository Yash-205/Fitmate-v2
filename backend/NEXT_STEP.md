# Next Milestone: Personalized Workout Planner

## Objective

Enable users to request a custom workout plan from the AI, which is then parsed into structured data and saved to their profile for tracking.

## Phase 1: Backend Expansion

### 1.1 Create the WorkoutPlan Model

Define a schema in `src/models/WorkoutPlan.ts` to store:

- `userId`: Reference to the user.
- `difficulty`: (Beginner/Intermediate/Advanced) based on profile.
- `daysPerWeek`: How many days they plan to train.
- `schedule`: An array of days, each containing an array of exercises (name, sets, reps, muscle focus).

### 1.2 Structured AI Logic

Update `src/ai/agent.ts` or create a new service that:

- Uses a "Plan Prompt": *"As a coach, generate a 7-day workout split in JSON format for a user who wants to [GOAL]."*
- Uses **JSON Mode** (Groq supports this) to ensure the output is valid code.

### 1.3 Workout Endpoints

Add `src/routes/workoutRoutes.ts`:

- `POST /api/workout/generate`: Triggers AI, saves to DB, returns JSON.
- `GET /api/workout/current`: Fetches the active plan for the user.

## Phase 2: Frontend implementation

### 2.1 The Workout Dashboard

- Build a "My Plan" page.
- Create a visual "Card" for each day of the workout split.
- Add a "Regenerate Plan" button that calls the new API.

### 2.2 Integration

- Call the `generate` endpoint when the user clicks a button in the Chat or specifically on the Workout page.
