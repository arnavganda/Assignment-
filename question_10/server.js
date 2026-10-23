
require('dotenv').config();

const http = require('http');
const routes = require('./routes');

const PORT = Number(process.env.PORT) || 3000;

const server = http.createServer((req, res) => {
    const startTime = Date.now();

    res.on('finish', () => {
        console.log({
            method: req.method,
            path: req.url.split('?')[0],
            statusCode: res.statusCode,
            responseTime: `${Date.now() - startTime}ms`
        });
    });

    try {
        const result = routes(req, res);

        if (result && typeof result.catch === 'function') {
            result.catch(error => {
                console.error('Request failed:', error.name);

                if (!res.headersSent) {
                    res.writeHead(500, {
                        'Content-Type': 'application/json'
                    });

                    res.end(JSON.stringify({
                        success: false,
                        message: 'Internal server error'
                    }));
                } else {
                    res.destroy();
                }
            });
        }
    } catch (error) {
        console.error('Request failed:', error.name);

        if (!res.headersSent) {
            res.writeHead(500, {
                'Content-Type': 'application/json'
            });

            res.end(JSON.stringify({
                success: false,
                message: 'Internal server error'
            }));
        } else {
            res.destroy();
        }
    }
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
