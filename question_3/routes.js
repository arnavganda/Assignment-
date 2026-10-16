const { getHome, getUser, getHelth } = require('./controller');

function handleRequest(req, res) {
    if (req.url === '/' && req.method === 'GET') {     // all the get methods 
        return getHome(req, res);
    }

    if (req.url === '/users' && req.method === 'GET') {
        return getUser(req, res);
    }

    if (req.url === '/health' && req.method === 'GET') {
        return getHelth(req, res);
    }
    

    res.writeHead(404, {      //404 handelijg
        'Content-Type': 'application/json'
    });

    res.end(JSON.stringify({ message: 'Page not found' }));
}

module.exports = handleRequest;