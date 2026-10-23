
const jwt = require('jsonwebtoken');

function getSecret() {
    const secret = process.env.JWT_SECRET;

    if (!secret || secret.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters');
    }

    return secret;
}

function sendAuthError(res, status, message) {
    if (res.headersSent) return null;

    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
    });

    res.end(JSON.stringify({
        success: false,
        message
    }));

    return null;
}

function createToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            username: user.username,
            role: user.role
        },
        getSecret(),
        {
            algorithm: 'HS256',
            expiresIn: '1h'
        }
    );
}

function authenticate(req, res) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return sendAuthError(res, 401, 'Authentication token required');
    }

    const token = header.slice(7).trim();

    if (!token) {
        return sendAuthError(res, 401, 'Authentication token required');
    }

    try {
        return jwt.verify(token, getSecret(), {
            algorithms: ['HS256']
        });
    } catch (error) {
        if (error.message.includes('JWT_SECRET')) {
            throw error;
        }

        return sendAuthError(res, 401, 'Invalid or expired token');
    }
}

function authorize(req, res, allowedRoles = []) {
    const user = authenticate(req, res);

    if (!user) return null;

    if (!allowedRoles.includes(user.role)) {
        return sendAuthError(res, 403, 'Permission denied');
    }

    return user;
}

module.exports = {
    createToken,
    authenticate,
    authorize
};
