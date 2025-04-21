import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import dotenv from 'dotenv'
// import { server } from "./msw-server"; // Commented out - file not found
import { vi } from "vitest";

// Load environment variables for testing
dotenv.config({ path: '.env.test' })

// Increase test timeout for network requests
beforeAll(() => {
  vi.setConfig({
    testTimeout: 15000 // 15 seconds to account for network latency
  })
})

// Establish API mocking before all tests.
// beforeAll(() => server.listen()); // Commented out - MSW server setup

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
// afterEach(() => server.resetHandlers()); // Commented out - MSW server setup

// Clean up after the tests are finished.
// afterAll(() => server.close()); // Commented out - MSW server setup

// Mock next/headers cookies function for Vitest environment
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => {
    // Simulate a simple cookie store
    const store = new Map<string, string>();
    // Add a mock Supabase auth token cookie (adjust name if needed)
    // This structure mimics a JWT payload with a user ID
    const mockAuthToken = JSON.stringify({ sub: "test-user-id", email: "test@example.com", /* other metadata */ });
    store.set("sb-mock-auth-token", mockAuthToken); // Use a plausible name

    return {
      get: vi.fn((name: string) => {
        const value = store.get(name);
        return value ? { name, value } : undefined;
      }),
      set: vi.fn((name: string, value: string) => {
        store.set(name, value);
      }),
      delete: vi.fn((name: string) => {
        store.delete(name);
      }),
      getAll: vi.fn(() => {
        return Array.from(store.entries()).map(([name, value]) => ({ name, value }));
      }),
      has: vi.fn((name: string) => {
        return store.has(name);
      })
      // Add other methods like set, delete if your code uses them
    };
  }),
})); 