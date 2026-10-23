
const { randomUUID } = require('crypto');
const { readUsers, writeUsers } = require('./fileOperations');
const { hashPassword, verifyPassword } = require('./passwords');
const { createToken, authenticate, authorize } = require('./auth');

function send(res, status, data) {
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
    });

    res.end(JSON.stringify(data));
}

function fail(res, status, message) {
    return send(res, status, {
        success: false,
        message
    });
}

function internalError(res, error) {
    // Do not log passwords, tokens, request bodies or stack traces.
    console.error('Controller error:', error.name);

    return fail(res, 500, 'Internal server error');
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        let settled = false;

        function rejectOnce(error) {
            if (settled) return;
            settled = true;
            reject(error);
        }

        req.on('data', chunk => {
            if (settled) return;

            body += chunk.toString();

            if (Buffer.byteLength(body) > 100 * 1024) {
                const error = new Error('Request body too large');
                error.statusCode = 413;
                rejectOnce(error);
                req.resume();
            }
        });

        req.on('end', () => {
            if (settled) return;

            settled = true;

            try {
                resolve(JSON.parse(body));
            } catch {
                const error = new Error('Malformed JSON');
                error.statusCode = 400;
                reject(error);
            }
        });

        req.on('error', rejectOnce);
    });
}

async function getBody(req, res) {
    const contentType = req.headers['content-type']
        ?.split(';')[0]
        .trim()
        .toLowerCase();

    if (contentType !== 'application/json') {
        fail(res, 415, 'Content-Type must be application/json');
        return null;
    }

    try {
        const data = await readBody(req);

        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            fail(res, 400, 'Request body must be a JSON object');
            return null;
        }

        return data;
    } catch (error) {
        fail(
            res,
            error.statusCode || 400,
            error.statusCode === 413
                ? 'Request body too large'
                : 'Malformed JSON request'
        );

        return null;
    }
}

function validUsername(username) {
    return typeof username === 'string' &&
        username.trim().length >= 1 &&
        username.trim().length <= 50;
}

function validPassword(password) {
    return typeof password === 'string' &&
        password.length >= 12 &&
        password.length <= 128;
}

function getHome(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
    });

    res.end('<h1>Welcome to the Users API</h1>');
}

async function login(req, res) {
    try {
        const data = await getBody(req, res);
        if (!data) return;

        if (
            typeof data.username !== 'string' ||
            !data.username.trim() ||
            typeof data.password !== 'string' ||
            !data.password
        ) {
            return fail(res, 400, 'Username and password are required');
        }

        const users = await readUsers();

        const user = users.find(
            item => item.username === data.username.trim()
        );

        if (!user || !(await verifyPassword(data.password, user.password))) {
            return fail(res, 401, 'Invalid username or password');
        }

        return send(res, 200, {
            success: true,
            token: createToken(user)
        });
    } catch (error) {
        return internalError(res, error);
    }
}

async function getUsers(req, res) {
    try {
        const currentUser = authorize(req, res, ['admin']);
        if (!currentUser) return;

        const users = await readUsers();

        return send(res, 200, {
            success: true,
            data: users.map(({ id, username, role }) => ({
                id,
                username,
                role
            }))
        });
    } catch (error) {
        return internalError(res, error);
    }
}

async function getUser(req, res, id) {
    try {
        const currentUser = authenticate(req, res);
        if (!currentUser) return;

        if (currentUser.sub !== id && currentUser.role !== 'admin') {
            return fail(res, 403, 'Permission denied');
        }

        const users = await readUsers();
        const user = users.find(item => item.id === id);

        if (!user) return fail(res, 404, 'User not found');

        return send(res, 200, {
            success: true,
            data: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        return internalError(res, error);
    }
}

async function createUser(req, res) {
    try {
        const currentUser = authorize(req, res, ['admin']);
        if (!currentUser) return;

        const data = await getBody(req, res);
        if (!data) return;

        if (
            !validUsername(data.username) ||
            !validPassword(data.password) ||
            (data.role !== undefined &&
                !['admin', 'user'].includes(data.role))
        ) {
            return fail(
                res,
                400,
                'Invalid username, password or role'
            );
        }

        const username = data.username.trim();
        const users = await readUsers();

        if (users.some(user => user.username === username)) {
            return fail(res, 409, 'Username already exists');
        }

        const user = {
            id: randomUUID(),
            username,
            password: await hashPassword(data.password),
            role: data.role || 'user'
        };

        users.push(user);
        await writeUsers(users);

        return send(res, 201, {
            success: true,
            data: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        return internalError(res, error);
    }
}

async function updateUser(req, res, id) {
    try {
        const currentUser = authorize(req, res, ['admin']);
        if (!currentUser) return;

        const data = await getBody(req, res);
        if (!data) return;

        if (
            !validUsername(data.username) ||
            !validPassword(data.password) ||
            (data.role !== undefined &&
                !['admin', 'user'].includes(data.role))
        ) {
            return fail(res, 400, 'Invalid user data');
        }

        const users = await readUsers();
        const user = users.find(item => item.id === id);

        if (!user) return fail(res, 404, 'User not found');

        const username = data.username.trim();

        if (users.some(item =>
            item.username === username && item.id !== id
        )) {
            return fail(res, 409, 'Username already exists');
        }

        user.username = username;
        user.password = await hashPassword(data.password);

        if (data.role !== undefined) {
            user.role = data.role;
        }

        await writeUsers(users);

        return send(res, 200, {
            success: true,
            data: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        return internalError(res, error);
    }
}

async function deleteUser(req, res, id) {
    try {
        const currentUser = authorize(req, res, ['admin']);
        if (!currentUser) return;

        const users = await readUsers();
        const index = users.findIndex(item => item.id === id);

        if (index === -1) {
            return fail(res, 404, 'User not found');
        }

        users.splice(index, 1);
        await writeUsers(users);

        res.writeHead(204);
        return res.end();
    } catch (error) {
        return internalError(res, error);
    }
}

module.exports = {
    getHome,
    login,
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
};
