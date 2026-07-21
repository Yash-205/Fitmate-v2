# JSDOM Environment

This document explains what **jsdom** is, why it is used in Fitmate, and how it is configured.

## 1. What is JSDOM?
**jsdom** is a pure-JavaScript implementation of many web standards, notably the WHATWG DOM and HTML Standards, for use with Node.js. 

In simpler terms: **It is a browser environment that runs entirely in code, without an actual browser window.**

### Key Features:
- **DOM Simulation**: It provides objects like `document`, `window`, and `localStorage` inside Node.js.
- **Event Handling**: It can simulate clicks, typing, and other browser events.
- **Speed**: Because it doesn't have to render pixels or manage a GPU, it is much faster than running tests in a real browser (like Chrome or Firefox).

---

## 2. Are we using it?
**Yes.** Fitmate uses `jsdom` specifically for the **frontend** testing environment.

### Where is it configured?
You can find the configuration in `frontend/vitest.config.ts`:

```typescript
// frontend/vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom', // <--- This tells Vitest to use JSDOM
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
```

And it is installed as a development dependency in `frontend/package.json`:
```json
"devDependencies": {
  "jsdom": "^27.0.1"
}
```

---

## 3. Why do we need it?
We use `jsdom` because we are building a **React** application. 

1. **Component Testing**: React components are designed to run in a browser. They expect a `document` to exist so they can "mount" elements. Node.js does not have a `document` by default.
2. **React Testing Library**: Our tests use `@testing-library/react`, which relies on `jsdom` to render components into a virtual DOM so we can query them (e.g., `screen.getByText('Login')`).
3. **CI/CD Efficiency**: Since `jsdom` doesn't require a GUI, our tests can run easily on GitHub Actions or other automated servers that don't have a screen.

---

## 4. JSDOM vs. Real Browser (Cypress)
It is important to understand the difference between our two testing layers:

| Feature | JSDOM (Vitest) | Real Browser (Cypress) |
| :--- | :--- | :--- |
| **Speed** | Extremely Fast | Slower |
| **Accuracy** | High (Simulated) | Perfect (Real) |
| **Use Case** | Unit/Component Tests | End-to-End (E2E) Flows |
| **Environment** | Node.js | Actual Chrome/Electron |

In short, **jsdom** is our "workhorse" for testing individual pieces of the UI quickly, while **Cypress** is used for final verification of the whole app in a real browser.
