# Backend Style Guide

This guide defines conventions for developing the backend logic within Next.js API Routes for the FractiVerse project.

## 1. API Routes (Route Handlers)

- **Location:** Place all API routes within `src/app/api/`.
- **Structure:** Organize routes logically using nested directories (e.g., `src/app/api/auth/login/route.ts`, `src/app/api/stripe/webhooks/route.ts`).
- **Naming:** The route file itself should always be named `route.ts`.
- **HTTP Methods:** Use exported functions named after HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, etc.) to handle requests.
```typescript
// src/app/api/items/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Handle GET request
  return NextResponse.json({ message: 'GET items' })
}

export async function POST(request: Request) {
  // Handle POST request
  const body = await request.json()
  return NextResponse.json({ message: 'Created item', data: body })
}
```
- **Request & Response:** Use the standard `Request` object for incoming requests and `NextResponse` from `next/server` for responses.
- **Dynamic Routes:** Use square brackets for dynamic segments (e.g., `src/app/api/users/[userId]/route.ts`). Access parameters via the second argument to the handler function.
```typescript
// src/app/api/users/[userId]/route.ts
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const userId = params.userId
  // ... get user data
  return NextResponse.json({ userId, name: 'Example User' })
}
```

## 2. Security

- **Authentication:** Protect sensitive routes by verifying user authentication. Use Supabase server-side helpers (`createRouteHandlerClient`) to get the authenticated user session from cookies.
```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Proceed with authenticated logic
  return NextResponse.json({ userId: session.user.id })
}
```
- **Authorization:** Implement authorization checks where necessary (e.g., check user roles or ownership) after authentication.
- **API Keys:** NEVER expose secret API keys (OpenAI, Stripe Secret Key, Supabase Service Role Key) in client-side code. Access them only within API routes or Server Components via environment variables (`process.env.MY_API_KEY`).
- **Input Validation:** Validate and sanitize all incoming data (request bodies, query parameters, route parameters) before processing. Use libraries like Zod for robust validation.
- **Rate Limiting:** Implement rate limiting on sensitive or resource-intensive endpoints to prevent abuse.

## 3. Supabase Server-Side Usage

- **Route Handlers:** Use `createRouteHandlerClient` from `@supabase/auth-helpers-nextjs` to create a Supabase client instance within API routes. This properly handles session cookies.
- **Service Role Key:** For operations requiring elevated privileges (bypassing RLS, administrative tasks), use `createClient` from `@supabase/supabase-js` with the `SUPABASE_SERVICE_ROLE_KEY` environment variable. Use this key sparingly and only when absolutely necessary.
- **Database Operations:** Perform database reads/writes using the Supabase client instance.
- **RLS:** Rely primarily on Row Level Security (RLS) policies defined in the database for data access control. Server-side logic should generally operate within the authenticated user's permissions unless using the Service Role Key for specific reasons.

## 4. External API Integrations (OpenAI, Stripe)

- **OpenAI:** Initialize the OpenAI client within the relevant API route (e.g., `/api/chat`) using the `OPENAI_API_KEY` environment variable. Handle requests, format responses, and potentially deduct tokens.
- **Stripe:** Initialize the Stripe client using the `STRIPE_SECRET_KEY`. Handle payment intent creation, checkout session creation, and webhook validation/processing.
- **Webhook Security:** Securely validate Stripe webhook signatures using the `STRIPE_WEBHOOK_SECRET` to ensure requests originate from Stripe.

## 5. Error Handling

- **Status Codes:** Return appropriate HTTP status codes (e.g., 400 for bad requests, 401 for unauthorized, 403 for forbidden, 404 for not found, 500 for server errors).
- **Error Responses:** Return consistent JSON error responses, ideally including an error code or message.
```typescript
return NextResponse.json({ error: 'Invalid input provided' }, { status: 400 })
```
- **Logging:** Log errors with sufficient detail (timestamp, route, error message, stack trace, request details if relevant) to aid debugging. Use a dedicated logging service or Vercel logs.

## 6. Code Structure & Logic

- **Simplicity:** Keep API routes focused on their specific task. Avoid overly complex logic within a single route.
- **Helper Functions:** Extract reusable logic (e.g., database access patterns, specific API call logic) into helper functions, potentially located in `src/app/lib/` or a dedicated `src/app/api/lib/`.
- **Environment Variables:** Access all sensitive keys and configuration values through `process.env`. 