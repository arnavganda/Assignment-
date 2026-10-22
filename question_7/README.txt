# Question 7 — Session-Based Authentication vs. JWT
 
## Overview
 
This project demonstrates the differences between **session-based authentication** and **JWT (JSON Web Token) authentication** using Node.js and Express. It implements a session-based login flow (login, protected route, logout) and includes a written comparison of both approaches in `COMPARISON.md`.
 
## How Each Approach Maintains Identity
 
### Session-based (stateful)
 
1. The user logs in with a username and password.
2. The server verifies the credentials against the stored (hashed) password.
3. The server creates a **session record** on the server and sends the client a **session ID** in a cookie.
4. On every later request the browser sends the cookie automatically, and the server looks up the session ID to identify the user.
 
The cookie holds only a random ID. The user's data stays on the server.
 
### JWT (stateless)
 
1. The user logs in with a username and password.
2. The server verifies the credentials and creates a **signed token** containing claims (user id, expiry).
3. The client stores the token and sends it with each request, usually as `Authorization: Bearer <token>`.
4. The server verifies the token's **signature and expiry**. No server-side lookup is needed.
 
The token itself carries the user's identity.
 
## Project Structure
 
```
question_7/
├── server.js          # Express app entry point
├── routes.js          # Route definitions (login, protected route, logout)
├── controller.js      # Request handlers for the routes
├── session.js         # Session configuration
├── auth.js            # Authentication middleware / token logic
├── passwords.js       # Password hashing and verification
├── fileOperations.js  # Reads and writes users.json
├── seeduser.js        # Script that creates sample users
├── users.json         # User data store
├── .env               # Secrets (not committed)
├── .env.example       # Template for required environment variables
├── .gitignore         # Excludes node_modules and .env
├── COMPARISON.md      # Detailed session vs JWT comparison
├── package.json
└── README.txt
```
 
## Setup and Running
 
```bash
cd question_7
npm install
cp .env.example .env     # then fill in your own secret values
node seeduser.js         # create sample users
node server.js
```
 
The server runs on the port set in `.env` (or the default in `server.js`).
 
## API Endpoints (Session-Based Flow)
 
| Method | Endpoint     | Description                                  | Auth required |
|--------|--------------|----------------------------------------------|---------------|
| POST   | `/login`     | Verifies credentials and creates a session   | No            |
| GET    | `/profile`   | Protected route, returns the logged-in user  | Yes           |
| POST   | `/logout`    | Destroys the session and clears the cookie   | Yes           |
 
> Update the paths above if your `routes.js` uses different ones.
 
## Demonstration
 
Use `-c` / `-b` with curl so the session cookie is saved and re-sent. Replace the port and credentials with your own.
 
**1. Access the protected route before login (expect 401)**
 
```bash
curl -i http://localhost:3000/profile
```
 
**2. Login (session created, cookie saved)**
 
```bash
curl -i -c cookies.txt -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password123"}'
```
 
**3. Access the protected route after login (expect 200)**
 
```bash
curl -i -b cookies.txt http://localhost:3000/profile
```
 
**4. Logout (session destroyed)**
 
```bash
curl -i -b cookies.txt -X POST http://localhost:3000/logout
```
 
**5. Access the protected route again (expect 401)**
 
```bash
curl -i -b cookies.txt http://localhost:3000/profile
```
 
Step 5 shows that once the server deletes the session, the old cookie is useless immediately.
 
## Comparison: Sessions vs. JWT
 
| Aspect               | Session-based                                   | JWT                                               |
|----------------------|-------------------------------------------------|---------------------------------------------------|
| State                | Stateful, server stores session data            | Stateless, token carries the data                 |
| What client holds    | Random session ID (cookie)                      | Signed token containing claims                    |
| Verification         | Look up session ID in store                     | Verify signature and expiry                       |
| Scalability          | Needs a shared store across servers             | Scales easily, no shared store needed             |
| Logout / revocation  | Immediate: delete the session                   | Hard: token stays valid until it expires          |
| Size per request     | Tiny (just an ID)                               | Larger (payload sent every time)                  |
| Best suited for      | Traditional web apps                            | APIs, microservices, mobile apps                  |
 
See `COMPARISON.md` for the full write-up.
 
## Token Expiration
 
- **Sessions:** expiry is controlled by the server through the cookie `maxAge` and the session store lifetime.
- **JWT:** expiry is set in the `exp` claim and cannot be changed once the token is issued. Common practice is a short-lived access token plus a revocable refresh token.
 
## Logout Behavior
 
- **Sessions:** logout destroys the session on the server and clears the cookie, so it takes effect immediately.
- **JWT:** the server never stored the token, so logout normally just means the client discards it. The token stays valid until `exp` unless the server keeps a denylist of revoked tokens, which adds back some state.
 
## Security Implications
 
- **Passwords:** never store plaintext passwords. They are hashed (see `passwords.js`) before being saved in `users.json`.
- **Secrets:** the session secret and JWT secret live in `.env`, which is excluded from git by `.gitignore`. `.env.example` documents which variables are needed.
- **Cookie flags:** session cookies should use `HttpOnly` (blocks JavaScript access), `Secure` (HTTPS only) and `SameSite` (reduces CSRF risk).
- **Token storage:** a JWT kept in `localStorage` can be stolen by any injected script (XSS). An `HttpOnly` cookie is safer, but then CSRF protection is needed.
- **Token payload:** a JWT payload is only base64-encoded, not encrypted, so it must never contain passwords or other secrets.
- **Stolen credentials:** a stolen session cookie works until the session is destroyed or expires. A stolen JWT works until it expires, and cannot be revoked by default.
- **General:** use HTTPS in production, rate-limit login attempts, and rotate secrets.
 
## Conclusion
 
Sessions are simple and easy to revoke, but they need server-side storage. JWTs are stateless and scale well, but are harder to revoke and must be stored carefully on the client. Sessions suit traditional server-rendered apps, JWTs suit distributed APIs and mobile clients, and many real systems combine short-lived JWTs with revocable refresh tokens.