# Node.js CRUD Operations Using JSON

## Overview

This project demonstrates basic CRUD (Create, Read, Update, Delete) operations using Node.js and a JSON file for data storage.

The project uses the built-in `fs/promises` module to read and write data asynchronously. The code is divided into two files to keep the application logic separate from the file operations.

## Features

- **Create:** Save records to `records.json`.
- **Read:** Read and display stored records.
- **Update:** Find a record using its ID and update its details.
- **Delete:** Find a record using its ID and remove it.
- **Error Handling:** Handle missing files, invalid JSON, and file operation errors.
- **Data Validation:** Check that records are provided as an array.
- **Modular Code:** Use CommonJS modules to share functions between files.

## Project Structure

```text
project/
├── index.js
├── operations.js
├── records.json
└── README.md
```

- `index.js` — Runs the application and demonstrates the CRUD operations.
- `operations.js` — Contains the functions for creating, reading, updating, and deleting records.
- `records.json` — Stores the records in JSON format.
- `README.md` — Documents the project and how to run it.

## Requirements

- [Node.js](https://nodejs.org/) installed on your machine.
- A terminal or command prompt.

No external npm packages are required.

## Getting Started

### 1. Clone the repository

```bash
git clone "https://github.com/arnavganda/Assignment-.git"
```

### 2. Navigate to the project directory

```bash
cd question_1
```

### 3. Run the application

```bash
node index.js
```

The application creates the initial records, displays them, updates Ronaldo's details, and then deletes his record. The output shows the records after each operation.

## Example Record

```json
{
  "id": 1,
  "name": "Arnav",
  "email": "arnav@tekmonks.com",
  "gender": "male"
}
```

## How It Works

The application uses four main functions exported from `operations.js`:

| Function | Purpose |
|---|---|
| `CreateOP(records)` | Writes an array of records to the JSON file. |
| `ReadOP()` | Reads and displays the records. |
| `UpdateOP(id, newname)` | Updates the record matching the given ID. |
| `DeleteOP(id)` | Removes the record matching the given ID. |

The functions use `async` and `await` to handle file operations without blocking the main execution flow.

## Error Handling

The project handles common file-related errors:

- If `records.json` does not exist, an empty JSON array is created.
- If the file contains invalid JSON, an error is reported.
- If a record ID cannot be found during an update or deletion, a message is displayed.
- Other file operation errors are passed to the application's error handler.

## Technologies Used

- **Node.js**
- **JavaScript**
- **JSON**
- **CommonJS Modules**
- **File System API (`fs/promises`)**

## Notes

This project uses a JSON file as a simple storage mechanism instead of a database. The current `index.js` resets the records to the initial sample data each time it runs so that the CRUD operations can be demonstrated consistently.

This project is intended for learning and demonstrating basic file handling, modular programming, asynchronous operations, and CRUD functionality in Node.js.

## Author

Arnav