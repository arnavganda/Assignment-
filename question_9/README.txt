# Question 9 — Nginx Configuration and Reverse Proxy

## Overview

This project configures **Nginx** to do two jobs in front of a Node.js application:

1. **Serve static files** (HTML and CSS) directly from the `public/` directory.
2. **Act as a reverse proxy**, forwarding API requests to a Node.js server that runs on a separate port.

The Node.js server uses only the built-in `http` module (no Express).

## How It Works

```text
                         +--> /            --> Nginx serves public/index.html
Browser / curl --> Nginx |--> /style.css   --> Nginx serves public/style.css
   (port 8080)           +--> /users, /api --> forwarded to Node.js (port 3000)
```

- The client only talks to Nginx.
- Static requests are answered by Nginx itself and never reach Node.js.
- API requests are passed on to Node.js, and Nginx sends the response back to the client.

## Project Structure

```text
question_9/
├── nginx.conf         # Nginx configuration (static files + reverse proxy)
├── server.js          # Node.js API server (runs on its own port)
├── public/
│   ├── index.html     # Static page served by Nginx
│   └── style.css      # Static stylesheet served by Nginx
├── logs/
│   ├── access.log     # Nginx access log
│   └── error.log      # Nginx error log
└── README.txt
```

## Requirements

- Node.js 18 or newer (`node -v`)
- Nginx (`nginx -v`). On macOS: `brew install nginx`

## Configuration Summary

The important parts of `nginx.conf`:

| Setting | Purpose |
|---|---|
| `listen 8080;` | The port Nginx accepts requests on |
| `root` / `location /` | Serves files from the `public/` directory |
| `location /users` (API path) | Matches API requests |
| `proxy_pass http://127.0.0.1:3000;` | Forwards matching requests to Node.js |
| `proxy_set_header Host $host;` | Passes the original host name to Node.js |
| `proxy_set_header X-Real-IP $remote_addr;` | Passes the client's IP address |
| `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;` | Passes the chain of client and proxy IPs |
| `proxy_set_header X-Forwarded-Proto $scheme;` | Passes the original protocol (http or https) |
| `access_log` / `error_log` | Write to `logs/access.log` and `logs/error.log` |

> Open `nginx.conf` and check that the ports, paths and location names above match your file.

## Setup and Running

### 1. Start the Node.js server (separate port)

```bash
cd question_9
node server.js
```

The Node.js server listens on port **3000**. It prints a log line (method, path, status code, response time) for every request it receives.

### 2. Check the Nginx configuration

```bash
nginx -t -c /full/path/to/question_9/nginx.conf
```

Replace the path with the real location of the file, for example `/Users/arnavganda/Desktop/assignment/question_9/nginx.conf`. You should see `syntax is ok` and `test is successful`.

### 3. Start Nginx with this configuration

```bash
nginx -c /full/path/to/question_9/nginx.conf
```

Nginx now listens on port **8080**.

### 4. Reload or stop Nginx

```bash
nginx -s reload     # apply config changes
nginx -s stop       # stop Nginx
```

## Verifying That It Works

### Static requests (answered by Nginx)

```bash
curl -i http://localhost:8080/
curl -i http://localhost:8080/style.css
```

Expected: `200 OK` with the HTML and CSS content, `Content-Type: text/html` and `text/css`. **Nothing appears in the Node.js terminal**, because Nginx served these files itself.

You can also open `http://localhost:8080/` in a browser.

### API requests (forwarded to Node.js)

```bash
curl -i http://localhost:8080/users
```

Expected: the JSON response from your Node.js server. **A log line appears in the Node.js terminal**, which proves the request was proxied.

### Compare with going straight to Node.js

```bash
curl -i http://localhost:3000/users
```

The response should match the one that came through Nginx on port 8080.

### Unknown paths

```bash
curl -i http://localhost:8080/does-not-exist
```

Expected: a 404 response (from Nginx for static paths, or from Node.js for API paths).

### Check the logs

```bash
tail logs/access.log
tail logs/error.log
```

`access.log` shows every request Nginx received, and `error.log` shows any proxy or file errors.

## Expected Results

| Request | Handled by | Expected |
|---|---|---|
| `GET /` on port 8080 | Nginx | 200, HTML page |
| `GET /style.css` on port 8080 | Nginx | 200, CSS file |
| `GET /users` on port 8080 | Node.js through Nginx | 200, JSON |
| `POST /users` on port 8080 | Node.js through Nginx | Response from Node.js (201 or 400) |
| `GET /users` on port 3000 | Node.js directly | Same JSON as through Nginx |
| `GET /does-not-exist` | Nginx or Node.js | 404 |

## What Is a Reverse Proxy?

A reverse proxy is a server that sits **in front of** one or more backend servers. Clients send their requests to the proxy, and the proxy decides where each request goes, forwards it, and returns the backend's response to the client. The client never talks to the backend directly.

Common reasons to use one:

- **Single entry point:** one public port for static files and APIs.
- **Security:** the Node.js server is not exposed directly and can be limited to localhost.
- **Performance:** Nginx is very fast at serving files and can cache, compress and handle many connections.
- **Load balancing:** requests can be spread across several Node.js instances.
- **HTTPS:** Nginx can handle TLS so Node.js does not have to.
- **Central logging and limits:** access logs, rate limits and request size limits in one place.

## Reverse Proxy vs. Serving Static Files Directly

| Aspect | Serving static files | Reverse proxying |
|---|---|---|
| What Nginx does | Reads a file from disk and sends it | Passes the request to another server and returns that server's response |
| Who creates the response | Nginx | The Node.js application |
| Content | Fixed files (HTML, CSS, images, JS) | Dynamic data (JSON from an API, database results) |
| Node.js involved? | No | Yes |
| Speed | Very fast, no application code runs | Depends on the backend |
| Config directives | `root`, `try_files` | `proxy_pass`, `proxy_set_header` |

In short: serving static files means Nginx **is** the server for those files. A reverse proxy means Nginx is a **middleman** between the client and the real application server.

## Why the Headers Are Forwarded

When Nginx proxies a request, Node.js sees the connection coming from Nginx (`127.0.0.1`), not from the real client. The forwarded headers restore that information:

- `Host`: the host name the client originally asked for.
- `X-Real-IP` and `X-Forwarded-For`: the real client IP address, useful for logging and rate limiting.
- `X-Forwarded-Proto`: whether the client used `http` or `https`.

## Troubleshooting

| Problem | Fix |
|---|---|
| `502 Bad Gateway` | The Node.js server is not running or is on a different port. Start `node server.js` and check the `proxy_pass` port. |
| `address already in use` | Another process uses the port. Stop it, or change `listen` in `nginx.conf` or the port in `server.js`. |
| `404` for `/` or `/style.css` | The `root` path in `nginx.conf` is wrong. Use the full path to the `public/` folder. |
| `nginx: command not found` | Install Nginx (`brew install nginx` on macOS). |
| Permission denied for logs | Make sure the `logs/` folder exists and is writable, and use full paths in `access_log` and `error_log`. |
| Config changes not applied | Run `nginx -t -c <path>` to check, then `nginx -s reload`. |

## Notes

- The `logs/` folder holds generated files. It is a good idea to add `logs/` to `.gitignore` so it is not committed.
- Nginx runs on port 8080 and Node.js on port 3000 here. Change them if those ports are busy.