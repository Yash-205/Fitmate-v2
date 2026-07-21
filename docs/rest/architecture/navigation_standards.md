# Navigation & Routing Standards

This document outlines the industry-standard approach for handling navigation in the FitMate application. Adhering to these standards ensures the application remains scalable, accessible, and SEO-friendly.

## 1. Centralized Route Constants

To avoid "Magic Strings" (hardcoded paths like `/chat`) scattered throughout the codebase, we use a centralized routes file.

**Location**: `frontend/src/lib/routes.ts`

### Why this is Scalable:
If you decide to change the URL of the AI Coach from `/chat` to `/coach`, you only need to update it in **one place**. Every component using `ROUTES.CHAT` will automatically reflect the change.

```typescript
export const ROUTES = {
  HOME: '/',
  CHAT: '/chat',
  WORKOUT: '/workout',
  // ...
} as const;
```

## 2. Declarative Navigation (`Link`)

**Definition for Interviews**: 
> "The `Link` component is a declarative navigational element in `react-router-dom`. It is essentially a wrapper around the standard HTML `<a>` tag that prevents a full page reload by intercepting the click and updating the browser's History API (`pushState`). This enables client-side routing, making the application feel like a single, seamless experience (SPA) while maintaining SEO and accessibility."

### The `asChild` Pattern (Industry Standard for UI Kits)
When using a styled `Button` component, do not wrap the button in a link or vice versa. Instead, use the Radix UI `Slot` pattern:

```tsx
<Button asChild>
  <Link to={ROUTES.CHAT}>Start Chatting</Link>
</Button>
```

### Interview Talking Points (Key Benefits):
- **Client-Side Routing**: Prevents a full-page refresh, keeping the state intact.
- **Semantic HTML**: Renders a real `<a>` tag, which is critical for search engines (SEO) and screen readers (Accessibility).
- **Native UX**: Supports standard browser behaviors like `Cmd/Ctrl + Click` to open in a new tab.

---

## 3. Decision Matrix: `Link` vs. `useNavigate`

A common question is: *"When should I use which?"* Use this rule of thumb:

| Scenario | Recommendation | Rationale |
| :--- | :--- | :--- |
| **Static Destinations** (Navbars, Footer, Profile) | **`Link`** | Standard "Go to X" behavior. |
| **Call to Action Buttons** (Sign Up, Chat Now) | **`Link`** | Even if styled as buttons, they are semantically links. |
| **Form Submissions** (Redirect after Save) | **`useNavigate`** | Navigation depends on logic completion. |
| **Auth Guards** (Unauthorized -> Login) | **`useNavigate`** | Programmatic redirect based on state. |
| **Multi-step Modals** (Back/Next) | **`useNavigate`** | Often involves state changes alongside movement. |

## 4. Programmatic Navigation (`useNavigate`)

Use the `useNavigate` hook only when navigation depends on a logic-driven event or side effect.

**Examples**:
- Redirecting after a successful form submission.
- Redirecting an unauthorized user to the login page.
- Navigating after an API call completes.

```typescript
const navigate = useNavigate();

const handleLogin = async () => {
  await login();
  navigate(ROUTES.WORKOUT); // Redirect after logic
};
```

## 4. Routing Definition

All route definitions should remain centralized in `App.tsx`. This serves as the "source of truth" for the application's structure.

---

## Scalability Summary

| Technique | Problem Solved | Scalability Impact |
| :--- | :--- | :--- |
| **Constants** | Magic strings & broken links. | Change a URL in 1 place instead of 50. |
| **Link Component** | SEO & Browser behavior. | Native browser features work out-of-the-box. |
| **Separation of Concerns** | Logic spaghetti. | Pages handle what to show; App.tsx handles where it lives. |
