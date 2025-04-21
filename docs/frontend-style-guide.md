# Frontend Style Guide

This guide covers conventions for developing the frontend of the FractiVerse application using Next.js, React, TypeScript, and Chakra UI.

## 1. Framework: Next.js 14 (App Router)

- **App Router:** Embrace the App Router paradigm. Utilize `layout.tsx`, `page.tsx`, `loading.tsx`, and `error.tsx` conventions for structuring routes.
- **Server Components vs. Client Components:** Understand the distinction. Default to Server Components. Use the `"use client"` directive only when necessary (for hooks like `useState`, `useEffect`, event listeners, or browser APIs).
- **Data Fetching:** Prefer Server Components for data fetching. Use `fetch` directly or Server Actions. For client-side fetching, use hooks like `useEffect` or libraries like SWR/TanStack Query if introduced later (currently aiming for simplicity).
- **Routing:** Use the `<Link>` component from `next/link` for client-side navigation.
- **File Naming:** Follow App Router conventions (`page.tsx`, `layout.tsx`, etc.) within route segments.

## 2. Component Development: React & TypeScript

- **Functional Components:** Exclusively use functional components with Hooks.
- **TypeScript:** Define props using TypeScript interfaces or types (e.g., `interface MyComponentProps { ... }`).
- **Props:** Keep props minimal and specific. Destructure props for clarity.
- **Component Structure:** Organize components logically within `src/app/components/`. Create subdirectories for related components or features.
- **Reusability:** Design components with reusability in mind. Extract common UI patterns into shared components.
- **Simplicity:** Avoid overly complex components. Break down large components into smaller, focused ones.

## 3. UI Library: Chakra UI

- **Consistency:** Strictly use Chakra UI for all layout, components, theming, and styling. Avoid mixing with other UI libraries or custom CSS unless absolutely necessary and documented.
- **Theming:** Utilize the Chakra UI theme (`src/app/styles/theme.ts` or similar) for consistent colors, typography, spacing, etc. Extend the theme rather than overriding styles inline.
- **Component Composition:** Leverage Chakra UI's component composition features (e.g., `Box`, `Stack`, `Grid`, `Flex`) for layout.
- **Style Props:** Use Chakra UI style props for concise styling directly on components (e.g., `<Box p={4} bg="blue.500">`). Avoid overly complex inline styles; consider defining variants or custom components for repeated styles.
- **Responsiveness:** Use Chakra UI's responsive style props (e.g., `p={{ base: 2, md: 4 }}`) and responsive hooks (`useBreakpointValue`) for building adaptive layouts.
- **Accessibility:** Utilize Chakra UI's built-in accessibility features. Ensure proper use of semantic elements and ARIA attributes where needed.

## 4. State Management

- **Local State:** Use `useState` for component-specific state.
- **Global State:** Use React Context (`useContext`) for global state (e.g., authentication status, user profile, token balance) shared across multiple components. Keep context providers focused and located appropriately in the component tree.
- **Avoid Complex Libraries (Initially):** Stick to built-in React state management (useState, useContext) as per the project rules. Re-evaluate if complexity demands a lightweight library like Zustand or Jotai later.
- **Immutability:** Treat state as immutable. When updating state based on previous state, use the functional update form of `setState`.

## 5. Hooks

- **Custom Hooks:** Extract reusable logic (especially involving state or side effects) into custom hooks (e.g., `useAuth`, `useTokenBalance`) placed in `src/app/hooks/`.
- **Rules of Hooks:** Strictly adhere to the Rules of Hooks (call hooks at the top level, only call from React functions).
- **Cleanup:** Implement cleanup logic in `useEffect` hooks (e.g., unsubscribing from listeners, clearing timers) to prevent memory leaks.

## 6. Loading & Error States

- **Loading UI:** Always provide clear visual feedback during data fetching or asynchronous operations. Use Chakra UI components like `Spinner`, `Skeleton`, or disable buttons with `isLoading` props.
- **Error Handling:** Implement graceful error handling for API calls or unexpected issues. Use `error.tsx` files for route segment errors. Display user-friendly error messages (e.g., using Chakra UI `Alert` or `Toast`).

## 7. Supabase Client Usage

- **Client-Side Client:** Use `createClientComponentClient` from `@supabase/auth-helpers-nextjs` within Client Components (`"use client"`) for interacting with Supabase (auth, database).
- **Real-time:** Utilize Supabase real-time subscriptions within Client Components (using `useEffect`) for features like live chat updates or token balance changes. Ensure subscriptions are properly cleaned up. 