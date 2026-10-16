function getHome(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Welcome to the Home Page</h1>');
}   

function getUser(req, res) {
    const users = [
        { id: 1, name: 'Arnav Ganda' },
        { id: 2, name: 'Masked man' },    //json data
        { id: 3, name: 'Red Hat' }
    ];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
}

function getHelth(req, res) {      //gets the health 
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'OK' }));
}

module.exports = {
    getHome,
    getUser,
    getHelth
};