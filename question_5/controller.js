
const { randomUUID } = require('crypto');
const { readUsers, writeUsers } = require('./fileOperations');

// GET /
function getHome(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Welcome to the Users API</h1>');
}

// GET /users
async function getUsers(req, res) {
    try {
        const users = await readUsers();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Server error' }));
    }
}

// GET /users/:id
async function getUser(req, res, id) {
    try {
        const users = await readUsers();
        const user = users.find(user => user.id === id);

        if (!user) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'User not found' }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
    } catch (error) {
        res.writeHead(500);
        res.end('Server error');
    }
}

// Read JSON body
function getBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';

        req.on('data', data => body += data);

        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(error);
            }
        });

        req.on('error', reject);
    });
}

// POST /users
async function createUser(req, res) {
    try {
        if (!req.headers['content-type']?.includes('application/json')) {
            res.writeHead(415);
            return res.end('Content-Type must be application/json');
        }

        const data = await getBody(req);

        if (!data || typeof data.name !== 'string' || !data.name.trim()) {
            res.writeHead(400);
            return res.end('Valid name is required');
        }

        const users = await readUsers();

        const newUser = {
            id: randomUUID(),
            name: data.name.trim()
        };

        users.push(newUser);
        await writeUsers(users);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newUser));
    } catch (error) {
        res.writeHead(400);
        res.end('Invalid request');
    }
}

// PUT /users/:id
async function updateUser(req, res, id) {
    try {
        if (!req.headers['content-type']?.includes('application/json')) {
            res.writeHead(415);
            return res.end('Content-Type must be application/json');
        }

        const data = await getBody(req);

        if (!data || typeof data.name !== 'string' || !data.name.trim()) {
            res.writeHead(400);
            return res.end('Valid name is required');
        }

        const users = await readUsers();
        const user = users.find(user => user.id === id);

        if (!user) {
            res.writeHead(404);
            return res.end('User not found');
        }

        user.name = data.name.trim();
        await writeUsers(users);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
    } catch (error) {
        res.writeHead(400);
        res.end('Invalid request');
    }
}

// DELETE /users/:id
async function deleteUser(req, res, id) {
    try {
        const users = await readUsers();
        const index = users.findIndex(user => user.id === id);

        if (index === -1) {
            res.writeHead(404);
            return res.end('User not found');
        }

        users.splice(index, 1);
        await writeUsers(users);

        res.writeHead(204);
        res.end();
    } catch (error) {
        res.writeHead(500);
        res.end('Server error');
    }
}

module.exports = {
    getHome,
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
};
