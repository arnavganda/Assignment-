
const http = require('http');

const PORT = 8001;

const users = [
    { id: 1, name: 'Arnav' },
    { id: 2, name: 'Cristiano Ronaldo' }
];

const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.url === '/api/health' && req.method === 'GET') {
        return res.end(JSON.stringify({
            status: 'OK',
            message: 'Node.js API is running'
        }));
    }

    if (req.url === '/api/users' && req.method === 'GET') {
        return res.end(JSON.stringify(users));
    }

    if (req.url === '/api/users' && req.method === 'POST') {
        let body = '';

        req.on('data', data => {
            body += data;
        });

        req.on('end', () => {
            try {
                const newUser = JSON.parse(body);

                if (!newUser.name || typeof newUser.name !== 'string') {
                    res.statusCode = 400;
                    return res.end(JSON.stringify({
                        message: 'A valid name is required'
                    }));
                }

                newUser.id = users.length
                    ? Math.max(...users.map(user => user.id)) + 1
                    : 1;

                users.push(newUser);

                res.statusCode = 201;
                res.end(JSON.stringify({
                    message: 'User created successfully',
                    user: newUser
                }));
            } catch (error) {
                res.statusCode = 400;
                res.end(JSON.stringify({
                    message: 'Invalid JSON'
                }));
            }
        });

        return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({
        message: 'API route not found'
    }));
});

server.listen(PORT, () => {
    console.log(`Node.js API running at http://localhost:${PORT}`);
});
