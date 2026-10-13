
const {
    CreateOP,
    ReadOP,
    UpdateOP,
    DeleteOP
} = require('./operations.js');

async function main() {
    const initialRecords = [
        {
            id: 1,
            name: 'Arnav',
            email: 'arnav@tekmonks.com',
            gender: 'male'
        },
        {
            id: 2,
            name: 'ronaldo',
            email: 'ronaldo@tekmonks.com',
            gender: 'male'
        }
    ];

    // Reset records every run
    await CreateOP(initialRecords);

    console.log('\nInitial records:');
    await ReadOP();

    // Update Ronaldo
    await UpdateOP(2, {
        name: 'Cristiano Ronaldo',
        email: 'cristiano@tekmonks.com'
    });

    console.log('\nAfter update:');
    await ReadOP();

    // Delete Ronaldo
    await DeleteOP(2);

    console.log('\nAfter delete:');
    await ReadOP();
}

main().catch(error => {
    console.error('An error occurred:', error.message);
});
