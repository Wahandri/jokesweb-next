import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import Joke from "@/models/Joke";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req, { params }) {
    try {
        const session = await getServerSession(authOptions);

        // Seguridad: Solo usuarios logueados pueden votar
        if (!session || !session.user) {
            return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const { id } = await params;
        const { score } = await req.json();
        // Usamos el email de la sesión por seguridad, no el que venga del body
        const userEmail = session.user.email;

        if (score === undefined || score < 1 || score > 5) {
            return NextResponse.json({ ok: false, error: "Puntuación inválida (1-5)" }, { status: 400 });
        }

        // Buscamos el chiste y poblamos el autor para que el frontend no pierda la info tras el guardado
        const joke = await Joke.findById(id).populate('author', 'username image');

        if (!joke) {
            return NextResponse.json({ ok: false, error: "Chiste no encontrado" }, { status: 404 });
        }

        // 1. Manejar userScores (votos individuales)
        const existingVoteIndex = joke.userScores.findIndex((s) => s.email === userEmail);

        if (existingVoteIndex !== -1) {
            joke.userScores[existingVoteIndex].score = score;
        } else {
            joke.userScores.push({ email: userEmail, score });
        }

        // 2. Sincronizar array de ratings para historial
        joke.ratings = joke.userScores.map(s => s.score);

        // 3. Recalcular media
        const totalScore = joke.ratings.reduce((acc, curr) => acc + curr, 0);
        const average = totalScore / joke.ratings.length;

        joke.averageRating = average;
        joke.score = average; // Sincronización para compatibilidad con JokeCard

        await joke.save();

        return NextResponse.json({ ok: true, message: "¡Voto registrado!", joke });
    } catch (error) {
        console.error("Error voting on joke:", error);
        return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
    }
}