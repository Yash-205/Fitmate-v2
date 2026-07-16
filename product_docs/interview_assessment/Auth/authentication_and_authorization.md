# Interview Assessment: Authentication & Authorization in FitMate

> This document is based on **exactly what was implemented** in the FitMate codebase.
> Every diagram, challenge, and trade-off refers to real code and real decisions made during development.

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [The Two Auth Flows Implemented](#2-the-two-auth-flows-implemented)
   - [Local Auth (Email + Password)](#21-local-auth-email--password)
   - [Google OAuth (Social Login)](#22-google-oauth-social-login)
3. [The Trainer Registration Flow](#3-the-trainer-registration-flow)
4. [Login &amp; Role-Based Redirect](#4-login--role-based-redirect)
5. [JWT Token Lifecycle](#5-jwt-token-lifecycle)
6. [Authorization: Role-Based Access Control (RBAC)](#6-authorization-role-based-access-control-rbac)
7. [The Provider Field: A Critical Design Decision](#7-the-provider-field-a-critical-design-decision)
8. [Middleware Chain](#8-middleware-chain)
9. [Challenges &amp; Trade-offs](#9-challenges--trade-offs)
10. [Full Request Lifecycle Sequence Diagram](#10-full-request-lifecycle-sequence-diagram)

---

## 1. System Architecture Overview

This is how Authentication and Authorization fit into the full FitMate system:

```mermaid
graph TD
    subgraph CLIENT["Frontend (React + Vite)"]
        UI["User Interface\n(AuthModal.tsx)\nOnly asks: Name, Email, Password"]
        LS["localStorage\n(token, role, isLoggedIn)"]
        UI -->|saves after success| LS
    end

    subgraph SERVER["Backend (Express + TypeScript)"]
        AR["Auth Routes\n/api/auth/signup\n/api/auth/login\n/api/auth/google"]
        AM["authMiddleware\n(JWT Verify)"]
        RM["isRole()\n(RBAC Check)"]
        AC["Auth Controller"]
        GV["Google Token Verifier\n(OAuth2Client)"]
        JG["generateToken()\n(JWT Sign, 7d)"]
        TR["Trainer Routes\n/api/trainer/profile"]
    end

    subgraph DB["Database (MongoDB)"]
        UM["User Model\n{ email, password, provider,\nrole: learner|trainer|admin, googleId }"]
        PM["Profile Model\n(Learner profile data)"]
        TM["Trainer Model\n(Trainer profile data)"]
    end

    subgraph GOOGLE["Google Auth"]
        GP["Google Public Keys\n(Verify ID Token)"]
    end

    UI -->|POST /api/auth/signup or /login| AR
    UI -->|POST /api/auth/google| AR
    AR --> AC
    AC -->|verifyIdToken| GV
    GV -->|checks signature| GP
    AC -->|findOne / create| UM
    AC -->|findOne — onboarding check| PM
    AC -->|findOne — onboarding check| TM
    AC -->|userId| JG
    JG -->|JWT + role + hasProfile| UI

    LS -->|Authorization: Bearer token| AM
    AM -->|decoded.userId| RM
    RM -->|User.findById — fresh role check| UM

    UI -->|"POST /api/trainer/profile\n(learner upgrades to trainer)"| TR
    TR --> AM
    AM --> RM
    RM -->|upsert Trainer doc| TM
    TM -->|User.findByIdAndUpdate role→trainer| UM
```

**Diagram Explanation:**

| Component                      | Description                          | What it actually does in FitMate                                                       |
| :----------------------------- | :----------------------------------- | :------------------------------------------------------------------------------------- |
| **AuthModal (Frontend)** | Single modal for both login + signup | Only collects Name, Email, Password —**never asks for role**                    |
| **Auth Routes**          | Entry points for identity            | `/signup`, `/login`, `/google` — all public routes                              |
| **Auth Controller**      | Core login/signup logic              | Hashes passwords, verifies Google tokens, generates JWTs                               |
| **generateToken()**      | JWT factory                          | Signs`{ userId }` with 7-day expiry — role is NOT in the token                      |
| **Trainer Routes**       | Separate from auth routes            | `POST /api/trainer/profile` is where a learner becomes a trainer                     |
| **authMiddleware**       | JWT verification layer               | Reads`Authorization: Bearer <token>`, attaches `req.userId`                        |
| **isRole()**             | RBAC enforcement                     | Queries DB fresh every time — picks up role changes instantly                         |
| **MongoDB models**       | Storage layer                        | `User` for identity+role, `Profile` for learner data, `Trainer` for trainer data |

---

## 2. The Two Auth Flows Implemented

### 2.1 Local Auth (Email + Password)

#### Signup Flow

> **Key fact:** The frontend signup form (`AuthModal.tsx`) asks for **Name, Email, Password only**. There is **no role selection**. Every new user starts as `"learner"` — regardless of whether they intend to be a trainer.

```mermaid
sequenceDiagram
    actor User
    participant AuthModal as "AuthModal.tsx\n(Frontend)"
    participant AuthService as "AuthService\n(API Client)"
    participant AuthController as "authController.ts\n(Backend)"
    participant MongoDB

    User->>AuthModal: Fills signup form\n{ name, email, password }
    Note over AuthModal: No role field shown.\nRole is NOT collected here.

    AuthModal->>AuthService: AuthService.signup({ name, email, password })
    AuthService->>AuthController: POST /api/auth/signup\n{ name, email, password }

    AuthController->>MongoDB: User.findOne({ email })
    MongoDB-->>AuthController: null (user doesn't exist)

    AuthController->>AuthController: bcrypt.hash(password, 10)
    Note over AuthController: Salt rounds = 10\nMakes brute-force computationally expensive

    AuthController->>MongoDB: User.create({\n  email, name,\n  password: hashedPassword,\n  provider: "local",\n  role: "learner"\n})
    Note over MongoDB: Role is ALWAYS set to 'learner'\non signup — no exceptions
    MongoDB-->>AuthController: Saved User document

    AuthController->>AuthController: generateToken(user._id)
    Note over AuthController: jwt.sign({ userId }, JWT_SECRET,\n{ expiresIn: "7d" })\nRole is NOT in the token payload

    AuthController-->>AuthService: 201 { token, role: "learner", name }
    AuthService-->>AuthModal: data (token, role, name)
    AuthModal->>AuthModal: onSuccess(data.hasProfile)
    Note over AuthModal: Parent component handles redirect\n→ Learner Onboarding (since hasProfile=false)
```

**Diagram Explanation:**

| Step        | Action                        | Technical Detail                                     | Interview Talking Point                                                                      |
| :---------- | :---------------------------- | :--------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| **1** | User fills signup form        | Collects`name, email, password` — no role field   | "I keep the signup friction low — everyone starts as a learner"                             |
| **2** | `User.findOne()`            | Checks for duplicate email before creation           | Prevents constraint violations and confusing UX                                              |
| **3** | `bcrypt.hash(password, 10)` | Salt rounds = 10                                     | Never store plaintext. 10 rounds is the industry-standard balance between speed and security |
| **4** | `User.create(...)`          | Saves with`provider: "local"`, `role: "learner"` | `provider` field is critical — prevents future Google-auth account takeover               |
| **5** | `generateToken(userId)`     | 7-day JWT containing only`userId`                  | Role is deliberately excluded — fetched fresh from DB on every request                      |
| **6** | Parent handles redirect       | `onSuccess(hasProfile)` bubble-up pattern          | The modal delegates navigation to the parent — keeps the component reusable                 |

---

#### Login Flow

```mermaid
sequenceDiagram
    actor User
    participant AuthModal as "AuthModal.tsx\n(Frontend)"
    participant AuthService as "AuthService\n(API Client)"
    participant AuthController as "authController.ts\n(Backend)"
    participant MongoDB

    User->>AuthModal: Enters email + password
    AuthModal->>AuthService: AuthService.login({ email, password })
    AuthService->>AuthController: POST /api/auth/login

    AuthController->>MongoDB: User.findOne({ email })

    alt User not found
        MongoDB-->>AuthController: null
        AuthController-->>AuthService: 400 "Invalid credentials: User not found"
        AuthService-->>AuthModal: throws error
        AuthModal->>AuthModal: setError("...") — shown in modal UI
    else User found
        MongoDB-->>AuthController: User document

        alt user.provider !== "local"
            AuthController-->>AuthService: 400 "Invalid credentials: Wrong auth provider"
            Note over AuthController: Google-registered accounts\ncannot login via password!\nThis prevents account takeover.
        else provider is "local"
            AuthController->>AuthController: bcrypt.compare(inputPassword, user.password)

            alt Passwords don't match
                AuthController-->>AuthService: 400 "Invalid credentials: Password incorrect"
                AuthService-->>AuthModal: throws error
            else Passwords match ✅
                AuthController->>MongoDB: Profile.findOne({ userId })
                AuthController->>MongoDB: Trainer.findOne({ userId })
                AuthController->>AuthController: generateToken(user._id)
                AuthController-->>AuthService: 200 { token, role, name, hasProfile, hasTrainerProfile }

                Note over AuthService: role = "learner" or "trainer"\nbased on what's stored in DB

                AuthService-->>AuthModal: data (token, role, hasProfile...)
                AuthModal->>AuthModal: onSuccess(data.hasProfile)

                Note over AuthModal: Parent reads role from localStorage\nand redirects accordingly:\n• role = "trainer" → Trainer Dashboard\n• role = "learner" → Learner Dashboard / Onboarding
            end
        end
    end
```

**Diagram Explanation:**

| Step        | Action                      | Technical Detail                                  | Interview Talking Point                                                                                            |
| :---------- | :-------------------------- | :------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------- |
| **1** | `User.findOne({ email })` | Looks up by email first                           | If null → generic error (never confirm whether email exists to prevent enumeration)                               |
| **2** | Provider check              | `user.provider !== "local"` → reject           | **Security critical:** Prevents brute-forcing a password on a Google-registered account that has no password |
| **3** | `bcrypt.compare()`        | Compares plaintext input against stored hash      | Cryptographically safe — timing-safe comparison built into bcrypt                                                 |
| **4** | Onboarding check            | `Profile.findOne()` + `Trainer.findOne()`     | Backend tells the frontend*exactly* what state the user is in                                                    |
| **5** | Role-based redirect         | `role` returned in response, frontend checks it | If`role === "trainer"` → Trainer Dashboard. If `"learner"` → learner flow                                    |

---

### 2.2 Google OAuth (Social Login)

```mermaid
sequenceDiagram
    actor User
    participant AuthModal as "AuthModal.tsx\n(Frontend)"
    participant GoogleSDK as "@react-oauth/google\nSDK"
    participant Google as "Google OAuth\nServers"
    participant AuthController as "authController.ts\n(Backend)"
    participant MongoDB

    User->>AuthModal: Clicks "Continue with Google"
    AuthModal->>GoogleSDK: Renders GoogleLogin component
    GoogleSDK->>Google: Opens OAuth consent screen
    Google-->>GoogleSDK: Returns Google ID Token (credential)
    Note over GoogleSDK,Google: This is an ID Token (OpenID Connect)\nNOT an OAuth2 Access Token

    GoogleSDK->>AuthModal: onSuccess({ credential: "eyJ..." })
    AuthModal->>AuthModal: handleGoogleSuccess(credentialResponse)
    AuthModal->>AuthController: POST /api/auth/google { credential }

    AuthController->>Google: client.verifyIdToken({ idToken, audience: CLIENT_ID })
    Note over AuthController,Google: Validates signature against\nGoogle's rotating public keys\naudiece check = token was meant for THIS app
    Google-->>AuthController: Verified payload { email, sub: googleId, name }

    AuthController->>MongoDB: User.findOne({ email })

    alt New user (first-time Google login)
        AuthController->>MongoDB: User.create({\n  email, name, googleId,\n  provider: "google",\n  role: "learner"\n})
        Note over MongoDB: Google users also start as\n"learner" — same as local signup
    else Existing user (returning)
        Note over AuthController: Just log them in\nNo new document created
    end

    AuthController->>AuthController: generateToken(user._id)
    Note over AuthController: We issue OUR OWN JWT\nWe never store or forward Google's token
    AuthController-->>AuthModal: 200 { token, role, hasProfile, hasTrainerProfile }
    AuthModal->>AuthModal: onSuccess(data.hasProfile)
```

**Diagram Explanation:**

| Step        | Action                      | Technical Detail                                       | Interview Talking Point                                                                       |
| :---------- | :-------------------------- | :----------------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| **1** | `@react-oauth/google` SDK | Renders Google's button natively                       | We use Google's official SDK — don't build the OAuth redirect manually                       |
| **2** | Google returns ID Token     | `credentialResponse.credential` is a JWT from Google | This is OpenID Connect (identity), not OAuth 2.0 (authorization)                              |
| **3** | `verifyIdToken()`         | Validates the JWT signature using Google's public keys | We never trust the token blindly — we verify it server-side                                  |
| **4** | `User.create(...)`        | Sets`provider: "google"`, `role: "learner"`        | Google users also default to learner — same flow as local signup                             |
| **5** | Issue our own JWT           | `generateToken(user._id)`                            | We issue our own token from here. Google's token is discarded — we control expiry and claims |

---

## 3. The Trainer Registration Flow

> This is NOT part of auth. This is a **post-auth** flow. A user must already be logged in as a `learner` to become a trainer.

```mermaid
sequenceDiagram
    actor User as "User\n(logged in as learner)"
    participant Frontend
    participant authMiddleware
    participant isRole
    participant TrainerController
    participant MongoDB

    Note over User: Has a valid JWT\nrole in DB = "learner"

    User->>Frontend: Fills out Trainer Profile form\n(specialization, experience, etc.)
    Frontend->>authMiddleware: POST /api/trainer/profile\nAuthorization: Bearer <token>

    authMiddleware->>authMiddleware: jwt.verify(token, JWT_SECRET)
    Note over authMiddleware: Decodes { userId }\nAttaches req.userId = userId

    authMiddleware->>isRole: next()
    isRole->>MongoDB: User.findById(req.userId)
    MongoDB-->>isRole: { role: "learner" }
    Note over isRole: Route allows isRole(["learner", "trainer"])\nSo learners CAN call this route\n— that's how they upgrade!
    isRole->>TrainerController: next() ✅

    TrainerController->>MongoDB: Trainer.findOneAndUpdate(\n  { userId },\n  { specialization, ... },\n  { upsert: true }\n)
    MongoDB-->>TrainerController: Trainer document saved

    TrainerController->>MongoDB: User.findByIdAndUpdate(\n  userId,\n  { role: "trainer" }\n)
    Note over MongoDB: Role is updated LIVE in DB\nNo re-login needed
    MongoDB-->>TrainerController: User with role: "trainer"

    TrainerController-->>Frontend: 200 { trainer, message: "Profile saved" }

    Note over User: Same JWT — token unchanged\nBut next request to isRole(["trainer"])\nwill fetch role="trainer" from DB ✅
```

**Diagram Explanation:**

| Step        | Action                                          | Technical Detail                                     | Interview Talking Point                                                                      |
| :---------- | :---------------------------------------------- | :--------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| **1** | User already logged in                          | Has a JWT for`userId`, role is `"learner"` in DB | A trainer starts their life as a learner — same signup form                                 |
| **2** | `authMiddleware` runs                         | Verifies JWT, attaches`req.userId`                 | Standard JWT verification — no changes to the flow                                          |
| **3** | `isRole(["learner", "trainer"])`              | Checks role from DB —`"learner"` passes!          | The route is intentionally open to learners so they CAN promote themselves                   |
| **4** | `Trainer.findOneAndUpdate(upsert)`            | Creates or updates the Trainer document              | Upsert = create if not found, update if found — idempotent operation                        |
| **5** | `User.findByIdAndUpdate({ role: "trainer" })` | Upgrades the role live in MongoDB                    | The JWT doesn't change — but`isRole()` fetches from DB, so next request works immediately |

---

## 4. Login & Role-Based Redirect

This shows exactly what happens after a successful login — how the frontend uses the `role` returned by the backend to decide where to send the user.

```mermaid
flowchart TD
    A["POST /api/auth/login\nor POST /api/auth/google\n✅ Credentials valid"]

    B["Backend returns:\n{ token, role, name,\nhasProfile, hasTrainerProfile }"]

    C["Frontend:\nAuthService stores to localStorage:\n• token\n• userRole = role\n• isLoggedIn = true"]

    D{"What is role?"}

    E["role = 'trainer'"]
    F["role = 'learner'"]

    G{"hasTrainerProfile?"}
    H{"hasProfile?"}

    I["→ Trainer Dashboard\n/trainer/dashboard"]
    J["→ Trainer Onboarding\n/trainer/onboarding"]
    K["→ Learner Dashboard\n/dashboard"]
    L["→ Learner Onboarding\n/onboarding"]

    A --> B --> C --> D
    D --> E --> G
    D --> F --> H
    G -->|"Yes"| I
    G -->|"No"| J
    H -->|"Yes"| K
    H -->|"No"| L
```

**Diagram Explanation:**

| Step        | Action                          | Technical Detail                                                | Interview Talking Point                                                                 |
| :---------- | :------------------------------ | :-------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| **1** | Backend returns`role`         | `role` comes from the MongoDB User document — always current | "Role is not in the JWT, it's fetched from DB at login time and returned to the client" |
| **2** | Frontend stores to localStorage | `token`, `userRole`, `isLoggedIn` saved                   | This is client-side UX state. The real authority is always the server's`isRole()`     |
| **3** | Role-based redirect             | `role === "trainer"` → Trainer Dashboard                     | A trainer who has already registered goes directly to their dashboard on next login     |
| **4** | Profile check                   | `hasProfile` / `hasTrainerProfile` flags                    | These tell us if onboarding is needed — prevents showing a blank dashboard             |

> **Interview Tip:** Emphasize that the client-side role check is **only for UX routing**. The actual API protection is done server-side via `isRole()`. An attacker can edit `localStorage` all they want — the server will still return 403 if they don't have the right role in the DB.

---

## 5. JWT Token Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Created: Signup / Login / Google Auth succeeds

    Created --> Stored: Frontend saves to localStorage\n(token, userRole, isLoggedIn)

    Stored --> Attached: User makes any API request\n"Authorization: Bearer token"

    Attached --> Verified: authMiddleware:\njwt.verify(token, JWT_SECRET) succeeds

    Attached --> Rejected: Signature invalid or tampered
    Rejected --> [*]: 401 Unauthorized

    Verified --> Active: next() called\nreq.userId attached

    Active --> Expired: 7 days have passed\n(expiresIn: "7d")
    Expired --> [*]: User must log in again

    Active --> Cleared: User clicks Logout\nFrontend removes from localStorage
    Cleared --> [*]: Session ends on client\n(token still valid server-side!)
```

**What's inside the JWT payload in FitMate:**

```mermaid
graph LR
    subgraph JWT["JWT Token (3 parts, dot-separated)"]
        H["HEADER\n{ alg: 'HS256', typ: 'JWT' }"]
        P["PAYLOAD\n{ userId: 'ObjectId', iat: ..., exp: ... }\n\nNOTE: role is NOT here"]
        S["SIGNATURE\nHMAC-SHA256(header + payload, JWT_SECRET)"]
    end
    H --> P --> S
```

**Diagram Explanation:**

| State / Component            | Description                                                                    | Interview Talking Point                                                                             |
| :--------------------------- | :----------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| **Created → Stored**  | Token generated by server, saved to`localStorage`                            | Discuss HttpOnly cookies as a more secure alternative (XSS protection)                              |
| **Header**             | `alg: HS256`                                                                 | Symmetric algorithm — same secret for sign and verify                                              |
| **Payload**            | Only contains`userId`, `iat`, `exp`                                      | **Role is intentionally excluded** — fetched fresh from DB on every request via `isRole()` |
| **Signature**          | `HMAC-SHA256(header+payload, JWT_SECRET)`                                    | Any tampering breaks the signature — token becomes invalid                                         |
| **Cleared ≠ Revoked** | Logout removes from browser, but server-side token is still valid until`exp` | This is the core trade-off of stateless JWTs — see Challenge 1                                     |

> **Key decision:** The payload only stores `userId`. The `role` is NOT stored in the token — it is fetched fresh from MongoDB on every protected request via `isRole()`. This is a deliberate trade-off (see Section 9).

---

## 6. Authorization: Role-Based Access Control (RBAC)

### The 3 Roles in FitMate

```mermaid
graph TD
    subgraph ROLES["FitMate Roles (stored in User.role)"]
        L["👤 learner\n(Default — every new signup starts here)\n\nCan: Browse trainers, create profile,\nchat, view AI workouts"]
        T["🏋️ trainer\n(Promoted via POST /api/trainer/profile)\n\nCan: Everything learner can +\nview client list, manage trainer profile"]
        A["👑 admin\n(Defined in model enum)\nNot yet wired to any routes\n(Future use)"]
    end

    L -->|"POST /api/trainer/profile\nupserts Trainer doc +\nUser.findByIdAndUpdate({ role: 'trainer' })"| T
```

**Diagram Explanation:**

| Role        | Who has it                              | How to get it                                      | Routes it unlocks                                                                      |
| :---------- | :-------------------------------------- | :------------------------------------------------- | :------------------------------------------------------------------------------------- |
| `learner` | Every new user on signup                | Default — assigned automatically                  | Profile routes, chat, AI workouts, browse trainers                                     |
| `trainer` | Users who complete trainer registration | `POST /api/trainer/profile` upgrades the DB role | `GET /api/trainer/clients`, `GET /api/trainer/profile` + everything learner can do |
| `admin`   | Nobody yet                              | Not implemented                                    | Nothing yet — placeholder in the enum                                                 |

### How a protected route works end-to-end

```mermaid
sequenceDiagram
    participant Client
    participant authMiddleware
    participant isRole
    participant MongoDB
    participant Controller

    Client->>authMiddleware: GET /api/trainer/clients\n+ "Authorization: Bearer <token>"

    authMiddleware->>authMiddleware: jwt.verify(token, JWT_SECRET)
    alt Token invalid / missing
        authMiddleware-->>Client: 401 "No token provided" / "Invalid token"
    else Token valid
        authMiddleware->>authMiddleware: Attach decoded.userId to req.userId
        authMiddleware->>isRole: next() → isRole(["trainer"])

        isRole->>MongoDB: User.findById(req.userId)
        Note over isRole,MongoDB: This hits the DB fresh\nGuarantees the CURRENT role is used\n(handles role upgrades without re-login)
        alt User not found
            isRole-->>Client: 404 "User not found"
        else Role not in allowed list
            isRole-->>Client: 403 "Access denied: Unauthorized role"
        else Role matches ✅
            isRole->>Controller: next() → getClients()
            Controller-->>Client: 200 { clients: [...] }
        end
    end
```

**Diagram Explanation:**

| Step        | Action                  | Technical Detail                                                       | Interview Talking Point                                         |
| :---------- | :---------------------- | :--------------------------------------------------------------------- | :-------------------------------------------------------------- |
| **1** | `authMiddleware` runs | Extracts`Bearer` token, calls `jwt.verify()`                       | If the signature is wrong or expired → 401. Nothing else runs. |
| **2** | `req.userId` attached | Decoded`userId` is attached to the request object                    | This is how the controller knows who is making the request      |
| **3** | `isRole(["trainer"])` | DB lookup:`User.findById(req.userId)`                                | Fresh from DB every time — no stale role issue                 |
| **4** | 403 vs 401              | 401 = "Who are you?", 403 = "I know who you are but you can't do this" | This distinction is important for interviews                    |

### Route Protection Map

```mermaid
graph LR
    subgraph PUBLIC["🟢 Public (No auth required)"]
        R1["POST /api/auth/signup"]
        R2["POST /api/auth/login"]
        R3["POST /api/auth/google"]
        R4["GET /api/trainer/discovery"]
    end

    subgraph AUTHED["🟡 Auth Required (Any logged-in user)"]
        R5["GET /api/auth/me"]
        R6["GET /api/profile"]
        R7["POST /api/profile/select-trainer/:id"]
        R8["GET /api/messages/:id1/:id2"]
    end

    subgraph TRAINER["🔴 Trainer Only"]
        R9["GET /api/trainer/clients\nisRole(['trainer'])"]
        R10["GET /api/trainer/profile\nisRole(['trainer'])"]
    end

    subgraph MIXED["🟠 learner + trainer Allowed"]
        R11["POST /api/trainer/profile\nisRole(['learner', 'trainer'])\n\nLearners use this to BECOME trainers"]
    end
```

---

## 7. The Provider Field: A Critical Design Decision

The `provider` field on the User model (`"local" | "google"`) is what prevents a major security hole called **Account Takeover**.

```mermaid
flowchart TD
    A["Attacker knows victim's email\nvictim@gmail.com"]
    B["Victim registered via Google OAuth\n(Has NO password in DB)"]

    A -->|"Tries: POST /api/auth/login\n{ email, password: 'guess' }"| C["Login Controller"]

    C -->|"User.findOne('victim@gmail.com')"| D["Found! But user.provider = 'google'"]

    D -->|"provider !== 'local'"| E["❌ Returns 400\n'Wrong auth provider'\n\nNever reaches bcrypt.compare()"]

    E --> F["✅ Account is SAFE\nAttacker cannot brute-force\na password that doesn't exist"]
    B --> D
```

**Diagram Explanation:**

| Step                               | Action                                                      | Why it matters                                                                       |
| :--------------------------------- | :---------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| **Attacker attempts login**  | Sends`POST /api/auth/login` with email + guessed password | Classic brute-force / credential stuffing attack                                     |
| **User found in DB**         | `User.findOne()` returns the user document                | The check doesn't stop here — finding the user is not the risk                      |
| **Provider check blocks it** | `user.provider !== "local"` → early return 400           | `bcrypt.compare()` is **never called** — there's nothing to compare against |
| **Account stays safe**       | No password was ever set for this Google user               | The`provider` field is the gatekeeper                                              |

---

## 8. Middleware Chain

This is exactly how the two middleware functions are chained in `trainerRoutes.ts`:

```mermaid
graph LR
    REQ["Incoming Request\nGET /api/trainer/clients\nAuthorization: Bearer xyz"]

    M1["authMiddleware\n1. Extract token from header\n2. jwt.verify(token, SECRET)\n3. Attach req.userId\n4. next()"]

    M2["isRole(['trainer'])\n1. User.findById(req.userId)\n2. Check user.role in ['trainer']\n3. next() or 403"]

    CTRL["getClients()\nFetch clients from DB\nReturn JSON"]

    REQ --> M1 --> M2 --> CTRL

    M1 -->|"Invalid token"| E1["401 Unauthorized"]
    M2 -->|"Wrong role"| E2["403 Forbidden"]
```

**Diagram Explanation:**

| Middleware         | Responsibility                           | Error returned                      | What it adds to request      |
| :----------------- | :--------------------------------------- | :---------------------------------- | :--------------------------- |
| `authMiddleware` | Verify JWT signature & expiry            | 401 if invalid/missing              | `req.userId`               |
| `isRole()`       | Verify user has correct role (DB lookup) | 403 if wrong role, 404 if user gone | Nothing — just gates access |
| Controller         | Business logic                           | Varies                              | Response data                |

> **The chain is serial** — if `authMiddleware` fails, `isRole()` never runs. If `isRole()` fails, the controller never runs.

---

## 9. Challenges & Trade-offs

### Challenge 1: Stateless JWT vs. Token Revocation

**The Problem:** JWTs in FitMate expire in **7 days**. If a user logs out, the frontend deletes the token from `localStorage` — but the JWT is still cryptographically valid for the remaining 7 days.

```mermaid
graph TD
    A["User logs out"] -->|"Frontend: localStorage.removeItem('token')"| B["Token gone from browser ✅"]
    B --> C["But the JWT is STILL VALID\nfor remaining days of 7d window"]
    C -->|"Attacker who copied\nthe token before logout"| D["Can still call API ❌"]
```

| Option                                                | Pro                     | Con                                                     |
| ----------------------------------------------------- | ----------------------- | ------------------------------------------------------- |
| **Current: Delete from localStorage on logout** | Zero backend complexity | Stolen tokens remain valid until expiry                 |
| **Token Blacklist (Redis)**                     | Instant revocation      | Adds stateful infrastructure, defeats stateless benefit |
| **Short expiry (15min) + Refresh Tokens**       | Small attack window     | Requires refresh token endpoint + rotation logic        |

> **Current stance:** Accepted for MVP. The next step would be implementing **HTTP-only cookies** + **short-lived access tokens with refresh tokens**.

---

### Challenge 2: Role Stored in DB, Not JWT

**The Problem:** When a learner becomes a trainer (by calling `POST /api/trainer/profile`), their role updates in MongoDB. But their old JWT still has no role info in it.

**Why it's fine:** The `isRole()` middleware **always re-fetches** the user from the DB on every protected request — so it always sees the current role.

```mermaid
sequenceDiagram
    participant User as "User (was learner, now trainer)"
    participant API
    participant MongoDB

    Note over User: Has JWT from when they first signed up\nrole in DB was "learner"

    User->>API: POST /api/trainer/profile
    API->>MongoDB: Trainer.findOneAndUpdate(upsert)
    API->>MongoDB: User.findByIdAndUpdate({ role: "trainer" })
    MongoDB-->>API: Role updated ✅

    Note over User: Same JWT — token never changes

    User->>API: GET /api/trainer/clients
    API->>MongoDB: isRole() → User.findById() → role = "trainer" ✅
    API-->>User: 200 OK — access granted immediately\nNo re-login needed ✅
```

| Option                                             | Pro                                            | Con                                                              |
| -------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------- |
| **Current: Role in DB, fetched per request** | Role changes are instant — no re-login needed | One extra DB query on every protected route                      |
| **Role in JWT payload**                      | No DB query for role check                     | Role change requires user to re-login or implement token refresh |

> **Current stance:** DB lookup is the right call. The extra query is fast (indexed `_id` lookup). The alternative (stale role in JWT) is a real UX and security problem — a newly promoted trainer would have to log out and log back in.

---

### Challenge 3: No Role Selection at Signup (Current vs. Ideal)

**The Reality:** `AuthModal.tsx` only collects `name, email, password`. The backend defaults every new user to `"learner"`. A trainer must go through a second step to register their trainer profile.

```mermaid
flowchart TD
    A["Frontend: AuthModal.tsx\nSends { name, email, password }\nNo role field"]
    B["Backend: authController.ts\nUser.create({\n  role: role || 'learner'\n})"]
    C["User saved as 'learner' ✅\nEveryone starts the same"]

    A --> B --> C

    D["Ideal Implementation"]
    E["Signup modal shows:\n'I am a Trainer' / 'I am a Learner'\n(tabs or checkbox)"]
    F["Pass { role: 'trainer' } to backend\nUser created with correct role immediately"]

    D -.-> E -.-> F
```

| Option                                           | Pro                                            | Con                                                         |
| ------------------------------------------------ | ---------------------------------------------- | ----------------------------------------------------------- |
| **Current: Default everyone to 'learner'** | Minimal signup friction, one form for everyone | Trainer needs a separate onboarding step to register        |
| **Ideal: Role selection at signup**        | User gets the right dashboard immediately      | Extra field adds friction; trainers are rarer than learners |

> **Current stance:** Acceptable for MVP. Trainers are a minority of users — keeping signup simple for learners (the majority) is the right product decision. Trainer registration is a deliberate second step.

---

### Challenge 4: Google Auth — Provider Mismatch

**The Problem:** What if a user registers with `email/password`, then later tries "Continue with Google" with the same email?

```mermaid
flowchart TD
    A["User: test@gmail.com\nRegistered with email+password\nprovider = 'local'"]
    B["Later, clicks 'Continue with Google'\nusing same email"]
    C["googleAuth controller:\nUser.findOne({ email: 'test@gmail.com' })"]
    D["Found! User exists in DB"]

    A --> B --> C --> D

    D -->|"Current code — just logs them in ⚠️"| E["Signs them in as local user\nNow they can login BOTH ways\nSame account"]

    D -->|"Ideal behavior"| F["Check provider mismatch\nReturn error: 'You registered with email+password.\nPlease use that to login.'"]
```

| Option                                                 | Pro                                      | Con                                   |
| ------------------------------------------------------ | ---------------------------------------- | ------------------------------------- |
| **Current: Auto-merge (login if email matches)** | User doesn't get locked out — smooth UX | Minor security risk on shared devices |
| **Block cross-provider logins**                  | Strict security                          | Frustrating UX                        |
| **Account linking flow**                         | Best UX + security                       | Complex to implement                  |

> **Current stance:** Auto-merge is accepted for MVP. Proper account linking would be the production solution.

---

## 10. Full Request Lifecycle Sequence Diagram

This ties everything together — from a fresh browser to an authorized API response for a **trainer** user:

```mermaid
sequenceDiagram
    actor User as "Trainer User\n(already registered via POST /api/trainer/profile)"
    participant ReactApp
    participant localStorage
    participant authMiddleware
    participant isRole
    participant MongoDB
    participant Controller

    User->>ReactApp: Opens FitMate, clicks "Login"
    ReactApp->>MongoDB: POST /api/auth/login { email, password }
    MongoDB-->>ReactApp: { token, role: "trainer", hasProfile: true, hasTrainerProfile: true }

    ReactApp->>localStorage: token = "eyJ..."\nuserRole = "trainer"\nisLoggedIn = true

    Note over User,localStorage: User is now authenticated ✅\nrole = "trainer" in localStorage (UX only)\nrole = "trainer" in MongoDB (real authority)

    ReactApp->>ReactApp: Reads userRole from localStorage\nuserRole === "trainer" → navigate to /trainer/dashboard

    User->>ReactApp: Navigates to Trainer Dashboard
    ReactApp->>authMiddleware: GET /api/trainer/clients\nAuthorization: Bearer eyJ...

    authMiddleware->>authMiddleware: jwt.verify(token, JWT_SECRET)
    Note over authMiddleware: Decodes: { userId: "64abc...", iat, exp }
    authMiddleware->>isRole: next() — req.userId attached

    isRole->>MongoDB: User.findById("64abc...")
    MongoDB-->>isRole: { role: "trainer" }
    Note over isRole: Fresh DB lookup — always current\nPicks up role changes without re-login

    isRole->>Controller: next() — role verified ✅

    Controller->>MongoDB: Trainer.findOne({ userId })\nProfile.find({ trainerId }).populate("userId")
    MongoDB-->>Controller: Client profiles with user details

    Controller-->>ReactApp: 200 { clients: [...] }
    ReactApp-->>User: Renders client cards on dashboard ✅
```

**Diagram Explanation:**

| Step        | Action                          | Technical Detail                                            | Interview Talking Point                                                                 |
| :---------- | :------------------------------ | :---------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| **1** | Login returns role              | `role: "trainer"` comes from the DB User document         | The JWT itself has no role — the role is returned at login time for UX convenience     |
| **2** | localStorage stores role        | Frontend saves`userRole = "trainer"`                      | This is**only for UX routing** — not a security gate                             |
| **3** | Client-side role check          | `userRole === "trainer"` → navigate to trainer dashboard | An attacker could change localStorage — the server-side check is what actually matters |
| **4** | `authMiddleware` verifies JWT | Extracts`userId` from the verified token                  | Only`userId` is in the JWT — role comes from DB                                      |
| **5** | `isRole()` fetches from DB    | `User.findById()` — gets current role                    | This is the**real security gate** — always accurate, even after role promotion   |
| **6** | Controller runs                 | Fetches actual data                                         | Only reached if both middleware layers pass                                             |
