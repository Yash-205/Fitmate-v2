# Horizontal Privilege Escalation (IDOR) & Prevention in Fitmate

This document details what Horizontal Privilege Escalation is, how it typically manifests in web applications as Insecure Direct Object Reference (IDOR), and the exact architectural patterns Fitmate uses to prevent it.

---

## 1. What is Horizontal Privilege Escalation?

**Horizontal Privilege Escalation** occurs when a user accesses data or performs actions on behalf of another user who possesses the **same level of permissions**. 

This is distinct from Vertical Privilege Escalation (where a normal user gains admin rights). In a horizontal scenario, User A (a learner) accesses or modifies the profile, workout plan, or chat history of User B (another learner).

### How does it usually happen?
The most common vulnerability that leads to horizontal privilege escalation is **Insecure Direct Object Reference (IDOR)**. This happens when an application exposes a direct reference to an internal implementation object (like a database ID) in an API endpoint or URL, and fails to verify that the requesting user actually owns that object.

**Vulnerable Example:**
```http
GET /api/profile?userId=60d5ec49f1a2c3d4e5f6g7h8
```
If the backend simply takes `req.query.userId` and fetches the profile without checking if the currently logged-in user *is* `60d5ec49f1a2c3d4e5f6g7h8`, any user can view any other user's profile simply by changing the ID in the request.

---

## 2. How Fitmate Tackles It

Fitmate eliminates horizontal privilege escalation at the **architectural level** using a Zero-Trust pattern for client-provided identifiers regarding user ownership. 

Our strategy revolves around two core principles:
1. **Server-Side Identity Source of Truth (JWT Payload)**
2. **Implicit Query Context (No User IDs in API Routes)**

### Principle 1: The JWT Payload is the Single Source of Truth

We never trust the client to tell us "who" they are in the body, query, or parameters of a request. The identity of the user is strictly extracted from the securely signed JWT.

In `backend/src/middleware/authMiddleware.ts`, the `authMiddleware` intercepts the request, verifies the token signature against our `JWT_SECRET`, and extracts the `userId` payload. 

```typescript
// backend/src/middleware/authMiddleware.ts
const decoded = jwt.verify(
  token,
  process.env.JWT_SECRET as string
) as { userId: string };

// Attach securely verified userId to the request
req.userId = decoded.userId;
```

By attaching `req.userId` at the middleware level, we guarantee that all downstream controllers have access to an unforgeable identity.

### Principle 2: Implicit Query Context

Because we know exactly who the user is via `req.userId`, our API endpoints for self-managed resources do not accept user IDs as parameters. 

Notice our routes:
* **Vulnerable Pattern:** `GET /api/profile/:id` or `GET /api/workoutPlan/:userId`
* **Fitmate Pattern:** `GET /api/profile` and `GET /api/workout`

When the controller executes, it ignores any external inputs regarding identity and queries the database explicitly using the server-side `req.userId`.

#### Example 1: Profile Controller

In `backend/src/controllers/profileController.ts`, both fetching and updating a profile are locked to the `req.userId`.

```typescript
// backend/src/controllers/profileController.ts
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Get the unforgeable ID from the auth middleware
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const userObjectId = new mongoose.Types.ObjectId(String(userId));
    
    // 2. Query the database strictly using that ID
    const profile = await Profile.findOne({ userId: userObjectId });
    
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    
    res.json(profile);
  } catch (error) { ... }
};
```

Even during an update (`upsertProfile`), if a malicious client sends `{ "userId": "someone_elses_id", "weight": 80 }` in the POST body, it is completely ignored. The controller explicitly binds the operation to `req.userId`:

```typescript
profile = await Profile.findOneAndUpdate(
  { userId: userObjectId }, // Hard-bound to the JWT identity
  profileData,              // The requested changes
  { new: true }
);
```

#### Example 2: Workout Controller

The same pattern strictly applies to complex, AI-generated resources like Workout Plans. 

```typescript
// backend/src/controllers/workoutController.ts
export const getWorkoutPlan = async (req: Request, res: Response) => {
  try {
    // Identity is derived from the token, not the URL
    const userId = (req as any).userId; 
    
    // It is mathematically impossible for User A to fetch User B's plan
    // because the query is hardcoded to use User A's ID.
    const plan = await WorkoutPlan.findOne({ userId }).sort({ createdAt: -1 });
    
    if (!plan) {
      return res.status(404).json({ message: "No workout plan found" });
    }
    
    res.json(plan);
  } catch (error) { ... }
};
```

---

## 3. Summary of the Defense Model

1. **Authentication:** The user logs in and receives a JWT signed with a secret only the server knows. The payload contains their `userId`.
2. **Transmission:** The client sends the JWT in the `Authorization: Bearer <token>` header for every request (managed seamlessly by our `client.ts` interceptor).
3. **Verification:** `authMiddleware.ts` verifies the signature. If valid, it extracts the `userId` and mutates the Request object (`req.userId = ...`).
4. **Execution:** Controllers ignore client-supplied IDs for self-resources. They query the database using `{ userId: req.userId }`. 

Because a malicious user cannot forge the JWT signature, they cannot manipulate `req.userId`. Because the controllers only use `req.userId` to fetch data, horizontal privilege escalation is structurally impossible within this design pattern.
