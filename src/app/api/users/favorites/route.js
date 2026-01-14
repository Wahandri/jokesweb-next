import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Joke from "@/models/Joke";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { serializeJokesWithAuthorAndScore } from "@/lib/serializeJokes";
import { jsonForbidden, jsonUnauthorized } from "@/lib/authGuard";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return jsonUnauthorized("No autenticado");
        }

        if (session.user?.emailVerified === false) {
            return jsonForbidden("Debes verificar tu email", "EMAIL_NOT_VERIFIED");
        }

        await dbConnect();

        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json(
                { ok: false, error: "User not found" },
                { status: 404 }
            );
        }

        const jokes = await Joke.find({
            _id: { $in: user.favoriteJokes },
        })
            .populate("author", "username image")
            .sort({ createdAt: -1 })
            .lean();

        const serializedFavorites = serializeJokesWithAuthorAndScore(jokes);

        return NextResponse.json(
            { ok: true, favoriteJokes: serializedFavorites },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching favorites:", error);
        return NextResponse.json(
            { ok: false, error: "Error fetching favorites" },
            { status: 500 }
        );
    }
}
