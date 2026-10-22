require('dotenv').config();

const cluster = require('cluster');
const http = require('http');
const os = require('os');

const PORT = Number(process.env.PORT) || 3000;

if (cluster.isPrimary) {
    // The primary process only manages the workers
    const cpuCount = Number(process.env.WORKERS) || os.cpus().length;
    let restarts = 0;
    const MAX_RESTARTS = 10;

    console.log(`Primary ${process.pid} is running, starting ${cpuCount} workers`);

    for (let i = 0; i < cpuCount; i++) {
        cluster.fork();
    }

    cluster.on('online', worker => {
        console.log(`Worker ${worker.process.pid} started`);
    });

    // Worker failure: start a replacement so the server keeps running
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died (${signal || 'code ' + code})`);

        if (restarts >= MAX_RESTARTS) {
            console.log('Too many worker failures, not starting a new one');
            return;
        }

        restarts++;
        console.log('Starting a replacement worker...');
        cluster.fork();
    });
} else {
    // Every worker runs the same server on the same port
    const routes = require('./routes');

    const server = http.createServer((req, res) => {
        // GET /whoami shows which worker answered
        if (req.url === '/whoami' && req.method === 'GET') {
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Connection': 'close' // new connection each time, so requests rotate between workers
            });

            return res.end(JSON.stringify({
                worker: cluster.worker.id,
                pid: process.pid
            }));
        }

        // GET /crash kills this worker on purpose (demo only)
        if (req.url === '/crash' && req.method === 'GET' && process.env.NODE_ENV !== 'production') {
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Connection': 'close'
            });

            return res.end(
                JSON.stringify({ message: `Worker ${process.pid} is crashing` }),
                () => process.exit(1)
            );
        }

        routes(req, res);
    });

    server.listen(PORT, () => {
        console.log(`Worker ${process.pid} is listening on port ${PORT}`);
    });
}