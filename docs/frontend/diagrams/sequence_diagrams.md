# Frontend Architecture — Sequence Diagrams

---

## Table of Contents

1. [Sequence Diagram 1: Email Login Flow](#sequence-diagram-1-email-login-flow)
2. [Sequence Diagram 2: Google OAuth Login Flow](#sequence-diagram-2-google-oauth-login-flow)
3. [Sequence Diagram 3: New User Signup + Profile Setup Flow](#sequence-diagram-3-new-user-signup--profile-setup-flow)
4. [Sequence Diagram 4: Workout Plan Fetch Flow](#sequence-diagram-4-workout-plan-fetch-flow)
5. [Sequence Diagram 5: Real-Time Chat Message Flow](#sequence-diagram-5-real-time-chat-message-flow)
6. [Sequence Diagram 6: Logout Flow](#sequence-diagram-6-logout-flow)

---

## Sequence Diagram 1: Email Login Flow

This diagram traces the exact lifecycle of a user clicking "Log In" with their email and password, from UI interaction all the way to localStorage persistence.

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant AuthModal
    participant AuthService
    participant fetchClient
    participant BackendAPI as Backend Express API
    participant LocalStorage
    participant useAppFlow

    User->>AuthModal: Fills email + password, clicks "Log In"
    AuthModal->>AuthModal: setLoading(true), setError('')
    AuthModal->>AuthService: login({ email, password })
    AuthService->>fetchClient: POST /auth/login
    fetchClient->>fetchClient: Read token from localStorage (none yet)
    fetchClient->>BackendAPI: POST /auth/login (no Bearer token)
    BackendAPI->>BackendAPI: Validates credentials against MongoDB
    alt Credentials are valid
        BackendAPI-->>fetchClient: 200 OK { token, role, hasProfile, hasTrainerProfile }
        fetchClient-->>AuthService: Parsed JSON response
        AuthService->>LocalStorage: setItem token, isLoggedIn, userName, userRole, hasProfile
        AuthService-->>AuthModal: Returns { hasProfile: boolean }
        AuthModal->>useAppFlow: onSuccess(hasProfile)
        useAppFlow->>useAppFlow: handleAuthSuccess(hasProfile) — decides next route
    else Invalid credentials
        BackendAPI-->>fetchClient: 401 Unauthorized { message }
        fetchClient-->>AuthService: throws Error
        AuthService-->>AuthModal: throws Error
        AuthModal->>AuthModal: setError(err.message)
        AuthModal->>User: Displays red error message inline
    end
    AuthModal->>AuthModal: setLoading(false)
```

**Explanation:**
- `AuthModal` owns the UX state (`loading`, `error`) and never touches `localStorage` itself.
- `AuthService` is exclusively responsible for writing the session to `localStorage`. This is a critical separation of concerns — the component should never know about token storage details.
- The `onSuccess(hasProfile)` callback passes only a single boolean upward to `useAppFlow`, keeping the modal's concerns isolated from navigation logic.

---

## Sequence Diagram 2: Google OAuth Login Flow

This shows how the Google ID Token flows through the system — from the Google SDK in the browser to backend verification and session creation.

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant GoogleSDK as Google OAuth SDK
    participant AuthModal
    participant AuthService
    participant fetchClient
    participant BackendAPI as Backend Express API
    participant GoogleServers as Google Verification Servers
    participant LocalStorage
    participant useAppFlow

    User->>GoogleSDK: Clicks "Continue with Google" button
    GoogleSDK->>GoogleSDK: Opens Google Account Picker popup
    User->>GoogleSDK: Selects their Google Account
    GoogleSDK-->>AuthModal: onSuccess({ credential: "ID_TOKEN_JWT" })
    AuthModal->>AuthService: googleAuth(credentialResponse.credential)
    AuthService->>fetchClient: POST /auth/google { credential }
    fetchClient->>BackendAPI: POST /auth/google
    BackendAPI->>GoogleServers: Verify ID Token signature
    GoogleServers-->>BackendAPI: Token valid { email, name, picture }
    BackendAPI->>BackendAPI: Find or create User in MongoDB
    BackendAPI-->>fetchClient: 200 OK { token, role, hasProfile }
    fetchClient-->>AuthService: Parsed response
    AuthService->>LocalStorage: Persist token, userName, userRole, hasProfile
    AuthService-->>AuthModal: Returns { hasProfile }
    AuthModal->>useAppFlow: onSuccess(hasProfile)
    useAppFlow->>useAppFlow: Routes user to correct dashboard
```

**Explanation:**
- The Google OAuth flow is specifically designed so that **Fitmate's backend never receives the user's Google password**. It only receives a short-lived, signed ID Token.
- The backend forwards that token to Google's own verification servers to confirm its authenticity before creating a session. This is the standard OAuth2/OIDC pattern.
- After verification the flow is identical to email login — `AuthService` persists the session and `useAppFlow` handles navigation.

---

## Sequence Diagram 3: New User Signup + Profile Setup Flow

This traces the full multi-step onboarding journey of a brand-new user from registration to their first workout dashboard.

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant AuthModal
    participant AuthService
    participant BackendAPI as Backend API
    participant useAppFlow
    participant ProfileSetupModal
    participant ProfileService
    participant Browser as Browser (navigate)

    User->>AuthModal: Fills name, email, password, clicks "Sign Up"
    AuthModal->>AuthService: signup({ name, email, password })
    AuthService->>BackendAPI: POST /auth/signup
    BackendAPI-->>AuthService: 200 OK { token, role, hasProfile: false }
    AuthService->>AuthService: Persist token, role to localStorage
    AuthService-->>AuthModal: { hasProfile: false }
    AuthModal->>useAppFlow: onSuccess(false)

    Note over useAppFlow: hasProfile is false — new user needs onboarding
    useAppFlow->>useAppFlow: setAuthModal(isOpen: false)
    useAppFlow->>useAppFlow: setIsProfileSetupOpen(true)

    useAppFlow-->>ProfileSetupModal: isOpen = true

    loop Multi-Step Assessment Wizard
        User->>ProfileSetupModal: Fills Step 1 (body metrics)
        ProfileSetupModal->>ProfileSetupModal: currentStep = 2
        User->>ProfileSetupModal: Fills Step 2 (fitness goals)
        ProfileSetupModal->>ProfileSetupModal: currentStep = 3
        User->>ProfileSetupModal: Fills Step 3 (experience), clicks Submit
    end

    ProfileSetupModal->>ProfileService: createProfile(formData)
    ProfileService->>BackendAPI: POST /profile
    BackendAPI-->>ProfileService: 200 OK
    ProfileSetupModal->>useAppFlow: onSuccess()
    useAppFlow->>useAppFlow: handleSetupSuccess('profile')
    useAppFlow->>Browser: window.location.href = '/workout'
    Browser-->>User: Workout dashboard renders with AI plan
```

**Explanation:**
- The entire onboarding is orchestrated by `useAppFlow` reacting to the `hasProfile: false` flag returned from the backend after signup.
- `ProfileSetupModal` manages `currentStep` and accumulated `formData` internally. The parent (`App.tsx`) only knows whether the modal is open or closed.
- `window.location.href` is used intentionally (instead of React Router's `navigate`) to force a hard page reload, which resets all component state and ensures the new session data from `localStorage` is freshly read by every component.

---

## Sequence Diagram 4: Workout Plan Fetch Flow

This shows what happens when the `Workout` page loads and needs to display the user's AI-generated plan.

```mermaid
sequenceDiagram
    autonumber
    participant Browser
    participant Workout as Workout Page
    participant WorkoutService
    participant fetchClient
    participant LocalStorage
    participant BackendAPI as Backend API

    Browser->>Workout: User navigates to /workout
    Workout->>Workout: setLoading(true)
    Workout->>WorkoutService: getWorkoutPlan()
    WorkoutService->>fetchClient: GET /workouts/my-plan
    fetchClient->>LocalStorage: getItem('token')
    LocalStorage-->>fetchClient: JWT Token string
    fetchClient->>BackendAPI: GET /workouts/my-plan (Bearer Token)
    BackendAPI->>BackendAPI: Verifies JWT, extracts userId
    BackendAPI->>BackendAPI: Queries MongoDB for plan by userId

    alt Plan found
        BackendAPI-->>fetchClient: 200 OK { WorkoutPlan }
        fetchClient-->>WorkoutService: Parsed WorkoutPlan
        WorkoutService-->>Workout: WorkoutPlan data
        Workout->>Workout: setWorkoutPlan(data), setLoading(false)
        Workout-->>Browser: Renders PhaseSlider, Calendar, DayPlanCard
    else No plan exists yet
        BackendAPI-->>fetchClient: 404 Not Found
        fetchClient-->>WorkoutService: throws { status: 404 }
        WorkoutService-->>Workout: throws error
        Workout->>Workout: setError('No plan found'), setLoading(false)
        Workout-->>Browser: Renders "Generate Plan" CTA button
    end
```

**Explanation:**
- `fetchClient` is the only component that reads from `localStorage`. The `Workout` page and `WorkoutService` never directly touch the JWT.
- The `404` response is handled as a **business logic branch**, not a hard error — it means the user simply doesn't have a plan yet and is shown a "Generate Plan" button instead of an error screen.

---

## Sequence Diagram 5: Real-Time Chat Message Flow

This is the most complex sequence in the app, showing both the initial HTTP history load and the ongoing Socket.io real-time message exchange.

```mermaid
sequenceDiagram
    autonumber
    participant User as User (Athlete)
    participant ChatBox
    participant MessageService
    participant fetchClient
    participant BackendAPI as Backend HTTP API
    participant SocketClient as Socket.io Client
    participant SocketServer as Socket.io Server
    participant CoachUser as Coach (Other User)

    Note over ChatBox: Component mounts — two data channels initialize simultaneously

    ChatBox->>MessageService: getConversationHistory(userId, targetId)
    MessageService->>fetchClient: GET /messages/:userId/:targetId
    fetchClient->>BackendAPI: HTTP GET (with Bearer token)
    BackendAPI-->>fetchClient: 200 OK [ ...historicalMessages ]
    fetchClient-->>MessageService: Message array
    MessageService-->>ChatBox: setMessages(history)
    ChatBox-->>User: Renders historical messages

    ChatBox->>SocketClient: getSocket() — singleton connects once
    SocketClient->>SocketServer: TCP Handshake (socket.io connect)
    SocketServer-->>SocketClient: Connection established (socket.id)
    ChatBox->>SocketClient: socket.on("receive_message", handler)

    Note over User,CoachUser: Real-time exchange begins

    User->>ChatBox: Types message, presses Enter / Send button
    ChatBox->>SocketClient: socket.emit("send_message", { senderId, receiverId, message })
    SocketClient->>SocketServer: WebSocket frame sent
    SocketServer->>SocketServer: Saves message to MongoDB
    SocketServer->>CoachUser: Emits "receive_message" to coach's socket room

    CoachUser->>SocketServer: Replies with socket.emit("send_message", ...)
    SocketServer->>SocketClient: Emits "receive_message" to athlete's socket room
    SocketClient-->>ChatBox: "receive_message" event fires handler
    ChatBox->>ChatBox: setMessages(prev => [...prev, newMessage])
    ChatBox-->>User: New message appears in UI instantly
```

**Explanation:**
- `ChatBox` runs two data channels in parallel from the same `useEffect`: an HTTP call via `MessageService` for historical messages and a WebSocket subscription via `SocketClient` for new real-time messages.
- `getSocket()` implements the Singleton pattern — calling it multiple times returns the exact same connection instance, preventing duplicate socket connections.
- Messages sent via `socket.emit` are NOT added to local state by the sender directly. Instead, the server broadcasts the message back, and the sender's own `receive_message` handler picks it up. This ensures both users always see the same data.

---

## Sequence Diagram 6: Logout Flow

This shows the complete teardown of a user's session.

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant Navbar
    participant AuthService
    participant LocalStorage
    participant Browser

    User->>Navbar: Clicks "Logout" button
    Navbar->>AuthService: AuthService.logout()
    AuthService->>LocalStorage: removeItem('token')
    AuthService->>LocalStorage: removeItem('isLoggedIn')
    AuthService->>LocalStorage: removeItem('userEmail')
    AuthService->>LocalStorage: removeItem('userRole')
    AuthService->>LocalStorage: removeItem('hasProfile')
    AuthService->>LocalStorage: removeItem('hasTrainerProfile')
    AuthService-->>Navbar: Logout complete
    Navbar->>Browser: window.location.href = '/'
    Browser-->>User: Landing page renders as unauthenticated
```

**Explanation:**
- Logout is entirely client-side. The backend JWT is stateless — once `localStorage` is cleared, the token is effectively invalidated from the frontend's perspective.
- The hard redirect to `/` forces all components to re-initialize and discover there is no token in `localStorage`, ensuring no stale authenticated state lingers in React memory.
