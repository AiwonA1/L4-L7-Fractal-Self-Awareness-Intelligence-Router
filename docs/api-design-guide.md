# API Design Guide

This guide outlines principles for designing the internal RESTful API endpoints within the FractiVerse Next.js application (located under `src/app/api/`).

## 1. RESTful Principles

- **Resource-Based:** Structure APIs around logical resources (e.g., `users`, `chats`, `tokens`, `transactions`).
- **Use HTTP Methods:** Use HTTP methods appropriately:
    - `GET`: Retrieve resources.
    - `POST`: Create new resources.
    - `PUT`: Update/replace an existing resource entirely.
    - `PATCH`: Partially update an existing resource.
    - `DELETE`: Remove a resource.
- **Statelessness:** Each request from a client should contain all the information needed to understand and process the request. Server-side state (like session info) should be handled via mechanisms like secure cookies (as managed by Supabase Auth helpers).
- **Use Nouns for URLs:** Resource URLs should use nouns, not verbs (e.g., `/api/users`, not `/api/getUsers`).
- **Plural Nouns:** Prefer plural nouns for resource collections (e.g., `/api/chats` instead of `/api/chat`).

## 2. URL Structure

- **Base Path:** All API routes are located under `/api/`.
- **Resource Naming:** Use clear, descriptive, plural nouns (e.g., `/api/transactions`).
- **Hierarchy:** Use path nesting to indicate relationships (e.g., `/api/users/{userId}/profile`, `/api/chats/{chatId}/messages`).
- **Identifiers:** Use path parameters for specific resource identifiers (e.g., `/api/chats/{chatId}`).
- **Filtering/Sorting/Pagination:** Use query parameters for optional actions like filtering, sorting, or pagination (e.g., `/api/transactions?status=completed&sortBy=createdAt&limit=10`).

## 3. Request Format

- **Content-Type:** Expect `application/json` for request bodies (e.g., for `POST`, `PUT`, `PATCH`). Validate the `Content-Type` header.
- **Authentication:** Authenticate requests using session cookies managed by Supabase Auth helpers. Protected routes should check for a valid session.
- **Data Validation:** Rigorously validate incoming request bodies and parameters using a library like Zod.

## 4. Response Format

- **Content-Type:** Respond with `application/json`.
- **Success Responses:**
    - `GET`: Return the resource(s) in the response body. Status code `200 OK`.
    - `POST`: Return the newly created resource in the body, potentially with a `Location` header pointing to the new resource URL. Status code `201 Created`.
    - `PUT`/`PATCH`: Return the updated resource or just status `200 OK` or `204 No Content`.
    - `DELETE`: Return status `200 OK` or `204 No Content`.
- **Data Structure:** Use a consistent JSON structure. For collections, consider nesting results under a key like `data`: `{ "data": [...] }`.

## 5. Status Codes

Use standard HTTP status codes correctly:

- **2xx Success:**
    - `200 OK`: General success.
    - `201 Created`: Resource created successfully.
    - `204 No Content`: Success, but no content to return (e.g., after `DELETE`).
- **4xx Client Errors:**
    - `400 Bad Request`: Invalid input, validation failed.
    - `401 Unauthorized`: Authentication required or failed.
    - `403 Forbidden`: Authenticated user does not have permission.
    - `404 Not Found`: Resource does not exist.
    - `409 Conflict`: Conflict with the current state of the resource (e.g., duplicate email).
- **5xx Server Errors:**
    - `500 Internal Server Error`: Generic server-side error.
    - `503 Service Unavailable`: Temporary server issue.

## 6. Error Handling

- **Consistent Format:** Return error details in a consistent JSON format:
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Email address is required.",
    "details": { // Optional: More specific field errors
      "email": "Email cannot be empty."
    }
  }
}
```
- **Don't Leak Sensitive Info:** Avoid sending detailed internal error information or stack traces to the client in production.
- **Logging:** Log server-side errors with sufficient detail for debugging (see Backend Style Guide).

## 7. Versioning

- **(Optional) URL Path:** If needed, include a version number in the URL path (e.g., `/api/v1/users`). For internal APIs like this, versioning might be overkill initially unless significant breaking changes are anticipated.

## Example Endpoint Design

**Resource:** Chat History (`chats`)

- **`GET /api/chats`**: Retrieve a list of chat history titles for the authenticated user.
- **`POST /api/chats`**: Create a new chat session. Requires `title` and initial `messages` in the request body.
- **`GET /api/chats/{chatId}`**: Retrieve the full message history for a specific chat.
- **`PUT /api/chats/{chatId}`**: Update chat properties (e.g., title). (Could also be `PATCH`).
- **`DELETE /api/chats/{chatId}`**: Delete a chat session.
- **`POST /api/chats/{chatId}/messages`**: Add a new message to an existing chat. 