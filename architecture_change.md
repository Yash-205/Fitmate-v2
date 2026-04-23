# Architectural Change: Persona-Based Role Management

This document outlines the transition to a modular, persona-based architecture for handling Learners and Trainers within the Fitmate platform. This design is inspired by scalable patterns used by industry leaders like Airbnb and Uber.

## 1. The Modular Identity Model

Instead of a single, monolithic "User" object, we have separated user data into three distinct, interconnected layers:

### A. The Core Identity (`User.ts`)
- **Purpose**: Handles Authentication (Email, Password, Auth Provider).
- **Role Field**: Acts as a state-switcher (`learner` or `trainer`).
- **Benefit**: One identity for the entire ecosystem.

### B. The Personal Persona (`Profile.ts`)
- **Purpose**: Stores health assessment and fitness data (Weight, Height, Goals).
- **Scope**: Every user (including Trainers) can have a personal profile to track their own fitness journey.

### C. The Professional Persona (`Trainer.ts`)
- **Purpose**: Stores coaching credentials (Certifications, Bio, Clients, Specialization).
- **Scope**: Only active when a user "promotes" themselves to a trainer status.

---

## 2. The Transition Flow ("Become a Trainer")

We have implemented a seamless transition flow that allows the platform to grow its coach base from its existing user pool.

### Step-by-Step Logic:
1. **Initial State**: User signs up and is assigned the `learner` role. They fill out their health `Profile`.
2. **Transition Trigger**: User calls the `/api/trainer/profile` endpoint (POST).
3. **Activation**:
    - The backend creates/updates a record in the `Trainer` collection.
    - The backend **promotes** the `User.role` from `learner` to `trainer`.
4. **Result**: The user now has access to the Trainer Dashboard (`/api/trainer/clients`) while retaining their personal workout history.

---

## 3. Why This Scales

1. **One-to-One Relationships**: Each module (Profile, Trainer) is linked to the `userId`. This keeps documents small and queries fast.
2. **Feature Decoupling**: We can update the "Trainer Discovery" logic without affecting the "AI Workout Generator" for learners.
3. **Data Integrity**: No data duplication. If a user changes their email, it updates in one place (`User`) and reflects across all personas.
4. **Future Proof**: If we add a "Nutritionist" role later, we simply add a `Nutritionist` model and a new role. The existing architecture remains untouched.

---

## 4. Security Enforcement
- **RBAC (Role-Based Access Control)**: Middleware ensures that only users with the `trainer` role can access sensitive client data, even though they might share the same base identity.
- **Mixed Access**: Certain routes (like Discovery) are open to all, while "Upgrade" routes are open to Learners who wish to become Coaches.
