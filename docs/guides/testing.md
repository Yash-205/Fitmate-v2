# Testing Strategy & Tools

This document explains the testing stack used in Fitmate and why these specific tools were chosen.

## 1. Our Testing Stack

| Tool | Usage | Purpose |
| :--- | :--- | :--- |
| **Vitest** | Frontend & Backend | Primary test runner and assertion library. |
| **Supertest** | Backend | Integration testing for HTTP endpoints. |
| **React Testing Library** | Frontend | Component testing with a focus on user behavior. |
| **Cypress** | Root/E2E | End-to-end testing for critical user flows. |

---

## 2. Why Vitest? (Comparison with Jest, Mocha, Chai)

Fitmate uses **Vitest** because it is built to handle modern JavaScript (ESM) and TypeScript with significantly better performance than traditional tools.

### Vitest vs. Mocha & Chai
- **The "All-in-One" Advantage:** Unlike Mocha (runner) and Chai (assertions), which must be configured separately, Vitest provides everything out of the box with zero-config TypeScript support.

### Vitest vs. Jest
- **Vite Integration:** Since our frontend uses Vite, Vitest shares the same transformation pipeline. This means the tests run exactly like the application code.
- **Speed:** Vitest leverages worker threads and Vite's HMR (Hot Module Replacement) logic for near-instant test re-runs in watch mode.
- **Native ESM:** It handles modern `import/export` syntax natively, avoiding the "configuration hell" often associated with Jest in modern Node.js projects.
- **Compatibility:** It uses a Jest-compatible API (`expect`, `describe`, `it`), so developers familiar with Jest can be productive immediately.

---

## 3. Integration with Supertest

In the **Backend**, we use Vitest in combination with **Supertest**.
- **Vitest** manages the execution and assertions.
- **Supertest** acts as a virtual client that sends requests to the Express server to verify API responses (status codes, JSON bodies, etc.).

---

## 4. How to Run Tests

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
npm test
```

### E2E Tests (Cypress)
```bash
# Run in root directory
npm run test:run  # Headless mode
npm run test:open # GUI mode
```
