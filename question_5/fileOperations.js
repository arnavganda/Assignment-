
const fs = require('fs/promises');
const path = require('path');

const filePath = path.join(__dirname, 'users.json');

async function readUsers() {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        const users = JSON.parse(data);

        if (!Array.isArray(users)) {
            throw new Error('Users data must be an array');
        }

        return users;
    } catch (error) {
        if (error.code === 'ENOENT') {
            await writeUsers([]);
            return [];
        }

        throw error;
    }
}

async function writeUsers(users) {
    await fs.writeFile(filePath, JSON.stringify(users, null, 2), 'utf8');
}

module.exports = {
    readUsers,
    writeUsers
};
