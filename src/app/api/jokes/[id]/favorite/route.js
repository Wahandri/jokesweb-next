import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Joke from "@/models/Joke";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { ok: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

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
