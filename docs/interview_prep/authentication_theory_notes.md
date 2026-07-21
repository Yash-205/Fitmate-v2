# Theory & Implementation Notes: Authentication & Authorization

This document covers the theoretical principles of authentication, authorization, access control, and security design, mapping each concept directly to the actual implementations in the Fitmate codebase using detailed flowcharts and diagrams.

---

## 1. Authentication (AuthN) vs. Authorization (AuthZ)

*   **Authentication (AuthN):** Verifies **who** a user is. Common mechanisms: passwords, federated logins (OAuth2/Google).
*   **Authorization (AuthZ):** Verifies **what** a user is allowed to do. Common mechanisms: Role-Based Access Control (RBAC).

### Authentication (AuthN) Workflow
```mermaid
flowchart TD
    Credentials["Credentials (Email/Password or Google Token)"] --> Verify["Verify Credentials in Database or via Google"]
    Verify -- Valid --> Token["Issue Access Token (JWT) to Client"]
    Verify -- Invalid --> Error["Return 400/401 Error"]
```

### Authorization (AuthZ) Workflow
```mermaid
flowchart TD
    Request["Incoming Request with JWT Header"] --> Extract["Middleware Extracts User ID & Role"]
    Extract --> RuleEngine{"Check Permissions (e.g., isRole('trainer'))"}
    RuleEngine -- Allowed --> Exec["Execute Endpoint Controller (using req.userId)"]
    RuleEngine -- Denied --> Err["Return 403 Forbidden / 401 Unauthorized"]
```

---

## 2. Authentication Types & Flows

### A. Local Signup Flow
Local signup creates a new user, hashes the password using `bcrypt` (salting and hashing), and saves the user record defaulting to a `"learner"` role.

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Browser)
    participant Front as Frontend (AuthModal)
    participant Api as Backend (authController.ts)
    participant DB as MongoDB (User Collection)

    User->>Front: Enters Name, Email, Password
    Front->>Api: POST /api/auth/signup {name, email, password}
    Api->>DB: User.findOne({ email })
    DB-->>Api: Returns null (User does not exist)
    Api->>Api: Hash password using bcrypt (Salt Rounds: 10)
    Api->>DB: Create User {email, name, passwordHash, provider: "local", role: "learner"}
    DB-->>Api: User document created
    Api->>Api: Sign JWT (with userId)
    Api-->>Front: 201 Created {token, name, role, hasProfile: false, ...}
    Front->>Front: Save JWT in LocalStorage & update AuthState
```

---

### B. Local Login Flow
Local login validates the credentials against the hashed password and queries for onboarding profiles to send flags to the frontend.

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Browser)
    participant Front as Frontend (AuthModal)
    participant Api as Backend (authController.ts)
    participant DB as MongoDB

    User->>Front: Enters Email & Password
    Front->>Api: POST /api/auth/login {email, password}
    Api->>DB: User.findOne({ email })
    DB-->>Api: Returns user document (with passwordHash & provider)
    Api->>Api: Check provider is "local"
    Api->>Api: bcrypt.compare(password, passwordHash)
    Note over Api: If password matches:
    Api->>DB: Find Profile & Trainer records by userId
    DB-->>Api: Returns presence checks (profile, trainerProfile)
    Api->>Api: Sign JWT (with userId)
    Api-->>Front: 200 OK {token, name, role, hasProfile, hasTrainerProfile}
    Front->>Front: Save JWT in LocalStorage & update UI State
```

---

### C. Google OAuth 2.0 Authentication Flow
Federated login allows authentication through Google. The backend verifies the Google ID token and returns a local JWT.

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Browser)
    participant Front as Frontend (Google SDK)
    participant Google as Google Auth Servers
    participant Api as Backend (authController.ts)
    participant DB as MongoDB

    User->>Front: Clicks "Continue with Google"
    Front->>Google: Authenticate user & request credentials
    Google-->>Front: Returns ID Token (JWT)
    Front->>Api: POST /api/auth/google {credential}
    Api->>Google: client.verifyIdToken({idToken, audience})
    Google-->>Api: Returns verified payload (email, name, sub/googleId)
    Api->>DB: User.findOne({ email })
    alt User does not exist in DB
        Api->>DB: Create User {email, name, googleId, provider: "google", role: "learner"}
    end
    Api->>DB: Find Profile & Trainer records by userId
    DB-->>Api: Returns onboarding statuses
    Api->>Api: Sign local JWT (with userId)
    Api-->>Front: 200 OK {token, name, role, hasProfile, hasTrainerProfile}
    Front->>Front: Save JWT in LocalStorage & update UI State
```

---

## 3. Stateless JWT Authorization Lifecycle
Fitmate uses a stateless token approach where the token signature verifies authentication without querying the database every time.

```mermaid
flowchart TD
    A[Incoming Protected Request] --> B{authMiddleware: Has Bearer Token?}
    B -- No --> C[Return 401 Unauthorized]
    B -- Yes --> D[Extract Bearer Token]
    D --> E{jwt.verify: Valid Signature & Not Expired?}
    E -- No/Expired --> F[Return 401 Unauthorized]
    E -- Yes --> G[Set req.userId = decoded.userId]
    G --> H{Route requires specific role?}
    H -- No --> I[Call next - Route Controller checks req.userId]
    H -- Yes --> J{isRole Middleware: Query DB & check user.role?}
    J -- No --> K[Return 403 Forbidden]
    J -- Yes --> L[Call next - Execute Route Controller]
```

---

## 4. Access Control Models & Security Mitigation

### A. Horizontal Privilege Escalation Prevention
Horizontal privilege escalation occurs when User A attempts to access or modify User B's resources. Fitmate prevents this by deriving identity exclusively from the JWT context rather than body parameters.

```mermaid
sequenceDiagram
    autonumber
    actor Attacker as Attacker (User A)
    participant Api as Backend Route (/api/profile)
    participant DB as MongoDB (Profile Collection)

    Note over Attacker, Api: Attacker tries to modify User B's profile
    Attacker->>Api: POST /api/profile { "userId": "user_B_id", "goal": "Hacked!" } (Header: Bearer User_A_JWT)
    Note over Api: authMiddleware validates User_A_JWT
    Api->>Api: Sets req.userId = "user_A_id"
    Note over Api: profileController.ts executes
    Api->>DB: Profile.findOneAndUpdate({ userId: req.userId }, ...)
    Note over Api, DB: Scoped query looks up User A's profile, ignoring body.userId
    DB-->>Api: Profile updated (User A's profile updated)
    Api-->>Attacker: 200 OK (User A's own profile updated, User B remains untouched)
```

---

### B. Vertical Privilege Escalation Prevention
Vertical privilege escalation occurs when a user with low privileges (e.g. a `"learner"`) attempts to access trainer-only administrative APIs.

```mermaid
sequenceDiagram
    autonumber
    actor Learner as Learner (User A)
    participant Api as Backend Route (/api/trainer/clients)
    participant Midd as isRole(["trainer"]) Middleware
    participant DB as MongoDB (User Collection)

    Learner->>Api: GET /api/trainer/clients (Header: Bearer Learner_JWT)
    Note over Api: authMiddleware sets req.userId = "learner_id"
    Api->>Midd: Run role validation check
    Midd->>DB: User.findById("learner_id")
    DB-->>Midd: User record found (role: "learner")
    Note over Midd: Checks if "learner" matches allowed roles ["trainer"]
    Midd-->>Learner: 403 Forbidden (Access Denied)
```

---

## 5. Trainer Promotion Flow
Users register as learners first. Transitioning to a trainer happens when they onboarding via the trainer profile endpoint, which updates their roles.

```mermaid
sequenceDiagram
    autonumber
    actor User as Learner (Browser)
    participant Api as Backend (/api/trainer/profile)
    participant TrainerDB as MongoDB (Trainer Collection)
    participant UserDB as MongoDB (User Collection)

    User->>Api: POST /api/trainer/profile {specialization, experience, ...} (Header: Bearer JWT)
    Note over Api: Auth Middleware validates and sets req.userId
    Api->>TrainerDB: Trainer.findOneAndUpdate({ userId: req.userId }, body, { upsert: true })
    TrainerDB-->>Api: Profile created/updated
    Api->>UserDB: User.findByIdAndUpdate(req.userId, { role: "trainer" })
    UserDB-->>Api: Role updated to "trainer"
    Api-->>User: 200 OK (Profile updated, role promoted)
```
