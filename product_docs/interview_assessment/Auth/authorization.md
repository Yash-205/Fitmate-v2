# Authorization (AuthZ) in FitMate

> **"What are you allowed to do?"**
> This document covers exactly how FitMate enforces permissions after a user has been authenticated — the RBAC system, middleware chain, route protection, and real trade-offs.

---

## Table of Contents
1. [What is Authorization?](#1-what-is-authorization)
2. [System Overview — Authorization Only](#2-system-overview--authorization-only)
3. [The Two Middleware Functions](#3-the-two-middleware-functions)
   - [authMiddleware (JWT Verify)](#31-authmiddleware-jwt-verify)
   - [isRole() (RBAC Check)](#32-isrole-rbac-check)
4. [Role-Based Access Control (RBAC)](#4-role-based-access-control-rbac)
   - [The 3 Roles](#41-the-3-roles)
   - [Role Transition: Learner → Trainer](#42-role-transition-learner--trainer)
5. [Route Protection Map](#5-route-protection-map)
6. [Full Protected Request Sequence](#6-full-protected-request-sequence)
7. [Challenges & Trade-offs](#7-challenges--trade-offs)

---

## 1. What is Authorization?

Authorization answers the question: **"What are you allowed to do?"**
It happens **after** authentication — once we know *who* a user is, we then decide *what* they can access.

In FitMate, authorization is enforced through two Express middleware functions that are chained together on protected routes:
1. **`authMiddleware`** — verifies the JWT token and extracts the `userId`
2. **`isRole()`** — checks the user's role in MongoDB against the allowed roles for that route

---

## 2. System Overview — Authorization Only

```mermaid
graph TD
    subgraph CLIENT["Frontend (React + Vite)"]
        UI["Authenticated User\n(has JWT in localStorage)"]
    end

    subgraph SERVER["Backend (Express + TypeScript)"]
        AM["authMiddleware\n1. Extract Bearer token\n2. jwt.verify(token, JWT_SECRET)\n3. Attach req.userId\n4. next()"]
        RM["isRole(['trainer'])\n1. User.findById(req.userId)\n2. Check user.role in allowed roles\n3. next() or 403"]
        CTRL["Route Controller\ne.g. getClients()"]
    end

    subgraph DB["MongoDB"]
        UM["User Model\n{ role: 'learner' | 'trainer' | 'admin' }"]
    end

    UI -->|"GET /api/trainer/clients\nAuthorization: Bearer token"| AM
    AM -->|"jwt.verify passes"| RM
    AM -->|"Invalid token"| E1["401 Unauthorized"]
    RM -->|"User.findById"| UM
    UM -->|"role = 'trainer'"| RM
    RM -->|"Role allowed"| CTRL
    RM -->|"Role not allowed"| E2["403 Forbidden"]
    CTRL -->|"200 Response"| UI
```

---

## 3. The Two Middleware Functions

### 3.1 authMiddleware (JWT Verify)

> File: `backend/src/middleware/authMiddleware.ts`

```mermaid
flowchart TD
    A["Incoming Request\nAuthorization: Bearer eyJhbGc..."]
    B{"Authorization header\npresent and starts\nwith 'Bearer'?"}
    C["Extract token string\nafter 'Bearer '"]
    D["jwt.verify(token, JWT_SECRET)"]
    E{"Valid signature\nand not expired?"}
    F["Attach decoded.userId\nto req.userId"]
    G["next() → proceed to\nnext middleware or controller"]
    ERR1["401\n'No token provided'"]
    ERR2["401\n'Invalid token'"]

    A --> B
    B -->|"No"| ERR1
    B -->|"Yes"| C
    C --> D
    D --> E
    E -->|"No (tampered or expired)"| ERR2
    E -->|"Yes"| F
    F --> G
```

**Diagram Explanation:**

| Step | Action | Technical Detail | Interview Talking Point |
| :--- | :--- | :--- | :--- |
| **1** | Extract Header | Check `req.headers.authorization`. | Expects standard `Bearer <token>` format. |
| **2** | Verify Token | `jwt.verify(token, process.env.JWT_SECRET)`. | Re-hashes the header+payload and compares signatures. If it fails, throws error. |
| **3** | Attach State | `req.userId = decoded.userId`. | Modifies the Express request object so downstream controllers know *who* made the request. |
| **4** | Proceed | `next()`. | Passes control to the next middleware (usually `isRole`). |

### 3.2 isRole() (RBAC Check)

> File: `backend/src/middleware/authMiddleware.ts` — `isRole()` function

```mermaid
flowchart TD
    A["isRole called with allowed roles\ne.g. isRole(['trainer'])"]
    B["User.findById(req.userId)\nHit MongoDB"]
    C{"User found?"}
    D{"user.role in\nallowed roles array?"}
    E["next() → Controller runs"]
    ERR1["404 'User not found'"]
    ERR2["403 'Access denied: Unauthorized role'"]

    A --> B
    B --> C
    C -->|"No"| ERR1
    C -->|"Yes"| D
    D -->|"No"| ERR2
    D -->|"Yes"| E
```

**Diagram Explanation:**

| Step | Action | Technical Detail | Interview Talking Point |
| :--- | :--- | :--- | :--- |
| **1** | Receive Context | Executes after `authMiddleware` finishes. | Relies on `req.userId` being populated. |
| **2** | Fetch User | `User.findById(req.userId)`. | Hits the DB. This guarantees we have the absolute latest role for the user. |
| **3** | Check Permission | `roles.includes(user.role)`. | Compares the user's DB role against the allowed roles passed to the middleware (e.g. `['trainer']`). |
| **4** | Gatekeep | If not in array, return `403 Forbidden`. Else, `next()`. | 403 means "I know who you are (AuthN passed), but you can't do this (AuthZ failed)." |

### The Chain Together

This is exactly how they are wired up in `trainerRoutes.ts`:

```mermaid
graph LR
    REQ["Request:\nGET /api/trainer/clients\nBearer token"]
    M1["authMiddleware\nVerify JWT\nAttach userId"]
    M2["isRole(['trainer'])\nFetch user role from DB\nCheck permission"]
    CTRL["getClients()\nFetch all clients\nReturn JSON"]

    REQ --> M1
    M1 -->|"401"| E1["Unauthorized"]
    M1 --> M2
    M2 -->|"403"| E2["Forbidden"]
    M2 --> CTRL
    CTRL --> RES["200 OK\n{ clients: [...] }"]
```

---

## 4. Role-Based Access Control (RBAC)

### 4.1 The 3 Roles

```mermaid
graph TD
    subgraph ROLES["User Roles in FitMate\n(user.role field in MongoDB)"]
        L["👤 learner\nDefault role on signup\n\nCan: Browse trainers,\nCreate profile, Chat with trainer,\nView AI workouts"]
        T["🏋️ trainer\nPromoted from learner\n\nCan: Everything learner can +\nView client list, Manage trainer profile"]
        A["👑 admin\nDefined in User model enum\nNot yet wired to routes\n(Future use)"]
    end

    L -->|"Calls POST /api/trainer/profile\n(becomes a trainer)"| T
```

### 4.2 Role Transition: Learner → Trainer

Every user — including future trainers — signs up identically with just `name, email, password` and starts as `"learner"`. After authenticating, a user who wants to be a trainer submits their trainer profile. This upgrades their role live in MongoDB — no re-login required.

```mermaid
sequenceDiagram
    actor User as Learner User
    participant Frontend
    participant Server
    participant MongoDB

    Note over User: Has JWT. role in DB = "learner"

    User->>Frontend: Fills out trainer profile form
    Frontend->>Server: POST /api/trainer/profile\n+ Bearer token
    Server->>Server: authMiddleware → userId extracted
    Server->>Server: isRole(["learner", "trainer"]) → passes ✅
    Note over Server: Route allows both roles so learners\ncan call this to become trainers

    Server->>MongoDB: Trainer.findOneAndUpdate(upsert)
    Server->>MongoDB: User.findByIdAndUpdate(userId, { role: "trainer" })

    MongoDB-->>Server: Role updated ✅
    Server-->>Frontend: 200 { trainer, message }

    Note over User: Same JWT — no re-login needed

    User->>Frontend: Navigates to Trainer Dashboard
    Frontend->>Server: GET /api/trainer/clients + Bearer token
    Server->>Server: authMiddleware → userId extracted
    Server->>MongoDB: isRole(["trainer"]) → User.findById
    MongoDB-->>Server: role = "trainer" ✅
    Server-->>Frontend: 200 { clients: [...] }
```

**Diagram Explanation:**

| Step | Action | Technical Detail | Interview Talking Point |
| :--- | :--- | :--- | :--- |
| **1** | Signed up as learner | Every user — trainer or not — signs up identically via `AuthModal.tsx` | No separate trainer signup. The modal only collects `name, email, password`. |
| **2** | Upsert Profile | `Trainer.findOneAndUpdate(..., {upsert: true})`. | Creates the professional profile document. |
| **3** | Update Role | `User.findByIdAndUpdate(userId, { role: "trainer" })`. | Live database update of the user's core identity. |
| **4** | Next Request | User navigates to Trainer Dashboard. | The JWT hasn't changed! |
| **5** | Verification | `isRole(['trainer'])` runs. | Because it fetches from the DB fresh, it sees `"trainer"` and allows access immediately. |

---

## 5. Route Protection Map

```mermaid
graph TD
    subgraph PUBLIC["🟢 Public — No Auth Required"]
        R1["POST /api/auth/signup"]
        R2["POST /api/auth/login"]
        R3["POST /api/auth/google"]
        R4["GET /api/trainer/discovery"]
    end

    subgraph AUTH["🟡 Authenticated — Any Logged-In User"]
        R5["GET /api/auth/me"]
        R6["GET /api/profile"]
        R7["POST /api/profile"]
        R8["POST /api/profile/select-trainer/:id"]
        R9["GET /api/messages/:userId1/:userId2"]
        R10["GET /api/chat/sessions"]
        R11["POST /api/chat"]
    end

    subgraph TRAINER["🔴 Trainer Role Only"]
        R12["GET /api/trainer/clients\nisRole(['trainer'])"]
        R13["GET /api/trainer/profile\nisRole(['trainer'])"]
    end

    subgraph MIXED["🟠 learner + trainer Allowed"]
        R14["POST /api/trainer/profile\nisRole(['learner','trainer'])\n\nLearners use this to BECOME trainers"]
    end
```

---

## 6. Full Protected Request Sequence

End-to-end: from browser open to authorized data being returned.

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant ReactApp
    participant localStorage
    participant authMiddleware
    participant isRole
    participant MongoDB
    participant Controller

    User->>ReactApp: Opens Trainer Dashboard

    ReactApp->>localStorage: getItem('token'), getItem('userRole')
    localStorage-->>ReactApp: token = "eyJ...", role = "trainer"

    Note over ReactApp: Frontend checks role to decide\nwhich page to show (client-side guard only)

    ReactApp->>authMiddleware: GET /api/trainer/clients\nAuthorization: Bearer eyJ...

    authMiddleware->>authMiddleware: jwt.verify(token, JWT_SECRET)
    Note over authMiddleware: Decodes: { userId: "64abc...", iat, exp }
    authMiddleware->>isRole: next() — req.userId attached

    isRole->>MongoDB: User.findById("64abc...")
    MongoDB-->>isRole: { role: "trainer" }

    isRole->>Controller: next() — role verified ✅

    Controller->>MongoDB: Trainer.findOne({ userId })\nProfile.find({ trainerId }).populate("userId")
    MongoDB-->>Controller: Client profiles with user emails

    Controller-->>ReactApp: 200 { clients: [...] }
    ReactApp-->>User: Renders client cards on dashboard
```

---

## 7. Challenges & Trade-offs

### Challenge 1: Role is Fetched from DB on Every Request

**Why it works this way:**
The JWT payload only contains `userId`. The `role` is NOT baked into the token. Every time `isRole()` runs, it fires a `User.findById()` query.

```mermaid
graph TD
    A["Why not put role in JWT?"]
    B["If role was in token:\nrole = 'learner' baked in at login"]
    C["User becomes trainer\nMongoDB updated"]
    D["JWT still says 'learner'\nUser must re-login to get new JWT"]
    E["Bad UX — seamless\nrole upgrade breaks"]

    F["Current approach:\nrole NOT in JWT"]
    G["isRole() always calls\nUser.findById() at request time"]
    H["Role change is INSTANT\nNo re-login needed ✅"]
    I["Cost: One extra DB\nquery per protected route"]

    A --> B --> C --> D --> E
    A --> F --> G --> H
    G --> I
```

| Option | Pro | Con |
|---|---|---|
| **Current: Role fetched from DB each time** | Instant role changes, always accurate | Extra DB query per request |
| **Role embedded in JWT** | No DB query for role | Role changes require re-login or token refresh flow |

> **Decision:** DB query is correct. The cost is one MongoDB `findById` which is indexed and fast. The alternative creates stale permission state which is a security and UX problem.

---

### Challenge 2: Client-Side Role Guard is Not Enough

The frontend checks `localStorage.getItem('userRole')` to decide which page to render. But this is **not** real security — it is just UX.

```mermaid
flowchart TD
    A["Attacker opens DevTools\nlocalStorage.setItem('userRole', 'trainer')"]
    B["Frontend now renders Trainer Dashboard UI ⚠️"]
    C["Attacker calls GET /api/trainer/clients\nwith their learner JWT"]

    D["authMiddleware: JWT valid ✅"]
    E["isRole(['trainer']):\nUser.findById → role = 'learner'"]
    F["403 Forbidden ❌\nReal data never exposed"]

    A --> B --> C --> D --> E --> F
```

> **Conclusion:** The client-side role check is only for **UX routing**. The server-side `isRole()` middleware is the **real security gate**. Both must exist — frontend for experience, backend for protection.

---

### Challenge 3: The `admin` Role Has No Routes Yet

The User model defines three roles: `learner`, `trainer`, `admin`. The `admin` role exists in the enum but no routes use `isRole(['admin'])` yet.

```mermaid
graph LR
    UM["User Model\nrole: enum\n['learner', 'trainer', 'admin']"]
    L["learner ✅\nAll profile/chat/workout routes"]
    T["trainer ✅\n/api/trainer/clients\n/api/trainer/profile"]
    A["admin ⚠️\nDefined but no routes\nprotected with it yet"]

    UM --> L
    UM --> T
    UM --> A
```

> **Current stance:** Admin functionality is planned but not implemented. When added, `isRole(['admin'])` can be dropped onto any route without changing the middleware system — it is already designed for this.
