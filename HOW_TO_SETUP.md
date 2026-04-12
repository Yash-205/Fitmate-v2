# Technical Setup Guide: FitMate Frontend

This guide explains EXACTLY how the project was configured with Tailwind CSS v4, shadcn/ui, and Base UI.

## 1. Environment & Dependencies
The first step was installing the next-generation Tailwind engine and the necessary PostCSS bridge.

### Commands Run:
```bash
# Install Tailwind v4 and PostCSS support
npm install tailwindcss @tailwindcss/postcss postcss

# Install UI Primitives and Utilities
npm install @base-ui/react lucide-react clsx tailwind-merge tailwindcss-animate
```

## 2. PostCSS Configuration
Tailwind v4 requires the new `@tailwindcss/postcss` plugin to work with Vite's CSS pipeline.

**File: `postcss.config.js`**
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

## 3. Path Alias Setup
To make shadcn work correctly with the `@/` prefix, both Vite and TypeScript were configured.

**File: `vite.config.ts`**
```typescript
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**File: `tsconfig.json` & `tsconfig.app.json`**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 4. shadcn/ui Initialization
We initialized shadcn with a specific configuration to use **Base UI** instead of Radix.

**File: `components.json`**
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

## 5. The "CSS-First" Theme
Using Tailwind v4's new paradigm, we moved all configuration into CSS variables and `@theme` blocks.

**File: `src/index.css`**
```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@plugin "tailwindcss-animate";

@theme inline {
  --color-primary: oklch(0.645 0.246 35.08); /* Custom FitMate Orange */
  --color-border: var(--border);
  --color-background: var(--background);
  /* ... mapping all shadcn variables */
}

@layer base {
  :root {
    --background: oklch(1 0 0);
    --primary: oklch(0.645 0.246 35.08);
    --radius: 0.75rem;
    /* ... oklch color tokens */
  }
}
```

## 6. Component Installation
Components were added via the CLI, which automatically detects the `base-ui` dependency and generates the appropriate `ui/` files.

```bash
npx shadcn@latest add button card table
```

## 7. Design Logic
- **Backdrop Filters**: Used `backdrop-blur-md` with `bg-white/80` for the glass effect.
- **Dynamic Icons**: Standardized icons using `lucide-react` and `react-icons`.
- **Layout**: Switched from fixed spacing to `flex` and `grid` layouts combined with `max-w` containers for responsiveness.
