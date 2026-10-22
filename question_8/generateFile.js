const fs = require('fs');

const FILE = 'large-input.txt';
const LINES = 1000000;

const output = fs.createWriteStream(FILE);

let i = 0;

output.on('error', error => {
    console.error('Could not write file:', error.message);
});

output.on('finish', () => {
    console.log(`Created ${FILE} with ${LINES} lines`);
});

// Write line by line, and pause when the stream's buffer is full
function writeLines() {
    while (i < LINES) {
        i++;

        const ok = output.write(`Line ${i}: the quick brown fox jumps over the lazy dog\n`);

        if (!ok) {
            return output.once('drain', writeLines);
        }
    }

    output.end();
}

writeLines();