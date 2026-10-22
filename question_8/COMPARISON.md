# Session-Based Authentication vs. JWT

## 1. How each one keeps track of who you are

**Session-based (stateful).** After a successful login the server creates a random session ID and stores the user's details in its own memory (`sessions` in `session.js`). The browser only receives the ID, in a cookie. On every request the browser sends the cookie back, and the server looks the ID up to find out who is calling. The identity lives on the server.

**JWT (stateless).** After a successful login the server signs a token that contains the user's id, username, role and expiry time. The client stores the token and sends it in the `Authorization: Bearer` header. On every request the server only checks the signature and expiry (`auth.js`). It does not look anything up. The identity lives inside the token.

## 2. Flow in this project

| Step | Session | JWT |
|---|---|---|
| Login | `POST /session/login` returns a `Set-Cookie: sessionId=...` header | `POST /login` returns `{ "token": "..." }` |
| Protected route | `GET /session/profile` (cookie sent automatically) | `GET /jwt/profile` (Bearer header added by the client) |
| Logout | `POST /session/logout` deletes the session on the server and clears the cookie | No endpoint. The client throws the token away |

## 3. Side-by-side comparison

| | Session | JWT |
|---|---|---|
| Where the identity is stored | Server (memory, database or Redis) | Inside the token, held by the client |
| What the client holds | A meaningless random ID | A signed token with readable claims |
| Per-request work | Lookup in the session store | Signature check only |
| Scaling across servers | Needs a shared session store | Any server with the secret can verify |
| Revoking access | Immediate: delete the session | Hard: valid until it expires, unless a blocklist is added |
| Logout | Real, server-side | Client-side only |
| Role changes | Update the session and it applies at once | Old role stays in the token until it expires |
| Server memory | Grows with the number of logged-in users | None |
| Typical transport | Cookie (sent by the browser automatically) | Authorization header (added by code) |
| Main attack to defend against | CSRF (cookies are sent automatically) | XSS stealing a token from JavaScript-readable storage |

## 4. Token and session expiration

- **Session:** each session has an `expiresAt` time (`SESSION_TTL_MINUTES`, default 30). Expired sessions are deleted when the next request arrives, and the cookie has a matching `Max-Age`. The server can also end a session earlier whenever it wants.
- **JWT:** the `exp` claim is set by `JWT_EXPIRES_IN` (default 1 hour). Once issued, the server cannot shorten it. Short lifetimes limit the damage of a stolen token. Production systems often pair a short-lived access token with a refresh token.

## 5. Logout behavior

This is the biggest practical difference, and you can see it in the demo.

- **Session:** after `POST /session/logout`, the server has deleted the session. Even if someone copied the cookie earlier, `GET /session/profile` now returns `401`.
- **JWT:** logging out only means the client forgets the token. If someone copied it, `GET /jwt/profile` still returns `200` until the token expires. True JWT logout needs extra server state, such as a blocklist of revoked token IDs. At that point the system is no longer fully stateless.

## 6. Security implications

**Never store plain credentials.** Passwords are hashed with bcrypt on the server and are never returned by the API. Neither approach should keep the password in the client, in a cookie, or inside a token.

**Session cookies.** The cookie holds only a random 256-bit ID. It is set with:
- `HttpOnly`, so JavaScript cannot read it (protects against XSS theft).
- `SameSite=Strict`, so other sites cannot trigger authenticated requests (protects against CSRF).
- `Secure` in production, so it is only sent over HTTPS.

A new random ID is created at every login, which prevents session fixation.

**JWT storage.** A JWT is only signed, not encrypted, so anyone holding it can read the claims. Never put secrets in the payload. Where the client keeps it matters:
- `localStorage` or `sessionStorage`: easy, but any XSS bug can steal the token.
- `HttpOnly` cookie: safe from XSS, but then CSRF protections are needed again.

The secret is kept in `.env`, the signing algorithm is pinned to HS256, and tokens should be sent over HTTPS only.

**Both approaches need HTTPS.** Without it, cookies and tokens can be intercepted and replayed.

## 7. When to use which

- **Sessions** suit traditional web apps and anything that needs instant logout and revocation, such as admin panels or banking.
- **JWTs** suit APIs consumed by mobile apps or other services, and systems with many servers where a shared session store is a burden.

Neither is better in every case. The choice depends on how much the system values easy scaling versus easy revocation.

## 8. Limitations of this demo

- Sessions are stored in server memory, so they disappear when the server restarts. A real deployment would use Redis or a database.
- There is no CSRF token and no login rate limiting.
- JWT revocation is not implemented, on purpose, to show the difference.