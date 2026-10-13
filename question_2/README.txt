# Question 2: Asynchronous Programming and the Event Loop

## Overview
This project demonstrates synchronous and asynchronous file operations in Node.js, including callbacks, Promises, async/await, timers, and event-loop execution order.

## Files
- **`asyncvssync.js`** — Demonstrates synchronous and asynchronous file reading.
- **`callbackpromisesawait.js`** — Demonstrates callbacks, Promises, async/await, and error handling.
- **`timereventloop.js`** — Demonstrates timers, Promise microtasks, and event-loop execution order.
- **`sample.txt`** — Contains the sample text used by the file-reading examples.

## Prerequisites
- Install [Node.js](https://nodejs.org/).
- Ensure all project files are in the same directory.

## How to Run

Open a terminal in the `question_2` directory.

### 1. Synchronous and Asynchronous File Operations

```bash
node asyncvssync.js
```

Compares synchronous file reading using `fs.readFileSync()` with asynchronous file reading using `fs.readFile()`.

### 2. Callbacks, Promises, and Async/Await

```bash
node callbackpromisesawait.js
```

Demonstrates callback-based file reading, Promise handling with `.then()` and `.catch()`, and asynchronous execution using `async/await`.

### 3. Timers and Event Loop

```bash
node timereventloop.js
```

Demonstrates execution order using `setTimeout()`, Promise microtasks, and asynchronous file operations. The order of timer and file-read completion may vary.

## Error Handling
The examples demonstrate handling errors using callback error checks, Promise `.catch()`, and `try/catch` blocks. To test error handling, temporarily change a filename to a nonexistent file and run the relevant JavaScript file again.

## Conclusion


Synchronous Operations: Using fs.readFileSync(), the program waits for the file operation to complete before moving to the next statement. This is known as blocking execution.

Asynchronous Operations: Using fs.readFile(), Node.js can continue executing other JavaScript code while the file is being read. This helps keep applications responsive.

Callbacks: Callbacks are functions passed to another function to be executed when an operation completes. They allow asynchronous results and errors to be handled.

Promises: Promises represent the eventual success or failure of an asynchronous operation. .then() handles successful results, while .catch() handles errors.

Async/Await: The async and await keywords provide a cleaner way to work with Promises. await pauses the current asynchronous function until the Promise settles, while other JavaScript execution can continue.

Timers: The setTimeout() function schedules a callback to execute after a specified minimum delay. A delay of 0 does not mean the callback executes immediately.

Event Loop: The event loop allows Node.js to coordinate asynchronous operations and execute their callbacks when they are ready. Synchronous code executes first, Promise handlers run as microtasks after the current synchronous code finishes, and timer callbacks run when the event loop processes them.

Asynchronous I/O and Execution Order: File-reading operations and timers may complete in different orders depending on when the operations finish and when their callbacks become eligible to run. This demonstrates why the order in which asynchronous operations are started does not always determine their completion order.

Error Handling: Callback error checks, Promise .catch(), and try/catch blocks help manage failures, such as attempting to read a file that does not exist.