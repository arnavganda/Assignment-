const users = require('./users');

// Show a welcome message when someone visits the home page
function getHome(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });

    res.end('<h1>Welcome to the Home Page</h1>');
}

// Send the list of users when someone requests /users
function getUser(req, res) {
    res.writeHead(200, {
        'Content-Type': 'application/json'
    });

    res.end(JSON.stringify(users));
}

// Create a new user when someone sends a POST request to /users
function createUser(req, res) {
    // Check if the request is sending JSON data
    const contentType = req.headers['content-type'];

    if (
        !contentType ||
        contentType.split(';')[0].trim().toLowerCase() !== 'application/json'
    ) {
        res.writeHead(415, {
            'Content-Type': 'application/json'
        });

        return res.end(JSON.stringify({
            message: 'Content-Type must be application/json'
        }));
    }

    // Store the incoming request data
    let body = '';

    req.on('data', (data) => {
        body += data;
    });

    // Run this once all the request data has arrived
    req.on('end', () => {
        let newUser;

        // Convert the incoming JSON text into a JavaScript object
        try {
            newUser = JSON.parse(body);
        } catch (error) {
            // Return an error if the JSON is not written correctly
            res.writeHead(400, {
                'Content-Type': 'application/json'
            });

            return res.end(JSON.stringify({
                message: 'Invalid JSON'
            }));
        }

        // Make sure the request contains a single object, not an array or another value
        if (
            newUser === null ||
            typeof newUser !== 'object' ||
            Array.isArray(newUser)
        ) {
            res.writeHead(400, {
                'Content-Type': 'application/json'
            });

            return res.end(JSON.stringify({
                message: 'Request body must be a JSON object'
            }));
        }

        // Check that the user has provided a valid name
        if (
            typeof newUser.name !== 'string' ||
            newUser.name.trim() === ''
        ) {
            res.writeHead(400, {
                'Content-Type': 'application/json'
            });

            return res.end(JSON.stringify({
                message: 'Name is required and must be a non-empty string'
            }));
        }

        // Remove extra spaces from the name and assign the next ID
        newUser.name = newUser.name.trim();
        newUser.id = users.length + 1;

        // Add the new user to the list
        users.push(newUser);

        // Send back the newly created user
        res.writeHead(201, {
            'Content-Type': 'application/json'
        });

        res.end(JSON.stringify(newUser));
    });

    // Handle any errors that happen while reading the request
    req.on('error', (error) => {
        if (!res.headersSent) {
            res.writeHead(500, {
                'Content-Type': 'application/json'
            });
        }

        if (!res.writableEnded) {
            res.end(JSON.stringify({
                message: 'Error reading request'
            }));
        }
    });
}

// Let the client check whether the server is running properly
function getHelth(req, res) {
    res.writeHead(200, {
        'Content-Type': 'application/json'
    });

    res.end(JSON.stringify({
        status: 'OK'
    }));
}

// Make these functions available to routes.js
module.exports = {
    getHome,
    getUser,
    createUser,
    getHelth
};