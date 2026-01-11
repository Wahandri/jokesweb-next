import dbConnect from '../lib/db.js';
import User from '../models/User.js';
import Joke from '../models/Joke.js';

async function test() {
    try {
        console.log('Connecting to DB...');
        await dbConnect();
        console.log('Connected to DB');

        // Create a dummy user
        const email = `testuser_${Date.now()}@example.com`;
        const user = await User.create({
            username: `testuser_${Date.now()}`,
            email: email,
            password: 'password123',
        });
        console.log('User created:', user.email);

        // Create a dummy joke
        const joke = await Joke.create({
            text: `Why did the developer go broke? Because he used up all his cache. ${Date.now()}`,
        });
        console.log('Joke created:', joke.text);

        // Clean up
        await User.deleteOne({ _id: user._id });
        await Joke.deleteOne({ _id: joke._id });
        console.log('Cleaned up test data');

        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

test();
