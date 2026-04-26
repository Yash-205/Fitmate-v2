# Understanding React Custom Hooks

You asked a great question: **"Why not just copy-paste the logic into another file and use that file?"**

The answer is: **That is exactly what a Custom Hook is!** However, in React, there is a special rule about *how* you do that copy-pasting.

## 1. Why a "Hook" and not just a "Regular File"?

In React, if a file wants to manage **State** (like `useState`) or **Side Effects** (like `useEffect`), it **must** be a hook.

* **A Regular Function**: If you put logic in a regular `.js` file, it can do math or format strings, but it **cannot** tell a React component to "re-render" or "show a modal."
* **A Custom Hook**: It is a function that starts with the word `use` (e.g., `useAppFlow`). This tells React: *"Hey, this function is allowed to use React's special powers (like state)."*

## 2. The Problems Custom Hooks Solve

As your app gets bigger, you run into these 3 main problems:

### A. The "Fat Component" Problem

Components like `App.tsx` start small but eventually get hundreds of lines of code. It becomes impossible to find the UI code (the HTML) because it's buried under tons of "Brain" logic.

* **Solution**: Move the "Brain" to a hook. `App.tsx` becomes 10% logic and 90% UI.

### B. Logic Entanglement

When logic is mixed with UI, it's hard to change one without breaking the other.

* **Solution**: If you want to change how a "Trainer" is redirected, you only edit the hook. You don't have to touch the `App.tsx` routing code at all.

### C. Reusability

What if you want to check the "Trainer vs. Learner" status on the Profile page AND the Navbar?

* **Without Hooks**: You have to write the same `localStorage.getItem` code in both places.
* **With Hooks**: You just call `const { role } = useAppFlow()` in both files.

## 4. Are there any "Problems" with Hooks?

Hooks are very powerful, but they have a few "Gotchas":

1. **The "Top Level" Rule**: You can't call a hook inside an `if` statement or a loop. They must always be at the top of your function.
2. **Tracking State**: If you have too many hooks, it can sometimes be hard to track where a specific piece of data is coming from if you don't name them well.
3. **Over-Engineering**: For a tiny app, hooks are overkill. But for an app with multiple roles (Learner, Trainer, Admin), they are essential.

## 5. Summary: The Fitmate Situation

In **Fitmate**, we have a complex "Onboarding Flow":

1. Is the user logged in?
2. Do they have a Profile?
3. Are they a Trainer?
4. Do they have a *Trainer* Profile?

If we put all those `if/else` checks in `App.tsx`, the file will become a mess. By "copy-pasting" that logic into `useAppFlow.ts`, we create a dedicated "Traffic Controller" for your app.

**App.tsx** = The Map (Routes).
**useAppFlow.ts** = The Traffic Controller (Brain).
