require('dotenv').config();

const http = require('http');
const routes = require('./routes');

const PORT = Number(process.env.PORT) || 3000;

const server = http.createServer((req, res) => {
    routes(req, res);
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});