# FitMate: AI-Driven Adaptive Coaching Platform

FitMate is a high-fidelity, professional-grade fitness platform that leverages cutting-edge AI architecture to provide personalized coaching, automated periodized workout planning, and persistent athlete memory.

## 🚀 Vision
FitMate transforms the static fitness experience into a dynamic, evolving partnership between the athlete and AI. It isn't just a workout tracker; it's an intelligent coach that remembers your progress, adapts to your fatigue, and plans your training with mathematical precision.

## ✨ Key Features
- **🧠 Intelligent AI Coach**: A multi-tiered chat interface that remembers your preferences across sessions.
- **📅 Automated Periodization**: Generates 3-phase strategic roadmaps (Macro/Meso cycles) and detailed 7-day training schedules (Microcycles).
- **💅 Premium High-Fidelity UI**: A sleek, dark-themed dashboard built with Tailwind CSS v4 and professional Lucide React iconography.
- **🔄 Adaptive Feedback Loop**: Adjust your training plan in real-time based on AI-driven feedback and performance metrics.
- **📱 Responsive by Design**: Fully optimized for mobile, tablet, and desktop viewing.

## 🛠️ Technical Architecture

### Frontend Layer
- **Framework**: Vite + React + TypeScript
- **Styling**: **Tailwind CSS v4** (using the new CSS-first paradigm)
- **UI Components**: **shadcn/ui** (customized with Base UI primitives for maximum flexibility)
- **Icons**: Lucide React & React Icons
- **Navigation**: React Router 6

### Backend Layer
- **Runtime**: Node.js & Express
- **Language**: TypeScript
- **Database**: MongoDB (Persisting users, profiles, and workout plans)

### AI Brain (The Memory Tier)
FitMate uses a sophisticated agentic architecture to manage intelligence:
- **Orchestration**: **LangGraph** for structured, graph-based agent workflows.
- **Inference Engine**: **Groq** (standardized on `llama-3.1-8b-instant`) for sub-second, low-latency responses.
- **STM (Short-Term Memory)**: A custom **Summarization Node** that prunes conversation history while maintaining a persistent context summary.
- **LTM (Long-Term Memory)**: **Mem0** integration for cross-session learning of athlete preferences and baseline personality.
- **Checkpointer**: MongoDB-backed thread persistence for stateful AI conversations.
- **LTM**: Mem0 for user preference persistence.

### Testing & Quality Assurance
- **Unit & Integration**: **Vitest** (Frontend & Backend)
- **API Testing**: **Supertest**
- **E2E Testing**: **Cypress**
- **Type Safety**: TypeScript 6.x

## 📁 Project Structure
```text
fitmate/
├── frontend/               # React + Tailwind v4 application
│   ├── src/
│   │   ├── components/     # Modular landing, chat, and workout UI
│   │   ├── pages/          # Main application views (Hero, Chat, Workout)
│   │   └── services/       # API clients and streaming services
├── backend/                # Node.js + Express + LangGraph server
│   ├── src/
│   │   ├── ai/             # The "Brain" (Graphs, Nodes, Memory)
│   │   ├── controllers/    # Business logic (Auth, Profile, Workout)
│   │   └── routes/         # Express API endpoints
└── HOW_TO_SETUP.md         # Detailed environment configuration guide
```

## ⚙️ Getting Started

### 1. Environment Configuration
Create a `.env` file in both `frontend/` and `backend/` directories.

**Backend `.env` Requirements:**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
MEM0_API_KEY=your_mem0_api_key
```

### 2. Installation & Launch
```bash
# Backend Setup
cd backend
npm install
npm run dev

# Frontend Setup
cd frontend
npm install
npm run dev
```

For a deep-dive into the CSS-first theme engine and path aliases, refer to the [Technical Setup Guide](file:///Users/yashagarwal/Downloads/WORK/Projects_Main/Fitmate/HOW_TO_SETUP.md).

## 📄 License
Internal Development - FitMate Team.
