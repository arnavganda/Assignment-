
const {
    getHome,
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require('./controller');

function routes(req, res) {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    if (pathname === '/' && req.method === 'GET') {
        return getHome(req, res);
    }

    if (pathname === '/users' && req.method === 'GET') {
        return getUsers(req, res);
    }

    if (pathname === '/users' && req.method === 'POST') {
        return createUser(req, res);
    }
    // /users/id
    const match = pathname.match(/^\/users\/([^/]+)$/);

    if (match) {
        const id = decodeURIComponent(match[1]);

        if (req.method === 'GET') {
            return getUser(req, res, id);
        }

        if (req.method === 'PUT') {
            return updateUser(req, res, id);
        }

        if (req.method === 'DELETE') {
            return deleteUser(req, res, id);
        }
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Page not found' }));
}

module.exports = routes;
