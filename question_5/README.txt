# Question 3 – Node.js HTTP Server

## Overview

This project demonstrates how to create a basic HTTP server using Node.js's built-in `http` module without using Express.

The application handles HTTP requests through a separate routing file and controller functions.

## Project Structure

```text
question_3/
├── server.js
├── routes.js
├── controller.js
├── package.json
└── README.md
```

## Features

- Creates an HTTP server using Node.js's built-in `http` module.
- Handles different routes based on the request URL and HTTP method.
- Returns user data in JSON format.
- Provides a health-check endpoint.
- Handles unknown routes with a 404 Not Found response.
- Separates routing logic from controller functions.

## Available Endpoints

| HTTP Method | Endpoint | Status Code | Description |
|---|---|---|---|
| GET | `/` | 200 | Returns a welcome message. |
| GET | `/users` | 200 | Returns a list of users in JSON format. |
| GET | `/health` | 200 | Returns the server health status. |
| Any unsupported route or method | — | 404 | Returns a JSON error message. |

## Technologies Used

- Node.js
- JavaScript
- HTTP module
- CommonJS modules (`require` and `module.exports`)
- JSON

## How to Run the Project

1. Open the terminal in the `question_3` directory.
2. Start the server:

   ```bash
   node server.js
   ```

3. The server will start on port `3000`.

   ```text
   http://localhost:3000
   ```

## Testing the Endpoints

Use a browser or `curl` to test the endpoints.

```bash
curl -i http://localhost:3000/
curl -i http://localhost:3000/users
curl -i http://localhost:3000/health
curl -i http://localhost:3000/unknown
```

The `-i` option displays the HTTP status code and response headers along with the response body.

## Error Handling

If a requested route does not exist or the HTTP method is unsupported, the server returns a `404 Not Found` status code with a JSON error response.

Example:

```json
{
  "error": "Route not found"
}
```

## Conclusion

This project demonstrates the fundamentals of creating an HTTP server with Node.js, handling requests and responses, implementing basic routing, and returning appropriate HTTP status codes.
