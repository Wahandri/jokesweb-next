import mongoose from 'mongoose';

const JokeSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, "El texto del chiste es obligatorio"],
        unique: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referencia al modelo User para el populate
        required: true,
    },
    score: {
        type: Number,
        default: 0, // Se usará para mostrar la media rápida
    },
    averageRating: {
        type: Number,
        default: 0, // Media calculada de ratings[]
    },
    ratings: {
        type: [Number],
        default: [], // Array con todos los votos numéricos
    },
    userScores: [
        {
            email: String,
            score: Number,
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Joke || mongoose.model('Joke', JokeSchema);