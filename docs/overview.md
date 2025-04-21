# FractiVerse System Overview

This document provides a high-level overview of the FractiVerse project, including its structure, technologies, functionalities, architecture, and potential areas for improvement.

## 1. Project Structure

The repository follows a structure typical for a Next.js 14 application using the App Router, now consolidated primarily within the `src/` directory:

```plaintext
/
├── .next/           # Next.js build output (cache)
├── .vscode/         # VSCode settings
├── __tests__/       # Vitest tests
├── config/          # Configuration files (potentially Stripe, etc.)
├── dist/            # Distribution output (likely not used for Next.js)
├── docs/            # Project documentation (this file)
├── node_modules/    # Project dependencies
├── public/          # Static assets (images, icons)
├── scripts/         # Utility/automation scripts
├── src/             # Main source code
│   ├── app/         # Next.js App Router core
│   │   ├── actions/     # Server Actions (if used)
│   │   ├── api/         # Backend API endpoints
│   │   ├── components/  # Reusable React UI components
│   │   ├── constants/   # Application constants
│   │   ├── context/     # React context providers (e.g., AuthContext)
│   │   ├── hooks/       # Custom React hooks
│   │   ├── layer/       # Layer-specific page routes (e.g., /layer/4, /layer/[id])
│   │   ├── layers/      # UI components specific to Layers (used by pages in /layer)
│   │   └── (other page routes, layouts, etc.)
│   ├── lib/           # Shared utilities, clients, services, types, prompts
│   │   ├── services/    # Backend/Client service functions (e.g., user access)
│   │   ├── supabase/    # Supabase client configurations (client, server, admin)
│   │   ├── prompts/     # AI prompts
│   │   └── (utils, clients: stripe, openai, email, etc.)
│   └── types/         # Global TypeScript types (e.g., Supabase generated)
├── supabase/        # Supabase specific files (migrations? policies?)
├── types/           # (Potentially redundant with src/types, check usage)
├── .env.*           # Environment variable files
├── .gitignore
├── .npmrc
├── .nvmrc
├── .vercelignore
├── middleware.ts    # Next.js middleware
├── next.config.js   # Next.js configuration
├── package.json     # Project manifest, dependencies, scripts
├── README.md        # Project README
├── tsconfig.json    # TypeScript configuration
├── vercel.json      # Vercel deployment configuration
└── vitest.config.ts # Vitest test runner configuration
```

**Observations:**
*   Uses Next.js App Router (`src/app/` directory).
*   Code is primarily organized within the `src/` directory.
*   Clear separation of concerns (API, components, lib).
*   Shared utilities/services consolidated in `src/lib`.
*   Includes testing (`__tests__`, Vitest) and documentation (`docs/`).
*   Presence of both `prisma/` and `supabase/` directories needs clarification regarding database management strategy (Prisma might be only for migrations).
*   Presence of both `src/types/` and a root `types/` directory might be redundant; standardize usage.

## 2. Core Technologies & Packages

Based on `package.json`:

*   **Framework:** Next.js 14, React 18
*   **UI:** Chakra UI (@chakra-ui/react, @chakra-ui/next-js), Framer Motion, React Icons
*   **Styling:** Primarily Chakra UI. Tailwind CSS is present in dev dependencies (`tailwindcss`, `prettier-plugin-tailwindcss`), but its active use alongside Chakra UI is discouraged by project rules and potentially problematic.
*   **Database:** Supabase (PostgreSQL)
    *   Client Libraries: `@supabase/ssr`, `@supabase/auth-helpers-nextjs`, `@supabase/supabase-js`
    *   Schema/Migrations: Prisma (`prisma/` directory, although not listed as a direct dependency in `package.json` - likely used via CLI).
*   **Authentication:** Supabase Auth
*   **Payments:** Stripe (`@stripe/react-stripe-js`, `@stripe/stripe-js`, `stripe`)
*   **AI:** OpenAI (`openai`)
*   **State Management:** Likely React Context (`app/context/`) + Hooks.
*   **Utilities:** Zod (validation), Axios (HTTP), Nodemailer (email), Katex/React-Katex (math rendering), UUID, Sharp (image processing), JWT, bcryptjs.
*   **Language:** TypeScript
*   **Testing:** Vitest, React Testing Library, MSW (Mock Service Worker)
*   **Deployment:** Vercel

## 3. Key Functionalities

*   **Multi-Layered AI Interaction:** Provides a chat interface allowing interaction with an AI (likely GPT-4 via OpenAI API) based on selected conceptual layers (Layers 4-7 described in README).
*   **User Authentication & Management:** Signup, login, logout, session management, password reset, email verification, profile updates handled via Supabase Auth and custom API endpoints.
*   **Token System:** Implements a token (`FractiTokens`) economy where users purchase tokens to spend on AI interactions. Includes balance tracking and transaction history.
*   **Payment Processing:** Integrates Stripe for secure purchasing of tokens, handling checkout sessions, payment intents, and webhook events for fulfillment.
*   **Database Operations:** Stores and retrieves user data, chat history, token balances, and transaction records from the Supabase PostgreSQL database.
*   **API Backend:** Next.js API routes provide the server-side logic for authentication, AI calls, database interactions, payment handling, etc.
*   **Web Frontend:** A responsive web application built with Next.js and Chakra UI serves as the user interface.

## 4. System Architecture

The system follows a typical modern web application architecture:

```mermaid
graph LR
    subgraph "User Device"
        A[Browser / Client]
    end

    subgraph "Vercel Platform"
        B(Next.js Frontend - React/Chakra UI)
        C(Next.js API Routes - Serverless Functions)
        D{Vercel Postgres (optional)}
    end

    subgraph "External Services"
        E[Supabase Auth]
        F[Supabase DB (PostgreSQL)]
        G[Stripe API]
        H[OpenAI API]
    end

    A -- HTTPS --> B
    A -- HTTPS --> C
    B -- Server-side Rendering / API Calls --> C

    C -- Auth API Calls --> E
    C -- DB Operations (Supabase Client / Prisma?) --> F
    C -- Payment API Calls --> G
    C -- AI API Calls --> H

    %% Optional Direct Interactions (Check Implementation)
    A -- Supabase Auth UI --> E
    A -- Stripe Elements --> G
    C -- DB Operations --> D  // If using Vercel Postgres directly

    %% Link Supabase DB if separate from Vercel Postgres
    %% F --- D // If F and D are the same instance hosted on Vercel

    style E fill:#FFDAB9,stroke:#333,stroke-width:2px
    style F fill:#ADD8E6,stroke:#333,stroke-width:2px
    style G fill:#90EE90,stroke:#333,stroke-width:2px
    style H fill:#DDA0DD,stroke:#333,stroke-width:2px
    style D fill:#ADD8E6,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
```

**Explanation:**
*   The user interacts with the Next.js frontend running in their browser.
*   The frontend (built with React/Chakra UI) communicates with the Next.js backend API routes hosted as serverless functions on Vercel.
*   These API routes handle the core logic, interacting with:
    *   **Supabase Auth** for authentication.
    *   **Supabase Database** (PostgreSQL, potentially hosted on Vercel or Supabase directly) for data storage, likely using the Supabase client library or Prisma.
    *   **Stripe API** for payment processing.
    *   **OpenAI API** for AI model interactions.
*   There might be direct interactions from the client to Supabase (for auth UI flows) or Stripe (for Stripe Elements).

## 5. Potential Issues & Redundancies

*   **Database ORM/Client Strategy:** The presence of both `prisma/` and `supabase/` directories, along with Supabase client libraries in `package.json`, suggests a potential lack of clarity or redundancy in how the database is accessed and managed. Using *both* Prisma and the Supabase client library for runtime operations against the *same* database is generally not recommended. Choose one primary method (likely Supabase client based on dependencies, with Prisma potentially just for migrations).
*   **Styling Conflicts:** The inclusion of Tailwind CSS development dependencies alongside Chakra UI conflicts with the project rule "Keep styling Chakra UI only". This can lead to increased bundle size, styling conflicts, and developer confusion. Recommend removing Tailwind dependencies unless there's a specific, isolated use case.
*   **Directory Structure (`src/` vs `app/`, `lib/` duplication):** The previous structure had some potential redundancy (e.g., `app/lib` vs `lib`). This has been addressed by consolidating shared code into `src/lib`. Ensure the top-level `src/` vs `app/` convention aligns with team preference (using `src/app` is common). The root `types/` dir might be unused.
*   **State Management Scalability:** Relying solely on React Context/Hooks might become complex for managing global state (user auth, token balance, chat state) as the application grows. Evaluate if a dedicated state management library (like Zustand or Jotai) would be beneficial, weighing against the "no extra abstraction layers" guideline.
*   **Error Reporting:** No dedicated error reporting service (e.g., Sentry) seems to be integrated. Relying only on Vercel logs might be insufficient for proactive issue detection and debugging in production.
*   **Environment Variable Template:** Having both `.env.example` and `.env.template` is redundant. Standardize on `.env.example`.

## 6. Recommendations

*   **Clarify Database Strategy:** Decide on using *either* Prisma *or* the Supabase client library for runtime database operations and remove/refactor accordingly. Use Prisma primarily for migrations if desired.
*   **Consolidate Styling:** Remove Tailwind CSS dependencies and ensure all styling is done via Chakra UI, adhering to project rules.
*   **Refactor Directory Structure:** The structure has been partially refactored to consolidate into `src/lib`. Verify the `src/types` vs root `types` usage and standardize. Ensure Prisma directory is only used for migrations if Supabase client is the runtime choice.
*   **Review State Management:** Assess if the current Context/Hook approach is sufficient or if a lightweight state library is needed for maintainability.
*   **Implement Error Reporting:** Integrate a service like Sentry for better production monitoring.
*   **Standardize Env Template:** Remove `.env.template` and use only `.env.example`.
