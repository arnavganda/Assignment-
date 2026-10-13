const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const filePath = path.join(__dirname, 'sample.txt');

fs.readFile('./sample.txt', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    console.log('This is the callback data:', data);
});
 

fsPromises.readFile(filePath, 'utf8')
    .then((data) => {
        // Runs if the file is read successfully
        console.log('Promise fulfilled:', data);
    })
    .catch((err) => {
        // Runs if the operation fails
        console.error('Promise rejected:', err.message);
    });

console.log('This runs while the file is being read!');


async function readFile() {   // await fn 
    const data = await fsPromises.readFile('sample.txt', 'utf8');
    console.log("This is data using await fn: ", data);
}

readFile();