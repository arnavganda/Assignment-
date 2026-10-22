const { randomUUID } = require('crypto');

// Server-side session storage: sessionId -> user info
const sessions = new Map();

function createSession(user) {
    const id = randomUUID();

    sessions.set(id, {
        id: user.id,
        username: user.username,
        role: user.role,
        expires: Date.now() + 30 * 60 * 1000 // 30 minutes
    });

    return id;
}

// Read the sessionId from the cookie
function getSessionId(req) {
    const cookie = req.headers.cookie || '';
    const match = cookie.match(/sessionId=([^;]+)/);

    return match ? match[1] : null;
}

function getSession(req) {
    const id = getSessionId(req);
    const session = sessions.get(id);

    if (!session) return null;

    if (session.expires < Date.now()) {
        sessions.delete(id);
        return null;
    }

    return session;
}

function destroySession(req) {
    sessions.delete(getSessionId(req));
}

module.exports = {
    createSession,
    getSession,
    destroySession
};