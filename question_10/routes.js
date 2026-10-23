


const {
    getHome,
    login,
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require('./controller');

function sendError(res, status, message, extraHeaders = {}) {
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        ...extraHeaders
    });

    res.end(JSON.stringify({
        success: false,
        message
    }));
}

async function routes(req, res) {
    let url;

    try {
        url = new URL(req.url, 'http://localhost');
    } catch {
        return sendError(res, 400, 'Invalid request URL');
    }

    const pathname = url.pathname;

    if (pathname.length > 2048) {
        return sendError(res, 414, 'Request URL too long');
    }

    if (req.headers['transfer-encoding'] &&
        req.headers['content-length']) {
        req.resume();
        return sendError(res, 400, 'Invalid request headers');
    }

    if (req.headers['content-length'] !== undefined) {
        const length = req.headers['content-length'];

        if (!/^\d+$/.test(length)) {
            req.resume();
            return sendError(res, 400, 'Invalid Content-Length');
        }

        if (Number(length) > 100 * 1024) {
            req.resume();
            return sendError(res, 413, 'Request body too large');
        }
    }

    if (pathname === '/') {
        if (req.method !== 'GET') {
            return sendError(res, 405, 'Method not allowed', {
                Allow: 'GET'
            });
        }

        return getHome(req, res);
    }

    if (pathname === '/login') {
        if (req.method !== 'POST') {
            return sendError(res, 405, 'Method not allowed', {
                Allow: 'POST'
            });
        }

        return login(req, res);
    }

    if (pathname === '/users') {
        if (req.method === 'GET') return getUsers(req, res);
        if (req.method === 'POST') return createUser(req, res);

        return sendError(res, 405, 'Method not allowed', {
            Allow: 'GET, POST'
        });
    }

    const match = pathname.match(/^\/users\/([^/]+)$/);

    if (match) {
        let id;

        try {
            id = decodeURIComponent(match[1]);
        } catch {
            return sendError(res, 400, 'Invalid user ID');
        }

        if (!id || id.length > 100) {
            return sendError(res, 400, 'Invalid user ID');
        }

        if (req.method === 'GET') return getUser(req, res, id);
        if (req.method === 'PUT') return updateUser(req, res, id);
        if (req.method === 'DELETE') return deleteUser(req, res, id);

        return sendError(res, 405, 'Method not allowed', {
            Allow: 'GET, PUT, DELETE'
        });
    }

    return sendError(res, 404, 'Resource not found');
}

module.exports = routes;
