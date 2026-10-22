require('dotenv').config();

const { randomUUID } = require('crypto');
const { readUsers, writeUsers } = require('./fileOperations');
const { hashPassword } = require('./passwords');

async function seedUsers() {
    const accounts = [
        {
            username: process.env.ADMIN_USERNAME,
            password: process.env.ADMIN_PASSWORD,
            role: 'admin'
        },
        {
            username: process.env.USER_USERNAME,
            password: process.env.USER_PASSWORD,
            role: 'user'
        }
    ];

    for (const account of accounts) {
        if (!account.username || !account.password) {
            throw new Error('Set all account values in your .env file');
        }

        if (account.password.length < 12) {
            throw new Error('Use passwords of at least 12 characters');
        }
    }

    const users = await readUsers();

    for (const account of accounts) {
        const existingUser = users.find(
            user => user.username === account.username
        );

        if (existingUser) {
            console.log(`${account.username} already exists`);
            continue;
        }

        users.push({
            id: randomUUID(),
            username: account.username,
            password: await hashPassword(account.password),
            role: account.role
        });

        console.log(`Created ${account.role} account: ${account.username}`);
    }

    await writeUsers(users);
    console.log('User setup complete');
}

seedUsers().catch(error => {
    console.error('Could not create users:', error.message);
    process.exitCode = 1;
});