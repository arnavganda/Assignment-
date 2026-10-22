const jwt = require('jsonwebtoken');

function getSecret() {
    const secret = process.env.JWT_SECRET;

    if (
        !secret ||
        secret.length < 32 ||
        secret === 'replace_this_with_a_long_random_secret'
    ) {
        throw new Error('Set a strong JWT_SECRET in your .env file');
    }

    return secret;
}

function createToken(user) {
    return jwt.sign(
        {
            username: user.username,
            role: user.role
        },
        getSecret(),
        {   algorithm: 'HS256',
            subject: user.id,
            expiresIn: process.env.JWT_EXPIRES_IN || '1h'
        }
    );
}

function authenticate(req, res) {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        res.writeHead(401, {
            'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
            message: 'A valid Bearer token is required'
        }));

        return null;
    }

    const token = authorization.slice(7).trim();

    if (!token) {
        res.writeHead(401, {
            'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
            message: 'Authentication token is required'
        }));

        return null;
    }

    try {
        return jwt.verify(token, getSecret(), { algorithms: ['HS256'] });
    } catch (error) {
        res.writeHead(401, {
            'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
            message: error.name === 'TokenExpiredError'
                ? 'Token has expired'
                : 'Invalid authentication token'
        }));

        return null;
    }
}

function authorize(req, res, allowedRoles) {
    const user = authenticate(req, res);

    if (!user) {
        return null;
    }

    if (!allowedRoles.includes(user.role)) {
        res.writeHead(403, {
            'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
            message: 'You do not have permission to perform this action'
        }));

        return null;
    }

    return user;
}

module.exports = {
    createToken,
    authenticate,
    authorize
};