# QUESTION 10: API HARDENING, DEBUGGING, AND ERROR HANDLING

## 1. Introduction

The objective of this task is to improve the reliability, security, and maintainability of the Node.js Users API.

The API uses Node.js HTTP modules, JSON file storage, JWT authentication, and bcrypt password hashing.

The following improvements were implemented:

- Centralized error handling for unexpected failures.
- Validation of request URLs, headers, parameters, and body data.
- Consistent JSON error responses.
- Protection of sensitive information in error responses and logs.
- Request logging for HTTP method, path, status code, and response time.
- Handling of malformed JSON and oversized request bodies.
- Handling of missing resources, unauthorized access, and unsupported HTTP methods.
- Testing of common API failure scenarios.

## 2. Technologies Used

- Node.js
- Native HTTP module
- JSON file storage
- JSON Web Tokens (JWT)
- bcryptjs
- dotenv
- Postman for API testing

## 3. Project Files

- `server.js` – Starts the HTTP server, logs requests, and handles unexpected errors.
- `routes.js` – Routes requests and handles unsupported methods and missing routes.
- `controller.js` – Implements user registration, login, retrieval, updating, and deletion.
- `auth.js` – Handles JWT authentication and role-based authorization.
- `passwords.js` – Hashes and verifies passwords using bcrypt.
- `fileOperations.js` – Reads and writes user records in the JSON file.
- `seeduser.js` – Creates initial administrator and user accounts.
- `users.json` – Stores user records, including password hashes.
- `.env` – Stores environment variables and secret configuration.
- `.env.example` – Provides a template for required environment variables.

## 4. Setup and Execution

### Prerequisites

Install Node.js and npm.

### Install dependencies

Open a terminal inside the `question_10` directory and run:

    npm install

### Configure environment variables

Configure the required variables in `.env`, including:

- `PORT`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `USER_USERNAME`
- `USER_PASSWORD`

Use strong passwords and a randomly generated JWT secret of at least 32 characters. Do not commit `.env` or disclose its values.

### Initialize users

If the project requires initial accounts, run:

    node seeduser.js

Run the seeding script only when appropriate for your existing user data.

### Start the server

    node server.js

The API runs at:

    http://localhost:3000

The port can be changed through the `PORT` environment variable.

## 5. API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Displays the API welcome page |
| POST | `/login` | Authenticates a user and returns a JWT |
| GET | `/users` | Retrieves all users; administrator access required |
| POST | `/users` | Creates a user; administrator access required |
| GET | `/users/:id` | Retrieves a user; administrator or account owner |
| PUT | `/users/:id` | Updates a user; administrator access required |
| DELETE | `/users/:id` | Deletes a user; administrator access required |

Protected endpoints require an appropriate JWT in the `Authorization` header:

    Authorization: Bearer YOUR_TOKEN

JSON request bodies must use:

    Content-Type: application/json

## 6. Error Handling and Validation

The API handles common errors using consistent JSON responses.

| HTTP Status | Meaning |
|---|---|
| 400 | Invalid request, malformed JSON, or invalid input |
| 401 | Missing, invalid, or expired authentication token; or invalid login credentials |
| 403 | Authenticated user does not have the required permission |
| 404 | Requested resource or route does not exist |
| 405 | HTTP method is not supported for the route |
| 409 | Username already exists |
| 413 | Request body is too large |
| 414 | Request URL is too long |
| 415 | Unsupported content type |
| 500 | Unexpected internal server error |

Request validation checks URL length, user IDs, JSON content type, required fields, username length, password length, and permitted role values.

Request bodies are limited to 100 KB.

## 7. Request Logging

The server logs the following information for completed requests:

- HTTP method
- Request path
- Response status code
- Response time in milliseconds

Passwords, authentication tokens, and request bodies are excluded from the request logs.

Unexpected errors are logged without exposing stack traces or sensitive request information to clients.

## 8. Security Improvements

The following security measures are included:

1. Passwords are hashed using bcrypt rather than stored as plaintext.
2. JWTs are verified using the configured secret and the HS256 algorithm.
3. Protected endpoints enforce authentication and role-based authorization.
4. API responses do not include stored password hashes.
5. Unexpected server failures return generic error messages.
6. Authentication errors do not reveal passwords or tokens.
7. JSON request bodies are size-limited and validated.
8. Sensitive environment configuration is kept outside source code.

## 9. Testing and Debugging

The following scenarios should be tested using Postman.

| Test Scenario | Expected Result |
|---|---|
| Access `/` using GET | 200 OK |
| Submit malformed JSON to `/login` | 400 Bad Request |
| Submit an incorrect Content-Type | 415 Unsupported Media Type |
| Submit invalid login credentials | 401 Unauthorized |
| Access `/users` without a token | 401 Unauthorized |
| Access `/users` using a normal user's token | 403 Forbidden |
| Request a nonexistent user using an administrator token | 404 Not Found |
| Send PATCH to `/users` | 405 Method Not Allowed |
| Submit a request body larger than 100 KB | 413 Payload Too Large |
| Trigger an unexpected file operation failure | 500 Internal Server Error |

Record the actual response status and result for every test. A test should be marked as passed only after the behaviour has been verified.

## 10. Issues Identified and Resolutions

### Issue 1: Inconsistent error responses

**Resolution:** Introduced shared error-response helpers and server-level error handling to provide consistent JSON responses.

### Issue 2: Invalid request data

**Resolution:** Added checks for request content type, JSON format, URL length, user IDs, usernames, passwords, and roles.

### Issue 3: Sensitive information exposure

**Resolution:** Excluded password hashes from user responses and avoided logging request bodies, tokens, and stack traces.

### Issue 4: Missing request monitoring

**Resolution:** Added logging for request method, path, response status, and response time.

### Issue 5: Malformed and oversized requests

**Resolution:** Added handling for malformed JSON, request bodies exceeding 100 KB, and malformed HTTP requests.

### Issue 6: Unauthorized access

**Resolution:** Used JWT authentication and role-based authorization to protect user management endpoints.

### Issue 7: Missing resources and unsupported methods

**Resolution:** Added 404 responses for missing routes or users and 405 responses with an `Allow` header for unsupported HTTP methods.

### Issue 8: Unexpected server failures

**Resolution:** Added error handling that returns a generic 500 response without disclosing internal details.

## 11. Conclusion

The API hardening task improves the reliability, security, and maintainability of the Node.js Users API.

Request validation prevents invalid input from being processed, authentication and authorization protect restricted endpoints, and consistent error handling improves debugging. Request logging provides useful operational information while avoiding the exposure of sensitive data.

Testing common failure scenarios helps verify that the API responds appropriately to malformed requests, missing resources, unauthorized access, unsupported HTTP methods, and unexpected internal failures.

The implementation provides a foundation for further improvements, including automated integration tests, rate limiting, structured monitoring, and more robust persistent storage.

**Note:** Testing results must reflect the actual results obtained when running the application and its test cases.