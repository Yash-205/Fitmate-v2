# Authentication (AuthN) in FitMate

> **"Who are you?"**
> This document covers exactly how FitMate verifies user identity — the two flows implemented, how JWTs are generated, and the real challenges that came up.

---

## Table of Contents

1. [What is Authentication?](#1-what-is-authentication)
2. [System Overview — Auth Only](#2-system-overview--auth-only)
3. [Flow 1: Local Auth (Email + Password)](#3-flow-1-local-auth-email--password)
   - [Signup](#31-signup)
   - [Login &amp; Role-Based Redirect](#32-login--role-based-redirect)
4. [Flow 2: Google OAuth (Social Login)](#4-flow-2-google-oauth-social-login)
5. [The Trainer Registration Flow (Post-Auth)](#5-the-trainer-registration-flow-post-auth)
6. [JWT Token Lifecycle](#6-jwt-token-lifecycle)
7. [The Provider Field: Account Takeover Prevention](#7-the-provider-field-account-takeover-prevention)
8. [Frontend Authentication Flow (AuthModal)](#8-frontend-authentication-flow-authmodal)
9. [Challenges &amp; Trade-offs](#9-challenges--trade-offs)

---

## 1. What is Authentication?

Authentication answers the question: **"Who are you?"**
It verifies that the person making a request is who they claim to be, before any permissions are checked.

In FitMate, a user is considered authenticated once they receive a **JWT token** — signed by the server using `JWT_SECRET`.

---

## 2. System Overview — Auth Only

This diagram shows only the authentication layer (login, signup, Google OAuth). Authorization is a separate concern.

```mermaid
graph TD
    subgraph CLIENT["Frontend (React + Vite)"]
        UI["User Interface\n(AuthModal.tsx)\nOnly asks: Name, Email, Password"]
        LS["localStorage\n(token, role, isLoggedIn)"]
    end

    subgraph SERVER["Backend (Express + TypeScript)"]
        AR["Auth Routes\n/api/auth/signup\n/api/auth/login\n/api/auth/google"]
        AC["Auth Controller\nauthController.ts"]
        GV["OAuth2Client\ngoogle-auth-library"]
        JG["generateToken(userId)\njwt.sign — expires 7d\n(role NOT in payload)"]
    end

    subgraph DB["MongoDB"]
        UM["User Model\n{ email, password?,\nprovider, role, googleId? }"]
        PM["Profile Model\n(learner profile)"]
        TM["Trainer Model\n(trainer profile)"]
    end

    subgraph GOOGLE["Google Infrastructure"]
        GP["Google Public Keys\n(Verify ID Token signature)"]
    end

    UI -->|"POST /signup { name, email, password }"| AR
    UI -->|"POST /login { email, password }"| AR
    UI -->|"POST /google { credential }"| AR
    AR --> AC
    AC -->|"verifyIdToken()"| GV
    GV <-->|"Checks signature"| GP
    AC -->|"findOne / create"| UM
    AC -->|"findOne (onboarding check)"| PM
    AC -->|"findOne (onboarding check)"| TM
    AC -->|"userId"| JG
    JG -->|"JWT + role + hasProfile"| UI
    UI -->|"saves token + role"| LS
```

**Diagram Explanation:**

| Component / Step                | Description                            | Technical Implementation in FitMate                                              | Why it matters for Interviews                                   |
| :------------------------------ | :------------------------------------- | :------------------------------------------------------------------------------- | :-------------------------------------------------------------- |
| **Frontend (AuthModal)**  | Single modal for login + signup        | Only collects Name, Email, Password —**never asks for role**              | Shows you understand low-friction UX and separation of concerns |
| **Auth Routes**           | Entry points for identity verification | Express router exposing`/signup`, `/login`, `/google`                      | Demonstrates RESTful API design knowledge                       |
| **Auth Controller**       | Core logic handler                     | Orchestrates DB calls, Google verification, JWT signing                          | Proves MVC pattern understanding                                |
| **generateToken()**       | JWT factory                            | Signs`{ userId }` only — role excluded deliberately                           | Role excluded = no stale permission problem                     |
| **MongoDB Models**        | Storage layer                          | `User` (identity+role), `Profile` (learner data), `Trainer` (trainer data) | Shows normalization and separation of concerns                  |
| **Google Infrastructure** | Third-party identity provider          | Google's OAuth servers for token verification                                    | Demonstrates OpenID Connect knowledge                           |

---

## 3. Flow 1: Local Auth (Email + Password)

### 3.1 Signup

> **Key fact:** The signup form (`AuthModal.tsx`) asks for **Name, Email, Password only**. There is **no role selection**. Every new user — whether they intend to be a trainer or learner — starts as `"learner"`. Trainer registration is a separate, post-auth step.

```mermaid
sequenceDiagram
    actor User
    participant AuthModal as "AuthModal.tsx"
    participant AuthController
    participant MongoDB

    User->>AuthModal: Fills signup form\n{ name, email, password }
    Note over AuthModal: NO role field.\nRole is never collected here.
    AuthModal->>AuthController: POST /api/auth/signup\n{ name, email, password }

    AuthController->>MongoDB: User.findOne({ email })
    MongoDB-->>AuthController: null (no existing user)

    AuthController->>AuthController: bcrypt.hash(password, 10)
    Note over AuthController: Salt rounds = 10\nMakes brute-force computationally expensive

    AuthController->>MongoDB: User.create({\n  email, name,\n  password: hashedPassword,\n  provider: "local",\n  role: "learner"\n})
    Note over MongoDB: Role is ALWAYS "learner" on signup\nTrainers upgrade via a separate route later
    MongoDB-->>AuthController: Saved User document

    AuthController->>AuthController: generateToken(user._id)
    Note over AuthController: jwt.sign({ userId }, JWT_SECRET,\n{ expiresIn: "7d" })\nRole is NOT in the JWT payload

    AuthController-->>AuthModal: 201 { token, role: "learner", name }
    AuthModal->>AuthModal: onSuccess(data.hasProfile)
    Note over AuthModal: Parent handles redirect\n→ Learner onboarding (hasProfile = false)
```

**Diagram Explanation:**

| Step        | Action                 | Technical Detail                         | Interview Talking Point                                                                      |
| :---------- | :--------------------- | :--------------------------------------- | :------------------------------------------------------------------------------------------- |
| **1** | User fills signup form | `{ name, email, password }` — no role | "I keep signup friction low — everyone starts as a learner. Trainers upgrade separately."   |
| **2** | Check existence        | `User.findOne({ email })`              | Prevents duplicate accounts                                                                  |
| **3** | Hash Password          | `bcrypt.hash(password, 10)`            | Never store plaintext. Salt rounds of 10 = industry-standard security/speed balance          |
| **4** | Save to DB             | `role: "learner"` always               | Even future trainers start here. The`provider: "local"` flag prevents Google-auth takeover |
| **5** | Generate JWT           | `jwt.sign({ userId })` — 7d expiry    | Stateless. Role NOT in token — fetched from DB per request                                  |
| **6** | Success callback       | `onSuccess(data.hasProfile)`           | Modal delegates routing to parent — keeps it reusable                                       |

### 3.2 Login & Role-Based Redirect

```mermaid
sequenceDiagram
    actor User
    participant AuthModal as "AuthModal.tsx"
    participant AuthController
    participant MongoDB

    User->>AuthModal: Enters email + password
    AuthModal->>AuthController: POST /api/auth/login

    AuthController->>MongoDB: User.findOne({ email })

    alt User not found in DB
        MongoDB-->>AuthController: null
        AuthController-->>AuthModal: 400 "User not found"
    else User found
        MongoDB-->>AuthController: User document

        alt user.provider !== "local"
            AuthController-->>AuthModal: 400 "Wrong auth provider"
            Note over AuthController: Google-registered users\ncannot login via password form!\nPrevents account takeover.
        else provider is "local"
            AuthController->>AuthController: bcrypt.compare(inputPassword, user.password)

            alt Passwords don't match
                AuthController-->>AuthModal: 400 "Password incorrect"
            else Passwords match ✅
                AuthController->>MongoDB: Profile.findOne({ userId })
                AuthController->>MongoDB: Trainer.findOne({ userId })
                AuthController->>AuthController: generateToken(user._id)
                AuthController-->>AuthModal: 200 { token, role, name, hasProfile, hasTrainerProfile }

                Note over AuthModal: role = "trainer" or "learner"\nbased on current DB value

                AuthModal->>AuthModal: onSuccess(data.hasProfile)
                Note over AuthModal: Parent reads role from localStorage\n• role = "trainer" → Trainer Dashboard\n• role = "learner" → Learner Dashboard / Onboarding
            end
        end
    end
```

**Diagram Explanation:**

| Step        | Action                      | Technical Detail                              | Interview Talking Point                                                                                        |
| :---------- | :-------------------------- | :-------------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| **1** | `User.findOne({ email })` | Lookup by email                               | Generic error message — never confirm whether email exists (prevents email enumeration)                       |
| **2** | Provider check              | `user.provider !== "local"` → reject       | **Security critical:** A Google-registered account has no password. This check prevents brute-forcing it |
| **3** | `bcrypt.compare()`        | Compares input against stored hash            | Cryptographically safe, timing-safe comparison                                                                 |
| **4** | Onboarding check            | `Profile.findOne()` + `Trainer.findOne()` | Backend tells frontend exactly what state the user is in                                                       |
| **5** | Role-based redirect         | `role` returned → frontend redirects       | If`role === "trainer"` → Trainer Dashboard. If `"learner"` → learner flow                                |

**Post-login redirect logic:**

```mermaid
flowchart TD
    A["Login ✅\nBackend returns { token, role, hasProfile, hasTrainerProfile }"]
    B["Frontend saves to localStorage:\ntoken, userRole = role, isLoggedIn = true"]
    C{"What is role?"}
    D["role = 'trainer'"]
    E["role = 'learner'"]
    F{"hasTrainerProfile?"}
    G{"hasProfile?"}
    I["→ Trainer Dashboard"]
    J["→ Trainer Onboarding"]
    K["→ Learner Dashboard"]
    L["→ Learner Onboarding"]

    A --> B --> C
    C --> D --> F
    C --> E --> G
    F -->|"Yes"| I
    F -->|"No"| J
    G -->|"Yes"| K
    G -->|"No"| L
```

---

## 4. Flow 2: Google OAuth (Social Login)

```mermaid
sequenceDiagram
    actor User
    participant AuthModal as "AuthModal.tsx"
    participant GoogleSDK as "@react-oauth/google"
    participant Google
    participant AuthController
    participant MongoDB

    User->>AuthModal: Clicks "Continue with Google"
    AuthModal->>GoogleSDK: Renders GoogleLogin component
    GoogleSDK->>Google: Opens OAuth consent screen
    Google-->>GoogleSDK: Returns Google ID Token (credential)
    Note over Google,GoogleSDK: This is an OpenID Connect ID Token\nNOT an OAuth2 Access Token

    GoogleSDK->>AuthModal: onSuccess({ credential })
    AuthModal->>AuthController: POST /api/auth/google { credential }

    AuthController->>Google: client.verifyIdToken({ idToken, audience: CLIENT_ID })
    Note over AuthController,Google: Validates the cryptographic signature\nusing Google's rotating public keys.\nThe 'audience' check ensures token\nwas meant for THIS app specifically.

    Google-->>AuthController: Verified payload { email, sub: googleId, name }

    AuthController->>MongoDB: User.findOne({ email })

    alt New user (first time)
        AuthController->>MongoDB: User.create({\n  email, name, googleId,\n  provider: "google",\n  role: "learner"\n})
        Note over MongoDB: Google users also start as "learner"\nSame default as local signup
    else Existing user
        Note over AuthController: No creation needed — just log them in
    end

    AuthController->>AuthController: generateToken(user._id)
    Note over AuthController: We NEVER store Google's token.\nWe issue our OWN JWT from this point.
    AuthController-->>AuthModal: 200 { token, role, hasProfile, hasTrainerProfile }
```

**Diagram Explanation:**

| Step        | Action             | Technical Detail                                | Interview Talking Point                                                     |
| :---------- | :----------------- | :---------------------------------------------- | :-------------------------------------------------------------------------- |
| **1** | Consent Screen     | `@react-oauth/google` SDK renders the button  | We use Google's official SDK — not building OAuth redirect manually        |
| **2** | Receive Credential | Google returns an ID Token (JWT)                | OpenID Connect (identity), not OAuth 2.0 (authorization)                    |
| **3** | Verify Token       | `client.verifyIdToken({ idToken, audience })` | We verify the signature server-side — never trust the client blindly       |
| **4** | Handle User in DB  | Find or create with`role: "learner"`          | Google users default to learner — identical to local signup                |
| **5** | Issue Custom JWT   | `generateToken(user._id)`                     | We discard Google's token. We issue our own — we control expiry and claims |

---

## 5. The Trainer Registration Flow (Post-Auth)

> This is **NOT** part of auth. A user must already be logged in as a `"learner"` to do this. This is how a learner becomes a trainer.

```mermaid
sequenceDiagram
    actor User as "User (logged in as learner)"
    participant Frontend
    participant authMiddleware
    participant isRole
    participant TrainerController
    participant MongoDB

    Note over User: Has valid JWT\nrole in DB = "learner"

    User->>Frontend: Fills out Trainer Profile form\n(specialization, experience, etc.)
    Frontend->>authMiddleware: POST /api/trainer/profile\nAuthorization: Bearer <token>

    authMiddleware->>authMiddleware: jwt.verify(token, JWT_SECRET)
    authMiddleware->>isRole: next() — req.userId attached

    isRole->>MongoDB: User.findById(req.userId)
    MongoDB-->>isRole: { role: "learner" }
    Note over isRole: Route uses isRole(["learner", "trainer"])\nSo learners CAN call this!\nThat's how they upgrade.
    isRole->>TrainerController: next() ✅

    TrainerController->>MongoDB: Trainer.findOneAndUpdate(\n  { userId },\n  { specialization, ... },\n  { upsert: true }\n)
    MongoDB-->>TrainerController: Trainer document saved

    TrainerController->>MongoDB: User.findByIdAndUpdate(\n  userId, { role: "trainer" }\n)
    Note over MongoDB: Role updated LIVE in DB\nNo re-login required
    MongoDB-->>TrainerController: Updated User

    TrainerController-->>Frontend: 200 { trainer, message: "Profile saved" }

    Note over User: Same JWT — token is unchanged\nNext request: isRole() fetches\nrole="trainer" from DB ✅
```

**Diagram Explanation:**

| Step        | Action                                          | Technical Detail                           | Interview Talking Point                                                     |
| :---------- | :---------------------------------------------- | :----------------------------------------- | :-------------------------------------------------------------------------- |
| **1** | Already logged in as learner                    | Has a valid JWT,`role = "learner"` in DB | Trainers sign up identically to learners — no separate signup form         |
| **2** | `isRole(["learner", "trainer"])`              | Learner role passes!                       | Deliberately designed so learners can call this route to promote themselves |
| **3** | `Trainer.findOneAndUpdate(upsert)`            | Creates the trainer profile document       | Upsert = idempotent — calling it again just updates, doesn't duplicate     |
| **4** | `User.findByIdAndUpdate({ role: "trainer" })` | Updates role in DB                         | JWT doesn't change, but`isRole()` fetches fresh from DB on next request   |
| **5** | Seamless access                                 | Next request to trainer routes just works  | This is why role is NOT in the JWT — so role changes are instant           |

---

## 6. JWT Token Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Created : Signup / Login / Google Auth succeeds

    Created --> Stored : Frontend saves to localStorage\n(token, userRole, isLoggedIn)

    Stored --> Attached : User makes any API request\n"Authorization: Bearer token"

    Attached --> Valid : authMiddleware:\njwt.verify(token, JWT_SECRET) succeeds

    Attached --> Rejected : Signature invalid or tampered
    Rejected --> [*] : 401 Unauthorized

    Valid --> Expired : 7 days have passed\n(expiresIn: "7d")
    Expired --> [*] : User must log in again

    Valid --> Cleared : User clicks "Logout"\nFrontend deletes from localStorage
    Cleared --> [*] : Session ends on client\n(token still valid server-side!)
```

**What the JWT actually contains in FitMate:**

```mermaid
graph LR
    subgraph TOKEN["JWT (3 parts, dot-separated)"]
        direction LR
        H["HEADER\nalg: HS256\ntyp: JWT"]
        P["PAYLOAD\nuserId: ObjectId\niat: issued-at\nexp: issued-at + 7d\n\nNOTE: role NOT here"]
        S["SIGNATURE\nHMAC-SHA256(\n  base64(header) + base64(payload),\n  JWT_SECRET\n)"]
    end
    H --> P --> S
```

**Diagram Explanation (Lifecycle & Structure):**

| State / Component            | Description                                                        | Why it matters for Interviews                                                |
| :--------------------------- | :----------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| **Created → Stored**  | Token generated by server, stored in`localStorage`               | Discuss HttpOnly cookies as XSS-safe alternative                             |
| **Header**             | Specifies algorithm (`HS256`)                                    | Symmetric — same secret for sign and verify                                 |
| **Payload**            | Contains`userId`, `iat`, `exp` — **role is excluded** | Role excluded = no stale permission problem when user is promoted to trainer |
| **Signature**          | `HMAC-SHA256(header + payload, SECRET)`                          | Cryptographic guarantee token hasn't been tampered with                      |
| **Cleared ≠ Revoked** | Logout removes from browser, token still server-valid              | Core trade-off of stateless JWTs — see Challenge 1                          |

> **Key decision:** Only `userId` is in the payload. Role is NOT stored in the token — it is fetched fresh from MongoDB on every protected request via `isRole()`. This makes role upgrades (learner → trainer) work instantly without re-login.

---

## 7. The Provider Field: Account Takeover Prevention

The `provider` field (`"local" | "google"`) on the User model is a simple but critical security guard.

```mermaid
flowchart TD
    A["Attacker knows victim's email\nexample@gmail.com"]
    B["Victim registered via Google\nprovider = 'google'\npassword = undefined in DB"]

    A -->|"POST /api/auth/login\n{ email, password: 'guess123' }"| C["Login Controller"]

    C --> D["User.findOne — User found ✅"]
    D --> E{"Check: user.provider === 'local'?"}
    E -->|"No — provider is 'google'"| F["❌ Return 400\n'Wrong auth provider'\n\nbcrypt.compare() NEVER runs"]

    B --> E

    F --> G["✅ Account Safe\nNo way to brute-force\na password that was never set"]
```

**Diagram Explanation:**

| Step                              | Action                                              | Why it matters                                                                 |
| :-------------------------------- | :-------------------------------------------------- | :----------------------------------------------------------------------------- |
| **Attacker attempts login** | Sends`POST /api/auth/login` with guessed password | Classic credential stuffing / brute-force attack                               |
| **User found in DB**        | `User.findOne()` returns the user                 | Finding the user is not the risk                                               |
| **Provider check**          | `user.provider !== "local"` → early 400          | `bcrypt.compare()` is never called — there's no password to compare against |
| **Account stays safe**      | No password was ever set for this Google user       | The`provider` field is the only thing protecting the account                 |

---

## 8. Frontend Authentication Flow (AuthModal)

### 8.1 Current Implementation (AuthModal.tsx)

```mermaid
flowchart TD
    A["AuthModal Opened\nInitial View: 'login' or 'signup'"]
    B{"User selects view"}

    C["Signup View\nShows: Name, Email, Password\n(No role field)"]
    D["Login View\nShows: Email, Password"]

    A --> B
    B -->|"Toggle"| C
    B -->|"Toggle"| D

    E["User submits form"]
    C --> E
    D --> E

    F{"Is view 'signup'?"}
    E --> F

    G["AuthService.signup({ name, email, password })"]
    H["AuthService.login({ email, password })"]

    F -->|"Yes"| G
    F -->|"No"| H

    I{"API Request successful?"}
    G --> I
    H --> I

    J["Show error message in modal"]
    K["Call onSuccess(data.hasProfile)"]

    I -->|"No"| J
    I -->|"Yes"| K

    L["Parent Component:\nReads role from localStorage\n• 'trainer' → Trainer Dashboard\n• 'learner' → Learner Dashboard / Onboarding"]
    K --> L

    M["Google Login Clicked"]
    N["AuthService.googleAuth(credential)"]
    M --> N
    N --> I
```

**Diagram Explanation:**

| Step        | Action           | Technical Detail                                 | Interview Talking Point                                                             |
| :---------- | :--------------- | :----------------------------------------------- | :---------------------------------------------------------------------------------- |
| **1** | Initialize Modal | State`view` set to `'login'` or `'signup'` | Centralized auth component — no duplicated forms across the app                    |
| **2** | Signup form      | Only`name, email, password` — no role field   | Low friction. Every user starts as learner regardless of intent                     |
| **3** | Handle Submit    | Unified handler branches by`view` state        | Single`handleSubmit` for both flows reduces code duplication                      |
| **4** | Handle Google    | Uses`@react-oauth/google` SDK                  | Social login path merges back into the same success callback                        |
| **5** | Error Handling   | Renders`error` string in modal UI              | Provides clear feedback without wiping the form                                     |
| **6** | Success Callback | `onSuccess(data.hasProfile)`                   | Modal**delegates routing to parent** — makes it reusable anywhere in the app |

### 8.2 Ideal Frontend Code vs Current

| Feature                    | Current Implementation (FitMate)                  | Ideal Implementation (Best Practice)                        | Why current is acceptable                                                 |
| :------------------------- | :------------------------------------------------ | :---------------------------------------------------------- | :------------------------------------------------------------------------ |
| **Role Selection**   | No role field. Everyone defaults to`"learner"`. | Signup modal shows "I'm a Trainer" / "I'm a Learner" toggle | Reduces signup friction. Trainer registration is a deliberate second step |
| **Form Validation**  | HTML5`required` + `type="email"`              | Schema validation with`zod` or `yup`                    | HTML5 validation is sufficient for an MVP with 3-field forms              |
| **State Management** | Local`useState` for form fields                 | `react-hook-form` for performance + complex validation    | The form is simple enough that a full library adds unnecessary overhead   |

> **Interview Tip:** The current `AuthModal` is designed for **reusability** (parent receives `onSuccess` callback, handles routing itself) and **low friction** (no role selection at signup — trainers register in a second step after authenticating).

---

## 9. Challenges & Trade-offs

### Challenge 1: Logout Doesn't Truly Invalidate the JWT

```mermaid
graph TD
    A["User clicks Logout"]
    B["Frontend:\nlocalStorage.removeItem('token')"]
    C["Token deleted from browser ✅"]
    D["JWT is still cryptographically\nVALID on the server side\nfor remaining days of 7d window"]
    E["Attacker who copied the token\nbefore logout can still call API ❌"]

    A --> B --> C
    C --> D --> E
```

| Fix Option                                     | Pro                        | Con                                               |
| ---------------------------------------------- | -------------------------- | ------------------------------------------------- |
| **Current: Delete from localStorage**    | Zero infrastructure needed | Token remains valid server-side                   |
| **Short expiry (15min) + Refresh Token** | Small attack window        | Needs refresh endpoint + rotation logic           |
| **Token Blacklist (Redis)**              | Instant revocation         | Adds stateful infrastructure, defeats scalability |

> **Current stance (MVP):** Acceptable. Next step would be short-lived tokens + HTTP-only cookie storage to protect against XSS.

---

### Challenge 2: Role Stored in DB, Not JWT — Extra DB Query

**Why it's needed:** When a learner becomes a trainer (via `POST /api/trainer/profile`), their role updates in MongoDB. If role were in the JWT, they'd need to re-login to get a new token.

```mermaid
graph TD
    A["Why not put role in JWT?"]
    B["If role was in token:\nrole = 'learner' baked in at login"]
    C["User becomes trainer\nMongoDB updated"]
    D["JWT still says 'learner'\nUser must re-login to get new JWT"]
    E["Bad UX — seamless\nrole upgrade breaks ❌"]

    F["Current approach:\nrole NOT in JWT"]
    G["isRole() always calls\nUser.findById() at request time"]
    H["Role change is INSTANT\nNo re-login needed ✅"]
    I["Cost: One extra DB\nquery per protected route"]

    A --> B --> C --> D --> E
    A --> F --> G --> H
    G --> I
```

| Option                                            | Pro                                   | Con                                                 |
| ------------------------------------------------- | ------------------------------------- | --------------------------------------------------- |
| **Current: Role fetched from DB each time** | Instant role changes, always accurate | Extra DB query per request                          |
| **Role embedded in JWT**                    | No DB query for role                  | Role changes require re-login or token refresh flow |

> **Decision:** DB query is correct. The cost is one MongoDB `findById` which is indexed and fast. The alternative creates stale permission state — a promoted trainer would have to log out and back in.

---

### Challenge 3: No Role Selection at Signup

Currently, `AuthModal.tsx` only collects `name, email, password`. All users start as `"learner"`.

```mermaid
flowchart TD
    A["Frontend: AuthModal.tsx\nSends { name, email, password }\nNo role field"]
    B["Backend: authController.ts\nUser.create({\n  role: role || 'learner'\n})"]
    C["User saved as 'learner' ✅\nEveryone starts the same"]

    A --> B --> C

    D["Ideal Implementation"]
    E["Add role toggle to signup modal\n'I am a Trainer' / 'I am a Learner'"]
    F["Pass { role: 'trainer' }\nUser created with correct role immediately"]

    D -.-> E -.-> F
```

**Diagram Explanation:**

| Step / Option | Action       | Technical Detail                                          | Interview Talking Point                                                                                   |
| :------------ | :----------- | :-------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| **1**   | Current Flow | Frontend omits`role`, backend defaults to `"learner"` | Frictionless signup — one form for everyone                                                              |
| **2**   | Ideal Flow   | Frontend passes`{ role: "trainer" }` to backend         | User gets correct dashboard immediately, no second step                                                   |
| **3**   | Trade-off    | Accept current flow as MVP                                | Trainers are minority of users — keeping signup simple for learners (majority) is the right product call |

| Option                                                 | Pro                                   | Con                                                               |
| ------------------------------------------------------ | ------------------------------------- | ----------------------------------------------------------------- |
| **Current: Default to 'learner', upgrade later** | Minimal signup friction, simpler form | Trainer needs a separate onboarding step to register              |
| **Ideal: Role selection at signup**              | User gets right dashboard immediately | Extra field; trainers are rarer — adds friction for the majority |

> **Current stance (MVP):** Acceptable. Users start as learners and upgrade via `POST /api/trainer/profile`.

---

### Challenge 4: Google Auth — Provider Collision

What happens when the same email has been used for both local and Google signup?

```mermaid
flowchart TD
    A["User registers with\nemail@gmail.com + password\nprovider = 'local'"]
    B["Same user later clicks\n'Continue with Google'\nfor same email"]

    A --> B
    B --> C["googleAuth controller:\nUser.findOne email@gmail.com"]
    C --> D["Existing local user FOUND ✅"]
    D --> E{"Current code decision"}

    E -->|"Auto-logs them in\n(no provider check)"| F["⚠️ Accounts effectively merged\nUser can now login BOTH ways"]

    E -->|"Ideal: Check provider mismatch"| G["Block + show message:\n'You registered with email/password.\nUse that to login instead.'"]
```

| Option                                | Pro                 | Con                                   |
| ------------------------------------- | ------------------- | ------------------------------------- |
| **Current: Auto-merge**         | Smooth UX           | Minor security risk on shared devices |
| **Block cross-provider logins** | Strict security     | Frustrating for the real user         |
| **Account linking flow**        | Best of both worlds | Complex implementation                |

> **Current stance (MVP):** Auto-merge accepted. Production would require an explicit account-linking confirmation step.
