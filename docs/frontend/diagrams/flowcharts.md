# Frontend Architecture — Flowcharts

---

## Table of Contents

1. [Flowchart 1: App Routing and Navigation Guard](#flowchart-1-app-routing-and-navigation-guard)
2. [Flowchart 2: Post-Login Decision Tree](#flowchart-2-post-login-decision-tree)

---

## Flowchart 1: App Routing and Navigation Guard

This flowchart shows how the app decides what to render for any given URL.

```mermaid
flowchart TD
    A["User visits a URL"] --> B{"Is path '/'?"}
    B -- Yes --> C["Render MainLanding Page"]
    B -- No --> D{"Is path '/profile'?"}
    D -- Yes --> E{"Is token in localStorage?"}
    E -- No --> F["Redirect to '/' Landing"]
    E -- Yes --> G["Render Profile Page"]
    D -- No --> H{"Is path '/workout'?"}
    H -- Yes --> I{"Is token in localStorage?"}
    I -- No --> F
    I -- Yes --> J["Render Workout Page"]
    H -- No --> K{"Is path '/trainer/dashboard'?"}
    K -- Yes --> L{"Is userRole === 'trainer'?"}
    L -- No --> F
    L -- Yes --> M["Render TrainerDashboard Page"]
    K -- No --> N{"Is path '/trainers'?"}
    N -- Yes --> O["Render Trainers Page (Public)"]
    N -- No --> P["No match — Redirect to '/' via Navigate"]
```

**Explanation:**
- `/trainers` is a public page — any visitor can browse trainers even while logged out.
- `/profile`, `/workout`, and `/chat` are soft-protected — they check for a token in `localStorage`. Currently this is a frontend-only guard. The backend always enforces the real security via JWT middleware.
- `/trainer/dashboard` has an additional role check — only users with `userRole === 'trainer'` in `localStorage` should reach it.

---

## Flowchart 2: Post-Login Decision Tree

This is the exact decision tree inside `useAppFlow.handleAuthSuccess` that determines where to send a user after they log in.

```mermaid
flowchart TD
    A["handleAuthSuccess(hasProfile) called"] --> B{"hasProfile is true?"}

    B -- No --> C["User is brand new — setIsProfileSetupOpen(true)"]
    C --> D["ProfileSetupModal appears"]

    B -- Yes --> E{"Read userRole from localStorage"}
    E --> F{"role === 'trainer'?"}

    F -- No --> G["Standard learner — setActivePersona('learner')"]
    G --> H["window.location.href = '/workout'"]

    F -- Yes --> I{"hasTrainerProfile === 'true'?"}
    I -- No --> J["Trainer without bio — setIsTrainerSetupOpen(true)"]
    J --> K["TrainerSetupModal appears"]

    I -- Yes --> L["Fully setup trainer — setActivePersona('trainer')"]
    L --> M["window.location.href = '/trainer/dashboard'"]
```

**Explanation:**
- This flowchart exposes the 4 distinct scenarios `handleAuthSuccess` handles, making it clear why the hook is complex.
- A Trainer user who hasn't completed their professional profile yet is caught here and redirected to `TrainerSetupModal` before they can access the dashboard.
- The `activePersona` flag is set into `localStorage` here to preserve the user's role context across page reloads.
