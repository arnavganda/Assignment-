const http = require('http');
const PORT = 3000;

const routes = require("./routes");

const server = http.createServer((req, res) => {    //triggering routes to run controller functions  and creating server 
    routes(req, res);   
});

server.listen(PORT, () => {       //server started
    console.log(`Server is running on http://localhost:${PORT}`);
});


