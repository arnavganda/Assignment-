# Question 6 – Authentication and Role-Based Authorization

A protected Users API built with Node.js's built-in `http` module (no Express). It uses JWT authentication and role-based access control with two roles: `admin` and `user`.

## Features

- Login endpoint that verifies credentials against bcrypt-hashed passwords.
- JWTs generated and verified with the `jsonwebtoken` library (HS256, 1 hour expiry by default).
- Protected endpoints that require a valid Bearer token.
- Role-based access control for `admin` and `user`.
- Clear `401` responses for missing, invalid and expired tokens, and `403` for insufficient permissions.
- Secrets kept in a `.env` file, which is never committed.
- Passwords are never returned in any response.

## Project Structure

```text
question_6/
├── server.js          # Starts the HTTP server
├── routes.js          # Routing
├── controller.js      # Request handlers
├── auth.js            # JWT creation, verification and role checks
├── passwords.js       # bcrypt hash and compare
├── fileOperations.js  # Reads and writes users.json
├── seeduser.js        # Creates the admin and normal user from .env
├── users.json         # User storage (starts empty)
├── package.json
├── .env.example       # Template for environment variables
└── .gitignore
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your `.env` file from the template:

   ```bash
   cp .env.example .env
   ```

3. Generate a strong secret and set it as `JWT_SECRET` in `.env` (it must be at least 32 characters):

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

4. Create the admin and normal user accounts:

   ```bash
   npm run seed
   ```

5. Start the server:

   ```bash
   npm start
   ```

   The server runs at `http://localhost:3000`.

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default `3000`) |
| `JWT_SECRET` | Secret used to sign tokens (32+ characters, required) |
| `JWT_EXPIRES_IN` | Token lifetime, for example `1h` or `5s` (default `1h`) |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Admin account created by the seed script |
| `USER_USERNAME` / `USER_PASSWORD` | Normal user account created by the seed script |

Passwords must be at least 12 characters.

## API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Welcome message |
| POST | `/login` | Public | Returns a JWT for valid credentials |
| GET | `/users` | Admin only | List all users |
| GET | `/users/:id` | Admin, or the user themselves | Get one user |
| POST | `/users` | Admin only | Create a user |
| PUT | `/users/:id` | Admin only | Update a user |
| DELETE | `/users/:id` | Admin only | Delete a user |

Protected requests must include this header:

```text
Authorization: Bearer <token>
```

## Example Requests

Log in:

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<ADMIN_PASSWORD>"}'
```

Response:

```json
{
  "token": "eyJhbGciOi..."
}
```

List users as admin:

```bash
curl http://localhost:3000/users -H "Authorization: Bearer <ADMIN_TOKEN>"
```

Create a user as admin:

```bash
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","password":"VeryLongPass123!","role":"user"}'
```

## Response Codes

| Status | Meaning |
|---|---|
| 200 | Success |
| 201 | User created |
| 204 | User deleted |
| 400 | Invalid input or invalid JSON |
| 401 | Missing, invalid or expired token, or wrong login credentials |
| 403 | Valid token, but the role is not allowed |
| 404 | User or route not found |
| 405 | Method not allowed on `/users/:id` |
| 409 | Username already exists |
| 415 | Content-Type must be `application/json` |

## Testing

| Test | Expected |
|---|---|
| `POST /login` with valid credentials | 200 and a token |
| `POST /login` with a wrong password | 401 |
| `GET /users` with no token | 401 |
| `GET /users` with an invalid token | 401 |
| `GET /users` with an expired token | 401 "Token has expired" |
| `GET /users` as a normal user | 403 |
| `GET /users` as admin | 200 |
| `GET /users/:id` as a user, for their own id | 200 |
| `GET /users/:id` as a user, for another id | 403 |
| `POST`, `PUT` or `DELETE /users` as admin | 201, 200, 204 |
| `POST`, `PUT` or `DELETE /users` as a normal user | 403 |

To test an expired token, set `JWT_EXPIRES_IN=5s` in `.env`, restart the server, log in, wait 6 seconds, then call a protected endpoint.

## Security Notes

- Passwords are hashed with bcrypt and never returned by the API.
- The JWT algorithm is pinned to HS256 when signing and verifying.
- `JWT_SECRET` is validated at runtime and the server refuses weak or placeholder values.
- `.env` is excluded from git through `.gitignore`.

## Known Limitations

- A token stays valid until it expires, even if the user is deleted or their role is changed.
- There is no rate limiting on `/login`.
- Users are stored in a JSON file, so simultaneous writes could overwrite each other. A database would fix this in a production system.