
const fs = require('fs/promises');

// Save the records to the JSON file
async function CreateOP(records) {
    if (!Array.isArray(records)) {
        throw new Error('Records must be an array.');
    }

    await fs.writeFile(
        'records.json',
        JSON.stringify(records, null, 2)
    );
}


async function ReadRecords() {
    try {
        const data = await fs.readFile('records.json', 'utf8');
        const records = JSON.parse(data);


        if (!Array.isArray(records)) {
            throw new Error('records.json must contain an array.');
        }

        return records;
    } catch (error) {
        // Create an empty file if there does not exist any
        if (error.code === 'ENOENT') {
            await fs.writeFile('records.json', '[]');
            console.log('records.json created successfully.');
            return [];
        }

        // checks invalid JSON
        if (error instanceof SyntaxError) {
            throw new Error('records.json contains invalid JSON.');
        }

        throw error;
    }
}

// Display all the records
async function ReadOP() {
    const records = await ReadRecords();
    console.log(records);
    return records;
}

// Find a record by its id and update its details
async function UpdateOP(id, newname) {
    const records = await ReadRecords();

    const Rindex = records.findIndex(record => record.id === id);

    if (Rindex !== -1) {
        records[Rindex] = { ...records[Rindex], ...newname };
    } else {
        console.log('Record not found.');
        return;
    }

    // Save the updated records
    await fs.writeFile(
        'records.json',
        JSON.stringify(records, null, 2)
    );
}

// Find a record by its id and remove it
async function DeleteOP(id) {
    const records = await ReadRecords();

    const Rindex = records.findIndex(record => record.id === id);

    if (Rindex !== -1) {
        records.splice(Rindex, 1);
    } else {
        console.log('Record not found.');
        return;
    }

    // Save the records after deletion
    await fs.writeFile(
        'records.json',
        JSON.stringify(records, null, 2)
    );
}

// Make the functions available to index js
module.exports = {
    CreateOP,
    ReadOP,
    UpdateOP,
    DeleteOP
};
