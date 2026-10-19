
const { getHome, getUser, getHelth, createUser } = require('./controller');

// Check the incoming request and send it to the right function
function handleRequest(req, res) {

    // If someone visits the home page, show the welcome message
    if (req.url === '/' && req.method === 'GET') {
        return getHome(req, res);
    }

    // If someone wants to see all users, return the users list
    if (req.url === '/users' && req.method === 'GET') {
        return getUser(req, res);
    }

    // Let the user check if the server is running properly
    if (req.url === '/health' && req.method === 'GET') {
        return getHelth(req, res);
    }

    // If someone sends a POST request, create a new user
    if (req.url === '/users' && req.method === 'POST') {
        return createUser(req, res);
    }

    // If the URL doesn't match any route above, return a 404 error
    res.writeHead(404, {
        'Content-Type': 'application/json'
    });

    res.end(JSON.stringify({
        message: 'Page not found'
    }));
}

// Make this function available to server.js
module.exports = handleRequest;
