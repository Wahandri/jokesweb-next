import bcrypt from 'bcryptjs';

async function testHash() {
    const password = 'password123';
    const hash = await bcrypt.hash(password, 10);
    console.log('Password:', password);
    console.log('Hash:', hash);

    const match = await bcrypt.compare(password, hash);
    console.log('Match:', match);

    const noMatch = await bcrypt.compare('wrongpassword', hash);
    console.log('No Match:', noMatch);
}

testHash();
