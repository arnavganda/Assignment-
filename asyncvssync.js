const fs = require('fs');
console.log('Starting the asynchronous file read operation...');
fs.readFile('./sample.txt', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    console.log('Asynchronous File contents:', data);
});

console.log("this is after reading asynchronus file read operation...")

const readsync = fs.readFileSync('./sample.txt', 'utf8');
console.log('File contents (synchronous):', readsync);  

console.log("this is after reading synchronus file read operation...")