# Coding Style Guide

This document outlines the general coding style conventions and principles to follow across the FractiVerse project. Consistency in style improves readability and maintainability.

## 1. Language: TypeScript

- **Strict Typing:** Utilize TypeScript's static typing features rigorously. Avoid `any` where possible; prefer specific types, `unknown`, or generics.
- **Type Inference:** Leverage type inference where it enhances readability, but explicitly type variables and function returns when clarity is needed, especially for complex types or public APIs.
- **Interfaces vs. Types:** Prefer `interface` for defining object shapes and `type` for unions, intersections, primitives, or more complex type manipulations.

## 2. Naming Conventions

- **Variables & Functions:** Use `camelCase` (e.g., `tokenBalance`, `getUserData`).
- **Components & Interfaces/Types:** Use `PascalCase` (e.g., `ChatWindow`, `UserProfile`, `TransactionType`).
- **Constants:** Use `UPPER_SNAKE_CASE` for true constants (e.g., `MAX_RETRIES`, `DEFAULT_TIMEOUT`).
- **File Names:** Use `kebab-case` for files (e.g., `chat-message.tsx`, `api-client.ts`), except for component files which should use `PascalCase.tsx` (e.g., `ChatMessage.tsx`).
- **Boolean Variables:** Prefix with `is`, `has`, `should`, `can` (e.g., `isLoading`, `hasToken`, `shouldUpdate`).
- **Descriptive Names:** Choose meaningful names that clearly indicate the purpose of the variable, function, or component. Avoid overly generic names like `data`, `temp`, `handle`.

## 3. Formatting

- **Consistency:** Adhere to the project's Prettier configuration (if configured) for automatic formatting. Run the formatter before committing code.
- **Indentation:** Use spaces (typically 2 or 4, follow project config).
- **Line Length:** Keep lines reasonably short (e.g., 80-120 characters) to improve readability.
- **Whitespace:** Use whitespace effectively to separate logical blocks of code.

## 4. Comments

- **Purpose:** Write comments to explain *why* something is done, not *what* the code does (the code should be self-explanatory). Explain complex logic, assumptions, or workarounds.
- **Style:** Use `//` for single-line comments and `/** ... */` for multi-line documentation blocks (JSDoc/TSDoc).
- **TODO/FIXME:** Use standard markers like `// TODO:` or `// FIXME:` with a brief explanation or issue reference.

## 5. Simplicity and Clarity

- **KISS Principle:** Keep It Simple, Stupid. Avoid unnecessary complexity or abstraction.
- **DRY Principle:** Don't Repeat Yourself. Use functions, components, or constants to avoid duplicating code. Balance DRY with clarity; sometimes slight repetition is clearer than overly complex abstractions.
- **Readability:** Write code that is easy for others (and your future self) to understand. Break down complex functions into smaller, manageable units.
- **Avoid Magic Values:** Use named constants instead of hardcoding numbers or strings directly in the code.

## 6. Error Handling

- **Explicit Handling:** Handle potential errors explicitly using `try...catch` blocks or `.catch()` for promises.
- **Informative Errors:** Provide clear and informative error messages.
- **Logging:** Log errors appropriately (see specific backend/frontend guides).

## 7. Imports

- **Organization:** Group imports logically (e.g., React/Next imports, library imports, local module imports).
- **Absolute Paths:** Prefer absolute paths (e.g., `@/components/Button`) over relative paths (`../../../components/Button`) for imports outside the immediate directory, configured via `tsconfig.json`.

## 8. General Best Practices

- **Immutability:** Prefer immutable data structures where possible, especially when working with state.
- **Pure Functions:** Write pure functions (functions that always return the same output for the same input and have no side effects) when feasible.
- **Dependencies:** Keep dependencies updated and remove unused ones. Evaluate the need for new dependencies carefully. 