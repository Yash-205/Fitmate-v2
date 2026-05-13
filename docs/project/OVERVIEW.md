# FitMate: Project Overview

FitMate is a high-fidelity, professional-grade fitness platform designed to bridge the gap between AI automation and human coaching expertise. It provides athletes with a seamless, adaptive training experience powered by a sophisticated multi-agent AI architecture.

## 🚀 The Vision
To democratize elite-level personal training by providing every user with an "AI Coach in their pocket" that remembers their history, understands their goals, and evolves their training program in real-time.

---

## 🛠️ Core Features

### 1. AI Adaptive Coaching
- **Strategic Roadmapping**: Generates long-term "Meso-phase" plans based on an initial physical assessment.
- **Microcycle Generation**: Breaks down high-level goals into tactical 7-day workout schedules.
- **Evolution Engine**: Uses LangGraph-powered agents to adjust the plan based on user feedback ("too hard," "too easy," "injured," etc.).

### 2. Intelligent Chat Interface
- **Continuous Memory**: Utilizes **Mem0** for long-term memory, allowing the AI to remember your preferences and progress across months of conversation.
- **Real-time Guidance**: Provides instant answers to nutrition, form, and recovery questions.

### 3. Professional Trainer Ecosystem
- **Marketplace**: Connects athletes with human professional coaches.
- **Coach Mode**: A dedicated dashboard for trainers to manage their clients and track their baseline metrics.

---

## 🏗️ Technical Stack

### Frontend (The "Persona" Layer)
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS 4.0 + Shadcn/UI (for a premium, high-fidelity look)
- **State/Routing**: React Router 7 + Custom Hooks for centralized logic (`useAppFlow`)

### Backend (The "Engine" Room)
- **Server**: Node.js / Express / TypeScript
- **Database**: MongoDB (Mongoose) for user data and workout persistence.

### AI Architecture (The "Brain")
- **Orchestration**: **LangGraph** for managing complex, stateful AI workflows.
- **Memory**: **Mem0** for Long-Term Memory (LTM) and MongoDB Checkpointers for Short-Term Memory (STM).
- **Models**: Standardized via a Model Registry to support OpenAI, Anthropic, and other providers.

---

## 📂 Project Structure
- `/frontend`: React application, UI components, and client-side services.
- `/backend`: API server, AI agents, and database models.
- `/docs`: Comprehensive documentation covering setup, architecture, and standards.
