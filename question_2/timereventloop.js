
const fs = require('fs/promises');


console.log('1. Start');

setTimeout(() => {
    console.log('2. Timer finished');
}, 0);

const fsPromises = require('fs/promises');

Promise.resolve('sample.txt', 'utf8')
    .then((data) => {
        console.log('3. File read:', data);
    })
    .catch((err) => {
        console.error('Error reading the file:', err.message);
    }); 

console.log('4. End');
