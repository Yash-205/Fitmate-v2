# Frontend Architecture — State Diagrams

---

## Table of Contents

1. [State Diagram 1: AuthModal View States](#state-diagram-1-authmodal-view-states)
2. [State Diagram 2: Global App Flow States](#state-diagram-2-global-app-flow-states)
3. [State Diagram 3: ChatBox Lifecycle](#state-diagram-3-chatbox-lifecycle)

---

## State Diagram 1: AuthModal View States

This shows all the states the `AuthModal` can be in, and what triggers transitions between them.

```mermaid
stateDiagram-v2
    [*] --> Closed : App initializes

    Closed --> LoginView : openLogin() called from Navbar or Landing
    Closed --> SignupView : openSignup() called from Navbar or Landing

    LoginView --> SignupView : User clicks "Sign Up" toggle link
    SignupView --> LoginView : User clicks "Log In" toggle link

    LoginView --> LoadingState : User submits form
    SignupView --> LoadingState : User submits form

    LoadingState --> ErrorState : API returns 4xx error
    LoadingState --> Closed : API returns 200 (onSuccess fires)

    ErrorState --> LoadingState : User corrects form and resubmits
    ErrorState --> Closed : User clicks X to close

    LoginView --> Closed : User clicks X to close
    SignupView --> Closed : User clicks X to close
```

**Explanation:**
- The modal can only ever be in one of these discrete states at a time.
- `LoadingState` is not a separate component — it is the same JSX but with the button showing a spinner and `disabled={true}`.
- The `ErrorState` does not lock the user out — they can correct their input and submit again, which transitions directly back to `LoadingState`.

---

## State Diagram 2: Global App Flow States

This shows the high-level states the entire application can be in from a flow perspective, managed by `useAppFlow`.

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated : Fresh visit with no localStorage token

    Unauthenticated --> AuthModalOpen : User clicks Login or Signup
    AuthModalOpen --> Unauthenticated : User closes modal

    AuthModalOpen --> ProfileSetup : Successful auth, hasProfile = false
    AuthModalOpen --> AuthenticatedLearner : Successful auth, learner with complete profile
    AuthModalOpen --> TrainerSetup : Successful auth, trainer without trainer profile
    AuthModalOpen --> AuthenticatedTrainer : Successful auth, trainer with complete profile

    ProfileSetup --> AuthenticatedLearner : Profile setup wizard completed
    ProfileSetup --> AuthenticatedTrainer : Profile setup completed (trainer role)

    TrainerSetup --> AuthenticatedTrainer : Trainer bio/certs form completed

    AuthenticatedLearner --> Unauthenticated : User clicks Logout
    AuthenticatedTrainer --> Unauthenticated : User clicks Logout

    AuthenticatedLearner --> AuthenticatedTrainer : User toggles persona to Trainer
    AuthenticatedTrainer --> AuthenticatedLearner : User toggles persona to Learner
```

**Explanation:**
- The dual-persona toggle (`AuthenticatedLearner` ↔ `AuthenticatedTrainer`) is a frontend-only state change. The user's actual role in the database does not change — only the `activePersona` flag in `localStorage` changes, which causes the `Profile` page to re-render with a different UI.
- `TrainerSetup` can only be reached after auth. A fresh visitor can never reach this state without logging in first.

---

## State Diagram 3: ChatBox Lifecycle

This shows all the states the `ChatBox` component goes through from mounting to teardown.

```mermaid
stateDiagram-v2
    [*] --> Mounting : Component renders with chatId prop

    Mounting --> LoadingHistory : useEffect fires, MessageService.getHistory() called
    LoadingHistory --> HistoryLoaded : HTTP 200 response, setMessages(data)
    LoadingHistory --> EmptyState : HTTP 200 but empty array
    LoadingHistory --> ErrorState : HTTP request fails

    HistoryLoaded --> SocketConnected : getSocket() called, socket.on registered
    EmptyState --> SocketConnected : getSocket() called, socket.on registered

    SocketConnected --> WaitingForMessages : Listening for "receive_message" events

    WaitingForMessages --> MessageReceived : Socket emits "receive_message"
    MessageReceived --> WaitingForMessages : setMessages updates, UI re-renders

    WaitingForMessages --> MessageSent : User types and presses Send
    MessageSent --> WaitingForMessages : socket.emit("send_message") fires, input clears

    SocketConnected --> Unmounted : User closes ChatBox modal
    Unmounted --> [*] : useEffect cleanup fires socket.off("receive_message")
```

**Explanation:**
- The most critical transition is `Unmounted → [*]`. The `useEffect` cleanup function calls `socket.off("receive_message")` which unsubscribes the event handler. Without this, the handler would persist in memory even after the component is destroyed, causing a memory leak where new messages continue firing a handler that tries to `setState` on a dead component.
- `HistoryLoaded` and `EmptyState` both transition to `SocketConnected` — the socket connection is opened regardless of whether there is message history or not.
