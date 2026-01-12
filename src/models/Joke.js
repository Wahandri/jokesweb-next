import mongoose from 'mongoose';

const JokeSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, "Text of joke is required"],
        unique: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    score: {
        type: Number,
        default: 0,
    },
    userScores: [
        {
            email: {
                type: String,
            },
            score: {
                type: Number,
                min: 0,
                max: 5,
            },
        },
    ],
});

// Check if the model is already defined to prevent overwriting during hot reloads
export default mongoose.models.Joke || mongoose.model('Joke', JokeSchema);
