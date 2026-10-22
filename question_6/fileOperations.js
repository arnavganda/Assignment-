const fs = require('fs/promises');
const path = require('path');

const filePath = path.join(__dirname, 'users.json');

async function readUsers() {
    let data;

    try {
        data = await fs.readFile(filePath, 'utf8');
    } catch (error) {
        if (error.code === 'ENOENT') {
            await writeUsers([]);
            return [];
        }

        throw error;
    }

    let users;

    try {
        users = JSON.parse(data);
    } catch (error) {
        throw new Error('users.json contains invalid JSON');
    }

    if (!Array.isArray(users)) {
        throw new Error('users.json must contain an array');
    }

    return users;
}

async function writeUsers(users) {
    await fs.writeFile(
        filePath,
        JSON.stringify(users, null, 2),
        'utf8'
    );
}

module.exports = {
    readUsers,
    writeUsers
};