# Question 04 – HTTP Methods, Headers, and Request Bodies

## Overview
This project extends a basic Node.js HTTP server to handle incoming request data. It demonstrates how to accept JSON requests, read and validate request bodies, check HTTP headers, and return appropriate HTTP status codes without using Express or Express middleware.

## Requirements Implemented
- Created a `POST /users` endpoint to accept JSON data.
- Read incoming request bodies using Node.js request events.
- Parsed JSON request data without Express middleware.
- Validated required fields before processing requests.
- Handled invalid JSON and missing or invalid input.
- Read request headers, including `Content-Type`.
- Handled missing or incorrect content types.
- Returned appropriate HTTP status codes for successful requests, invalid input, and unsupported routes or methods.
- Separated routing, controller logic, and user data into different files.

## Technologies Used
- Node.js
- Built-in `http` module
- JavaScript
- JSON

## Project Structure

```text
Question-04/
├── server.js
├── routes.js
├── controller.js
└── users.js
```

## How to Run

1. Open the project folder in the terminal.
2. Start the server:

   ```bash
   node server.js
   ```

3. Send HTTP requests using Postman or `curl`.

## Testing

### Create a User

**Method:** `POST`  
**Endpoint:** `http://localhost:8001/users`

Set the request header:

```text
Content-Type: application/json
```

Example JSON body:

```json
{
  "name": "Arnav Ganda"
}
```

The server reads the request body, parses the JSON, validates the required fields, and processes the request.

### Test Invalid Requests

Test the endpoint with:
- Invalid JSON syntax.
- Missing required fields.
- An empty request body.
- A missing or incorrect `Content-Type` header.
- An unsupported HTTP method or route.

The server should reject invalid requests and return appropriate status codes and error messages.

## Expected Outcome

A working Node.js HTTP server that receives and processes JSON request bodies, validates incoming data, checks relevant headers, and handles invalid requests without using Express middleware.

## Learning Outcomes

- Understanding HTTP methods and request headers.
- Reading request bodies with Node.js.
- Parsing and validating JSON data.
- Handling errors and HTTP status codes.
- Organizing server code using separate route, controller, and data files.
