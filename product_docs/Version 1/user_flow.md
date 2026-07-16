# FitMate — User Flow

**Version:** 1.0
**Date:** July 2026
**Status:** Active Development
**Audience:** Product, Design, Engineering

---

## Overview

This document maps every major user journey within FitMate v1 for both user roles: **Athlete** and **Trainer**. Each flow is broken into sequential steps, branching decision points, and the system actions triggered behind the scenes.

---

## Role Index

| Role    | How role is assigned                                     | Core Flows                                                          |
| ------- | -------------------------------------------------------- | ------------------------------------------------------------------- |
| Learner | Default on registration (email/password or Google OAuth) | Auth, Onboarding, AI Plan Generation, Workout Logging, Chat         |
| Trainer | Promoted from`learner` when Trainer Profile is created | Trainer Profile Setup, Marketplace Listing, Client Management, Chat |

> **Note:** There is no role selection during registration. Every new user starts as `learner`. A user becomes a `trainer` only by explicitly creating a Trainer Profile (`POST /api/trainer/profile`).

---

## Flow 1 — Authentication

### 1.1 Registration

```mermaid
flowchart TD
    A([Landing Page]) --> B[Register Page]
    B --> C["Fill: Name · Email · Password"]
    C --> D[Submit]
    D --> E[/"Backend: bcrypt hash password · create User doc · role defaults to 'learner' · issue JWT"/]
    E --> F([Onboarding Flow → Flow 2])
```

### 1.2 Google OAuth

```mermaid
flowchart TD
    A([Landing Page]) --> B["Click: Continue with Google"]
    B --> C[Google OAuth consent screen]
    C --> D[/"Backend: verify ID token · upsert User doc · role defaults to 'learner' · issue JWT"/]
    D --> E{User already has a profile?}
    E -->|No| F([Onboarding Flow → Flow 2])
    E -->|Yes| G{Has Trainer Profile?}
    G -->|Yes| H([Trainer Dashboard])
    G -->|No| I([Learner Dashboard])
```

### 1.3 Login

```mermaid
flowchart TD
    A([Landing Page]) --> B[Login Page]
    B --> C[Enter Email + Password]
    C --> D[Submit]
    D --> E[/"Backend: verify password · issue JWT · return hasProfile + hasTrainerProfile flags"/]
    E --> F{hasProfile?}
    F -->|No| G([Onboarding Flow → Flow 2])
    F -->|Yes| H{hasTrainerProfile?}
    H -->|Yes| I([Trainer Dashboard])
    H -->|No| J([Learner Dashboard])
```

---

## Flow 2 — Onboarding (Physical Profile Setup)

*Triggered for every new user (role: `learner`) who does not yet have a PhysicalProfile. Detected via the `hasProfile: false` flag returned by login/Google auth.*

```mermaid
flowchart TD
    A(["New User Login\n(hasProfile = false)"]) --> C

    C["Step 1: Basic Info\nAge · Gender · Weight · Height"]
    C --> D["Step 2: Fitness Goal\nMuscle Gain · Fat Loss · Endurance · General Fitness"]
    D --> E["Step 3: Experience Level\nBeginner · Intermediate · Advanced"]
    E --> F["Step 4: Training Availability\nDays/week (3–6) · Session duration (30–120 min)"]
    F --> G["Step 5: Health & Lifestyle\nInjuries/Limitations · Sleep Quality · Stress Level · Diet Preference"]
    G --> H[Complete Profile]
    H --> I[/"Backend: persist PhysicalProfile document in MongoDB"/]
    I --> J([Trigger AI Foundation Flow → Flow 3])
```

---

## Flow 3 — AI Workout Plan Generation

### 3.1 Foundation Flow (First-Time Plan)

```mermaid
flowchart TD
    A([Profile Complete]) --> B

    B["Strategy Agent\n━━━━━━━━━━━━━━━━━━\nReads PhysicalProfile\nGenerates Meso-phase roadmap:\n· Phase name & goal\n· Focus area\n· Duration in weeks\n· Start / end dates"]

    B --> C["Microcycle Generator\n━━━━━━━━━━━━━━━━━━\nBreaks meso-phase into 7-day schedule\nPer day:\n· Focus muscle group\n· Daily objective\n· Warmup → Exercises → Cooldown\n· Rest day flag"]

    C --> D[/"Backend: persist WorkoutPlan document linked to user"/]
    D --> E([Athlete Dashboard — Plan Ready])
```

### 3.2 Evolution Flow (Plan Adaptation)

```mermaid
flowchart TD
    A([Athlete Dashboard]) --> B["Click: Give Feedback"]
    B --> C["Enter feedback (free text)\ne.g. 'too hard' · 'injured shoulder' · 'more cardio'"]
    C --> D["Evolution Agent\n━━━━━━━━━━━━━━━━━━\nReads existing WorkoutPlan + feedback\nGenerates modified plan"]
    D --> E[/"Backend: atomically replace WorkoutPlan in MongoDB"/]
    E --> F([Athlete Dashboard — Updated Plan])
```

---

## Flow 4 — Workout Logging

*Daily interaction loop for the Athlete.*

```mermaid
flowchart TD
    A([Athlete Dashboard]) --> B[Select Today's Workout Day]
    B --> C{Day Type?}

    C -->|Rest Day| D[Mark as Rest Day]
    D --> E[/"Backend: log rest day entry"/]
    E --> K

    C -->|Exercise Day| F[Exercise Detail View\nname · sets × reps · intensity · notes]
    F --> G[Log Set: reps + weight]
    G --> H{More Sets / Exercises?}
    H -->|Yes| G
    H -->|No| I[Click: Complete Day]
    I --> J[/"Backend: create WorkoutLog entry\ndate · exercises · sets · reps · weight"/]
    J --> K[Dashboard: Day marked ✓]

    K --> L{Rate Session?}
    L -->|Yes| M["Rate 1–5 ★ + optional comment"]
    M --> N[/"Backend: store rating alongside log entry"/]
    L -->|No| O([Done])
    N --> O
```

---

## Flow 5 — Trainer Marketplace & Client Management

### 5.1 Becoming a Trainer (Role Promotion)

*Any learner can opt in to become a trainer by creating a Trainer Profile. This is the **only** way the role changes from `learner` to `trainer`.*

```mermaid
flowchart TD
    A([Trainers Page]) --> B["Click: Become a Trainer"]
    B --> C["Fill Trainer Profile\n━━━━━━━━━━━━━━━━━━\nFull Name · Bio · Certifications\nSpecializations · Experience Years\nHourly Rate · Social Links"]
    C --> D["Submit — POST /api/trainer/profile"]
    D --> E[/"Backend:\n1. Upsert Trainer document in MongoDB\n2. Promote User.role: 'learner' → 'trainer'"/]
    E --> F([Trainer Dashboard + Marketplace listing active])
```

### 5.2 Athlete Discovers & Contacts Trainer

```mermaid
flowchart TD
    A([Trainers Page]) --> C[Marketplace Listing]
    C --> D["Filter by: Specialization · Price · Rating"]
    D --> E[View Trainer Profile\nBio · Certs · Specializations · Reviews]
    E --> F[Click: Message Trainer]
    F --> G([Opens Chat → Flow 6])
```

### 5.3 Trainer Client Management

```mermaid
flowchart TD
    A([Trainer Dashboard]) --> B{Action?}

    B -->|View Clients| C[Client List]
    C --> D[Select Client]
    D --> E[View PhysicalProfile + WorkoutPlan]

    B -->|Message Client| F([Opens Chat → Flow 6])
```

---

## Flow 6 — Real-Time Messaging

*Available between Athlete ↔ Trainer pairs.*

```mermaid
sequenceDiagram
    participant C as Client (Athlete/Trainer)
    participant BE as Backend (REST + Socket.io)
    participant DB as MongoDB (DirectMessage)
    participant R as Recipient Client

    C->>BE: GET /api/messages/:userId1/:userId2
    BE-->>C: Load conversation history

    C->>BE: WebSocket connect
    C->>BE: emit "register" (userId)
    BE->>BE: Socket joins personal room (userId)

    C->>BE: emit "send_message" (senderId, receiverId, message)
    BE->>DB: create DirectMessage document
    BE-->>R: io.to(receiverId).emit("receive_message")
    BE-->>C: socket.emit("receive_message") (update sender UI)
```

---

## Flow 7 — AI Chat (Athlete ↔ AI Coach)

```mermaid
sequenceDiagram
    participant U as Athlete
    participant BE as Backend
    participant DB as MongoDB (ChatSession)
    participant AI as LangGraph / LLM
    participant Mem as Mem0 (Long-Term Memory)

    U->>BE: GET /api/chat/sessions
    BE-->>U: Load active sessions

    U->>BE: GET /api/chat/:threadId/history
    BE->>AI: Fetch LangGraph history
    AI-->>U: Return message history

    U->>BE: POST /api/chat (message, threadId)
    BE->>DB: Find/Create ChatSession
    BE->>AI: Forward message + PhysicalProfile context
    
    rect rgb(200, 220, 240)
        Note over BE, U: Server-Sent Events (SSE) Streaming
        AI-->>BE: Stream chunk (on_chat_model_stream)
        BE-->>U: res.write(chunk)
    end

    BE->>Mem: addInteraction (Sync to Long-Term Memory)
```

---

## Flow 8 — Profile & Settings Management

```mermaid
flowchart TD
    A([Dashboard]) --> B{Settings Action?}

    B -->|Update Physical Profile| C[Edit profile fields]
    C --> D[/"Backend: update PhysicalProfile document"/]
    D --> E{Regenerate Plan?}
    E -->|Yes| F([Trigger AI Foundation Flow → Flow 3])
    E -->|No| G([Dashboard])

    B -->|Update Trainer Profile| H["Edit: Bio · Certs · Rate"]
    H --> I[/"Backend: update Trainer document"/]
    I --> J([Marketplace listing updated])

    B -->|Change Password| K[Enter old + new password]
    K --> L{Old password correct?}
    L -->|Yes| M[/"Backend: update bcrypt hash"/]
    M --> N([Done])
    L -->|No| O[Show Error]
    O --> K
```

---

## Decision Points Summary

| Decision                             | Outcome A                                                    | Outcome B                        |
| ------------------------------------ | ------------------------------------------------------------ | -------------------------------- |
| `hasProfile` flag on login?        | `false` → Force Onboarding (Flow 2)                       | `true` → Proceed to dashboard |
| `hasTrainerProfile` flag on login? | `true` → Trainer Dashboard                                | `false` → Learner Dashboard   |
| Plan exists after onboarding?        | No → Trigger Foundation Flow                                | Yes → Show existing plan        |
| User submits feedback on plan?       | Yes → Trigger Evolution Flow                                | No → Plan unchanged             |
| Day type in workout plan?            | Exercise Day → Log sets                                     | Rest Day → Mark complete        |
| Messaging partner?                   | Human Trainer → WebSocket chat                              | AI → LLM chat session           |
| Learner opts in to become a trainer? | Yes → Create Trainer Profile → role promoted to`trainer` | No → Stays as`learner`        |

---

## System Touchpoints

| Flow               | Key System Actions                                                      |
| ------------------ | ----------------------------------------------------------------------- |
| Auth               | JWT issuance, bcrypt hashing, role-based redirect                       |
| Onboarding         | PhysicalProfile document creation in MongoDB                            |
| AI Plan Generation | Strategy Agent + Microcycle Generator → WorkoutPlan stored in MongoDB  |
| Workout Logging    | WorkoutLog entry per day, session rating persisted                      |
| Marketplace        | Trainer document indexed for listing, athlete ↔ trainer linking        |
| Real-time Chat     | Socket.io WebSocket rooms, `DirectMessage` documents in MongoDB         |
| AI Chat            | SSE streaming, LangGraph history, `ChatSession` in MongoDB, Mem0 memory |

---

*Last updated: July 2026 — FitMate v1.0*
