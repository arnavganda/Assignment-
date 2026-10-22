const {
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
} = require('./controller');

function routes(req, res) {
    const url = new URL(
        req.url,
        `http://${req.headers.host || 'localhost'}`
    );

    const pathname = url.pathname;

    // GET /
    if (pathname === '/' && req.method === 'GET') {
        return getHome(req, res);
    }

    // POST /login
    if (pathname === '/login' && req.method === 'POST') {
        return login(req, res);
    }
        // POST /session/login
    if (pathname === '/session/login' && req.method === 'POST') {
        return sessionLogin(req, res);
    }

    // GET /session/profile
    if (pathname === '/session/profile' && req.method === 'GET') {
        return sessionProfile(req, res);
    }

    // POST /session/logout
    if (pathname === '/session/logout' && req.method === 'POST') {
        return sessionLogout(req, res);
    }

    // GET /users
    if (pathname === '/users' && req.method === 'GET') {
        return getUsers(req, res);
    }

    // POST /users
    if (pathname === '/users' && req.method === 'POST') {
        return createUser(req, res);
    }

    // /users/:id
    const match = pathname.match(/^\/users\/([^/]+)$/);

    if (match) {
        let id;

        try {
            id = decodeURIComponent(match[1]);
        } catch (error) {
            res.writeHead(400, {
                'Content-Type': 'application/json'
            });

            return res.end(JSON.stringify({
                message: 'Invalid user ID'
            }));
        }

        // GET /users/:id
        if (req.method === 'GET') {
            return getUser(req, res, id);
        }

        // PUT /users/:id
        if (req.method === 'PUT') {
            return updateUser(req, res, id);
        }

        // DELETE /users/:id
        if (req.method === 'DELETE') {
            return deleteUser(req, res, id);
        }

        // Unsupported method for /users/:id
        res.writeHead(405, {
            'Content-Type': 'application/json',
            'Allow': 'GET, PUT, DELETE'
        });

        return res.end(JSON.stringify({
            message: 'Method not allowed'
        }));
    }

    // Route not found
    res.writeHead(404, {
        'Content-Type': 'application/json'
    });

    res.end(JSON.stringify({
        message: 'Page not found'
    }));
}

module.exports = routes;