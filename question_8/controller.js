const { randomUUID } = require('crypto');
const { readUsers, writeUsers } = require('./fileOperations');
const { hashPassword, verifyPassword } = require('./passwords');
const { createToken, authenticate, authorize } = require('./auth');
const { createSession, getSession, destroySession } = require('./session');
// GET /
function getHome(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Welcome to the Users API</h1>');
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

// POST /login
async function login(req, res) {
    try {
        if (!req.headers['content-type']?.includes('application/json')) {
            res.writeHead(415);
            return res.end('Content-Type must be application/json');
        }

        const data = await getBody(req);

        if (
            !data ||
            typeof data.username !== 'string' ||
            typeof data.password !== 'string'
        ) {
            res.writeHead(400);
            return res.end('Username and password are required');
        }

        const users = await readUsers();
        const user = users.find(user => user.username === data.username);

        if (!user || !(await verifyPassword(data.password, user.password))) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Invalid username or password' }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ token: createToken(user) }));
    } catch (error) {
        res.writeHead(400);
        res.end('Invalid request');
    }
}
// POST /session/login
async function sessionLogin(req, res) {
    try {
        const data = await getBody(req);

        const users = await readUsers();
        const user = users.find(user => user.username === data.username);

        if (!user || !(await verifyPassword(data.password, user.password))) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Invalid username or password' }));
        }

        // The server remembers the user, the browser only gets the ID
        const sessionId = createSession(user);

        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Set-Cookie': `sessionId=${sessionId}; HttpOnly; SameSite=Strict; Path=/`
        });
        res.end(JSON.stringify({ message: 'Login successful' }));
    } catch (error) {
        res.writeHead(400);
        res.end('Invalid request');
    }
}

// GET /session/profile (protected)
function sessionProfile(req, res) {
    const session = getSession(req);

    if (!session) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Not logged in' }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        id: session.id,
        username: session.username,
        role: session.role
    }));
}

// POST /session/logout
function sessionLogout(req, res) {
    destroySession(req);

    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Set-Cookie': 'sessionId=; HttpOnly; Path=/; Max-Age=0'
    });
    res.end(JSON.stringify({ message: 'Logged out' }));
}

// GET /users (admin only)
async function getUsers(req, res) {
    try {
        if (!authorize(req, res, ['admin'])) return;

        const users = await readUsers();

        // Never send passwords
        const safeUsers = users.map(user => ({
            id: user.id,
            username: user.username,
            role: user.role
        }));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(safeUsers));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Server error' }));
    }
}

// GET /users/:id (admin, or the user viewing their own account)
async function getUser(req, res, id) {
    try {
        const currentUser = authenticate(req, res);
        if (!currentUser) return;

        if (currentUser.sub !== id && currentUser.role !== 'admin') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'You can only view your own account' }));
        }

        const users = await readUsers();
        const user = users.find(user => user.id === id);

        if (!user) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'User not found' }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            id: user.id,
            username: user.username,
            role: user.role
        }));
    } catch (error) {
        res.writeHead(500);
        res.end('Server error');
    }
}

// POST /users (admin only)
async function createUser(req, res) {
    try {
        if (!authorize(req, res, ['admin'])) return;

        if (!req.headers['content-type']?.includes('application/json')) {
            res.writeHead(415);
            return res.end('Content-Type must be application/json');
        }

        const data = await getBody(req);

        if (
            !data ||
            typeof data.username !== 'string' ||
            !data.username.trim() ||
            typeof data.password !== 'string' ||
            data.password.length < 12 ||
            (data.role !== undefined && !['admin', 'user'].includes(data.role))
        ) {
            res.writeHead(400);
            return res.end('Valid username, password (12+ characters) and role are required');
        }

        const users = await readUsers();

        if (users.some(user => user.username === data.username.trim())) {
            res.writeHead(409);
            return res.end('Username already exists');
        }

        const newUser = {
            id: randomUUID(),
            username: data.username.trim(),
            password: await hashPassword(data.password),
            role: data.role || 'user'
        };

        users.push(newUser);
        await writeUsers(users);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            id: newUser.id,
            username: newUser.username,
            role: newUser.role
        }));
    } catch (error) {
        res.writeHead(400);
        res.end('Invalid request');
    }
}

// PUT /users/:id (admin only)
async function updateUser(req, res, id) {
    try {
        if (!authorize(req, res, ['admin'])) return;

        if (!req.headers['content-type']?.includes('application/json')) {
            res.writeHead(415);
            return res.end('Content-Type must be application/json');
        }

        const data = await getBody(req);

        if (
            !data ||
            typeof data.username !== 'string' ||
            !data.username.trim() ||
            typeof data.password !== 'string' ||
            data.password.length < 12 ||
            (data.role !== undefined && !['admin', 'user'].includes(data.role))
        ) {
            res.writeHead(400);
            return res.end('Valid username, password (12+ characters) and role are required');
        }

        const users = await readUsers();
        const user = users.find(user => user.id === id);

        if (!user) {
            res.writeHead(404);
            return res.end('User not found');
        }

        if (users.some(u => u.username === data.username.trim() && u.id !== id)) {
            res.writeHead(409);
            return res.end('Username already exists');
        }

        user.username = data.username.trim();
        user.password = await hashPassword(data.password);

        if (data.role !== undefined) user.role = data.role;

        await writeUsers(users);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            id: user.id,
            username: user.username,
            role: user.role
        }));
    } catch (error) {
        res.writeHead(400);
        res.end('Invalid request');
    }
}

// DELETE /users/:id (admin only)
async function deleteUser(req, res, id) {
    try {
        if (!authorize(req, res, ['admin'])) return;

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
    login,
    sessionLogin,
    sessionProfile,
    sessionLogout,
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
};