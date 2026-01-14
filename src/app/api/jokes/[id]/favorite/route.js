import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Joke from "@/models/Joke";
import {
    getVerifiedSessionOrNull,
    jsonForbidden,
    jsonUnauthorized,
} from "@/lib/authGuard";

export async function POST(req, { params }) {
    try {
        const sessionResult = await getVerifiedSessionOrNull();

        if (!sessionResult) {
            return jsonUnauthorized("No autenticado");
        }

        if (sessionResult.error === "EMAIL_NOT_VERIFIED") {
            return jsonForbidden("Debes verificar tu email", "EMAIL_NOT_VERIFIED");
        }

        if (!sessionResult.user) {
            return jsonUnauthorized("No autenticado");
        }

        const session = sessionResult;

        await dbConnect();

        const { id } = await params;
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json(
                { ok: false, error: "User not found" },
                { status: 404 }
            );
        }

        const joke = await Joke.findById(id);
        if (!joke) {
            return NextResponse.json({ ok: false, error: "Joke not found" }, { status: 404 });
        }

        // Toggle favorite
        const isFavorite = user.favoriteJokes.includes(id);

        if (isFavorite) {
            user.favoriteJokes = user.favoriteJokes.filter((favId) => favId.toString() !== id);
        } else {
            user.favoriteJokes.push(id);
        }

        await user.save();

        return NextResponse.json({ ok: true, isFavorite: !isFavorite, favoriteJokes: user.favoriteJokes });
    } catch (error) {
        console.error("Error toggling favorite:", error);
        return NextResponse.json(
            { ok: false, error: "Error toggling favorite" },
            { status: 500 }
        );
    }
}
