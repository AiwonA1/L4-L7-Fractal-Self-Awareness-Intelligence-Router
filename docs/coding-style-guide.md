# Coding Style Guide

This document outlines the general coding style conventions and principles to follow across the FractiVerse project. Consistency in style improves readability and maintainability.

## 1. Language: TypeScript

- **Strict Typing:** Utilize TypeScript's static typing features rigorously. Enable `strict` mode in `tsconfig.json`. Avoid `any` where possible; prefer specific types, `unknown`, or generics.
- **Type Inference:** Leverage type inference for simple cases, but explicitly type function parameters, return values, and complex variables for clarity.
- **Interfaces vs. Types:** 
    - Prefer `interface` for defining object shapes or implementing class structures, as they are easily extendable.
      ```typescript
      interface UserProfile {
        id: string;
        name: string | null;
        email: string;
        tokenBalance: number;
      }
      ```
    - Use `type` for unions, intersections, primitives, tuples, or function signatures.
      ```typescript
      type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED';
      type UserId = string;
      type FetchDataFunction = (url: string) => Promise<unknown>;
      ```

## 2. Naming Conventions

- **Variables & Functions:** `camelCase` (e.g., `tokenBalance`, `getUserData`).
- **Components & Interfaces/Types:** `PascalCase` (e.g., `ChatWindow`, `UserProfile`, `TransactionType`).
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`, `DEFAULT_TIMEOUT`, `STRIPE_PRICE_IDS`).
- **File Names:** `kebab-case` for non-component files (e.g., `api-client.ts`, `auth-helpers.ts`), `PascalCase.tsx` for component files (e.g., `ChatMessage.tsx`).
- **Boolean Variables:** Prefix with `is`, `has`, `should`, `can` (e.g., `isLoading`, `hasActiveSubscription`, `shouldRefresh`).
- **Descriptive Names:** Choose names that clearly convey intent. For UI components, reflect their visual function. For functions, indicate their action.

## 3. Formatting

- **Prettier:** Ensure Prettier is configured and run automatically (e.g., via VS Code settings or pre-commit hooks) to enforce consistent formatting based on project configuration (`.prettierrc` if present).
- **Indentation:** Use 2 spaces (configurable via Prettier).
- **Line Length:** Target ~100-120 characters (configurable via Prettier).
- **Whitespace:** Use blank lines to separate logical blocks of code (e.g., between functions, import groups).

## 4. Comments

- **Purpose:** Explain *why*, not *what*. Focus on complex logic, trade-offs, or workarounds.
- **Style:** Use `//` for single lines. Use TSDoc (`/** ... */`) for documenting functions, interfaces, and types, especially for reusable code or library functions.
  ```typescript
  /**
   * Fetches the user's profile data from the server.
   * @param userId - The ID of the user to fetch.
   * @returns A promise resolving to the UserProfile or null if not found.
   */
  async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
    // ... implementation
  }
  ```
- **TODO/FIXME:** `// TODO(username): Description` or `// FIXME: Description (#issueNumber)`.

## 5. Simplicity and Clarity

- **KISS & YAGNI:** Keep It Simple, Stupid & You Ain't Gonna Need It. Avoid premature optimization or overly complex abstractions.
- **DRY:** Don't Repeat Yourself. Refactor common logic into reusable functions/hooks/components. Balance with readability.
- **Readability:** Use clear variable names, break down complex operations, and maintain consistent structure.
- **Avoid Magic Values:** Define constants for recurring strings, numbers, or configuration values.
  ```typescript
  // Bad
  if (status === 3) { /* ... */ }
  const role = 'admin_user';

  // Good
  const STATUS_COMPLETED = 3;
  if (status === STATUS_COMPLETED) { /* ... */ }

  const ADMIN_ROLE = 'admin_user';
  const role = ADMIN_ROLE;
  ```

## 6. Error Handling

- **Explicit Handling:** Use `try...catch` for synchronous code that might throw, and `.catch()` or `async/await` with `try...catch` for promises.
- **Custom Errors:** Consider defining custom error classes for specific error scenarios to allow for more granular catching and handling.
  ```typescript
  class TokenError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'TokenError';
    }
  }
  // ... later
  try {
    await deductTokens(userId, amount);
  } catch (error) {
    if (error instanceof TokenError) {
      // Handle specific token deduction error
    } else {
      // Handle generic error
    }
  }
  ```
- **Informative Errors:** Errors logged or thrown should provide context.
- **Logging:** Integrate with project logging standards (see Frontend/Backend guides).

## 7. Imports

- **Organization:** Group imports logically and separate them with blank lines:
    1. React / Next.js imports
    2. External library imports (alphabetical)
    3. Internal absolute imports (`@/components`, `@/lib`, etc.) (alphabetical)
    4. Relative imports (`./`, `../`) (alphabetical)
    5. Type imports (`import type { ... }`)
- **Absolute Paths:** Configure and use absolute paths via `tsconfig.json` (`compilerOptions.paths`) for imports outside the immediate module directory.
  ```json
  // tsconfig.json example
  {
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@/*": ["src/*"]
      }
    }
  }
  ```
- **Avoid Default Exports (Generally):** Prefer named exports for better discoverability and easier refactoring. Use default exports primarily for page/layout components in Next.js App Router as per convention.

## 8. General Best Practices

- **Immutability:** Treat state and props as immutable. Use non-mutating array/object methods (e.g., `map`, `filter`, spread syntax `{...obj}`) instead of direct mutation.
- **Pure Functions:** Write pure functions where practical for predictability and testability.
- **Dependencies:** Regularly review and prune unused dependencies (`depcheck`). Keep core dependencies (Next.js, React, Supabase) updated, managing breaking changes carefully. 