import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import Joke from "@/models/Joke";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(req, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { ok: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();

        const { id } = await params; // Next.js 15+ params are async
        const { score, userEmail } = await req.json();

        if (score === undefined || score < 0 || score > 5) {
            return NextResponse.json(
                { ok: false, error: "Invalid score (must be 0-5)" },
                { status: 400 }
            );
        }

        const joke = await Joke.findById(id);

        if (!joke) {
            return NextResponse.json(
                { ok: false, error: "Joke not found" },
                { status: 404 }
            );
        }

        // Check if user has already voted
        const existingVoteIndex = joke.userScores.findIndex(
            (s) => s.email === userEmail
        );

        if (existingVoteIndex !== -1) {
            // Update existing vote
            joke.userScores[existingVoteIndex].score = score;
        } else {
            // Add new vote
            joke.userScores.push({ email: userEmail, score });
        }

        // Recalculate average score
        const totalScore = joke.userScores.reduce((acc, curr) => acc + curr.score, 0);
        joke.score = totalScore / joke.userScores.length;

        await joke.save();

        return NextResponse.json({ ok: true, message: "Vote recorded", joke });
    } catch (error) {
        console.error("Error voting on joke:", error);
        return NextResponse.json(
            { ok: false, error: "Error voting on joke" },
            { status: 500 }
        );
    }
}
