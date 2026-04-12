# FitMate Project Plan & Status

## Current Progress: What We Have Till Now
We have successfully set up the foundation for the FitMate backend using **Node.js, Express, TypeScript, and MongoDB**. 

Here is the current state of the architecture:

### 1. Server & Database Configuration
- **Fast Express Server** (`src/server.ts`): Setup with JSON body parsing and CORS for cross-origin requests.
- **Database Connection** (`src/config/db.ts`): Established a robust connection to MongoDB using Mongoose.
- **Environment Variables** (`.env`): Safely storing `PORT`, `MONGO_URI`, and `JWT_SECRET`.

### 2. User Authentication (Ready but unlinked)
- **User Model** (`src/models/User.ts`): Created a schema to store `email`, `password`, and authentication `provider` (local vs. google).
- **Security & Tokens** (`src/utils/generateToken.ts`): Ready to issue JSON Web Tokens (JWT) valid for 7 days.
- **Authentication Controllers** (`src/controllers/authController.ts`): 
  - `signup`: Hashes passwords via `bcrypt` and creates new users.
  - `login`: Compares passwords and issues tokens.
  - `googleAuth`: Pre-configured for future Google SSO integration.
- **Auth Routes** (`src/routes/authRoutes.ts`): Grouped routes for `/signup`, `/login`, and `/google`.

### 3. User Domain
- **Profile Model** (`src/models/Profile.ts`): Configured to store key metrics like `age`, `weight`, `height`, `goal`, `diet`, and `activityLevel`. Linked directly to the `User` document.

---

## The First Step: Completing Auth & Building the AI Chatbot

Now that the foundation is present, here is the plan to achieve our first major milestone: **Finalizing Auth and Creating the AI Chatbot** that guides users by resolving their doubts based on their profile data.

### Step 1.1: Finalize Backend Authentication
Currently, the auth logic is built but not actually used by the server yet.
1. **Link Routes**: Import `authRoutes` in `server.ts` and map it to an endpoint like `/api/auth`.
2. **Install Types**: Run `npm install -D @types/jsonwebtoken @types/bcrypt` so TypeScript can properly compile the auth controllers.
3. **Middleware Setup**: Create an `authMiddleware.ts` file to automatically verify incoming JWTs, extract the `userId` payload, and let us protect specific routes (like the future Chatbot endpoints).

### Step 1.2: Implement the Profile Pipeline
To make an AI chatbot truly personalized, it needs access to the user's data.
1. **Profile Routes**: Create endpoints (`POST /api/profile` and `GET /api/profile`) letting users fill in their age, weight, diet, and fitness goals upon onboarding.
2. **Retrieve Context**: Whenever a user hits the Chatbot API, we will fetch this `Profile` document from MongoDB using the user's ID to use as conversational context.

### Step 1.3: Implement the AI Chatbot Engine
1. **Choose an AI Provider**: We need to integrate an LLM (such as the Gemini API, OpenAI API, or open-source Hugging Face models) via an SDK.
2. **System Prompt Engineering**: Design an instruction prompt, e.g., *"You are FitMate, an elite personal fitness coach. The user is a [age] year-old [activity level] who wants to [goal] focusing on a [diet] diet."*
3. **Chat API Endpoint**: Develop a `POST /api/chat` protected route. 
   - Takes the user's chat input.
   - Fetches the user's `Profile` from the database.
   - Combines the input, the user metrics, and the system prompt.
   - Sends it to the AI API and returns the response back to the user to resolve their queries.
