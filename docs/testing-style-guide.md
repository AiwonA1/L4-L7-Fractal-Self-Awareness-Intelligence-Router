# Testing Style Guide

This guide outlines conventions and strategies for testing the FractiVerse application, using Vitest and React Testing Library.

## 1. Testing Framework: Vitest

- **Configuration:** Configure Vitest via `vitest.config.ts`. Set up the testing environment (e.g., `jsdom`).
- **File Location:** Place test files alongside the code they are testing, using the `.test.ts` or `.test.tsx` suffix (e.g., `utils.ts` -> `utils.test.ts`, `MyComponent.tsx` -> `MyComponent.test.tsx`). Alternatively, use the `__tests__` directory structure if preferred.
- **Running Tests:** Use npm scripts defined in `package.json` (e.g., `npm test`, `npm run test:watch`, `npm run test:coverage`).

## 2. Test Structure

- **`describe` Blocks:** Group related tests using `describe` blocks.
- **`it` or `test` Blocks:** Define individual test cases using `it` or `test`. Use descriptive names that clearly state what the test is verifying (e.g., `it('should return the correct balance when user exists')`).
- **Arrange-Act-Assert (AAA):** Structure tests following the AAA pattern:
    - **Arrange:** Set up preconditions, mock data, and dependencies.
    - **Act:** Execute the code being tested.
    - **Assert:** Verify the outcome using assertions.

```typescript
import { describe, it, expect, vi } from 'vitest'
import { calculateTotal } from '../src/lib/utils' // Example utility

describe('calculateTotal', () => {
  it('should return the sum of numbers in an array', () => {
    // Arrange
    const numbers = [1, 2, 3];
    const expectedTotal = 6;

    // Act
    const actualTotal = calculateTotal(numbers);

    // Assert
    expect(actualTotal).toBe(expectedTotal);
  });

  it('should return 0 for an empty array', () => {
    // Arrange
    const numbers: number[] = [];

    // Act
    const total = calculateTotal(numbers);

    // Assert
    expect(total).toBe(0);
  });
});
```

## 3. Unit Testing

- **Focus:** Test individual functions, components, or modules in isolation.
- **Utilities/Helpers:** Test utility functions (`src/app/lib`) with various inputs, including edge cases and invalid inputs.
- **Components:**
    - Use `@testing-library/react` for rendering components.
    - Test component rendering based on different props.
    - Test user interactions (clicks, input changes) using `fireEvent` or `@testing-library/user-event`.
    - Assert on the rendered output (DOM structure, text content) using Testing Library queries (e.g., `getByRole`, `getByText`, `findByTestId`). Avoid testing implementation details.
    - Mock child components or dependencies if needed to isolate the component under test.
- **API Routes/Server Logic:** Unit test helper functions used by API routes. Integration tests are often more valuable for the routes themselves.

## 4. Integration Testing

- **Focus:** Test the interaction between multiple units or modules.
- **Component Interactions:** Test flows involving multiple components (e.g., form submission triggering state updates and UI changes).
- **API Route Interaction:** Test frontend components interacting with mocked API endpoints (see Mocking section).
- **Database Interaction:** Test functions that interact with the database, potentially using a test database or mocking the database client.

## 5. Mocking

- **Vitest Mocks:** Use Vitest's built-in mocking capabilities (`vi.fn()`, `vi.mock()`, `vi.spyOn()`) to mock functions, modules, or dependencies.
- **API Calls:** Mock `fetch` requests or specific API client functions (e.g., Supabase client methods, OpenAI client methods) to simulate API responses without making actual network calls.
    - Consider using Mock Service Worker (MSW) if more complex API mocking across multiple tests is required (check dev dependencies if installed).
- **External Services:** Mock interactions with external services like Supabase Auth, Stripe, etc.

```typescript
// Example mocking a fetch call
import { describe, it, expect, vi, beforeEach } from 'vitest'

global.fetch = vi.fn()

describe('fetchData', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockClear()
  })

  it('should fetch data successfully', async () => {
    // Arrange
    const mockData = { message: 'Success' };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    // Act
    const result = await fetchData('/api/data'); // Assume fetchData uses global.fetch

    // Assert
    expect(fetch).toHaveBeenCalledWith('/api/data');
    expect(result).toEqual(mockData);
  });
});
```

## 6. Assertions

- **Vitest `expect`:** Use the `expect` function provided by Vitest with its various matchers (`toBe`, `toEqual`, `toHaveBeenCalledWith`, `toThrow`, etc.).
- **Testing Library Matchers:** Use `@testing-library/jest-dom` matchers for more expressive DOM assertions (e.g., `toBeInTheDocument`, `toHaveTextContent`, `toBeVisible`).
- **Clarity:** Write clear and specific assertions that directly test the expected outcome.

## 7. Coverage

- **Goal:** Aim for reasonable test coverage, but focus on testing critical paths, complex logic, and potential edge cases rather than just achieving a high percentage.
- **Reporting:** Use `vitest run --coverage` to generate coverage reports.
- **Review:** Regularly review coverage reports to identify untested areas.

## 8. Best Practices

- **Independence:** Tests should be independent and runnable in any order.
- **Speed:** Write fast tests. Avoid unnecessary delays or complex setups.
- **Readability:** Write clear, concise, and readable tests.
- **Maintainability:** Write tests that are easy to update as the codebase evolves.
- **Test Behavior, Not Implementation:** Focus on testing the observable behavior of a component or function from the user's or caller's perspective, not its internal implementation details. 