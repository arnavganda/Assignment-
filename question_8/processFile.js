const fs = require('fs');
const { Transform, pipeline } = require('stream');

const INPUT = process.argv[2] || 'large-input.txt';
const OUTPUT = process.argv[3] || 'large-output.txt';

let lines = 0;
const start = Date.now();
const startMemory = process.memoryUsage().rss;
let peakMemory = startMemory;

// Check memory while the file is processed (to show it stays small)
const timer = setInterval(() => {
    peakMemory = Math.max(peakMemory, process.memoryUsage().rss);
}, 50);

// Process each chunk as it flows through (make it uppercase and count lines)
const upperCase = new Transform({
    decodeStrings: false,
    transform(chunk, encoding, callback) {
        lines += (chunk.match(/\n/g) || []).length;
        callback(null, chunk.toUpperCase());
    }
});

const input = fs.createReadStream(INPUT, { encoding: 'utf8' });
const output = fs.createWriteStream(OUTPUT);

// Completion events
input.on('end', () => console.log('Finished reading the input file'));
output.on('finish', () => console.log('Finished writing the output file'));

// This callback runs when everything is done, or when ANY stream fails
pipeline(input, upperCase, output, error => {
    clearInterval(timer);

    if (error) {
        console.error('Processing failed:', error.message);
        process.exitCode = 1;
        return;
    }

    const fileSizeMB = fs.statSync(INPUT).size / 1024 / 1024;
    const extraMemoryMB = (peakMemory - startMemory) / 1024 / 1024;

    console.log(`Processed ${lines} lines in ${Date.now() - start} ms`);
    console.log(`File size: ${fileSizeMB.toFixed(1)} MB`);
    console.log(`Extra memory used while processing: ${extraMemoryMB.toFixed(1)} MB`);
});