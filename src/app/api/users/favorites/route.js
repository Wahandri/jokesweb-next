import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Joke from "@/models/Joke";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { ok: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();

        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json(
                { ok: false, error: "User not found" },
                { status: 404 }
            );
        }

        const favoriteJokes = await Joke.find({
            _id: { $in: user.favoriteJokes },
        });

        return NextResponse.json({ ok: true, favoriteJokes });
    } catch (error) {
        console.error("Error fetching favorites:", error);
        return NextResponse.json(
            { ok: false, error: "Error fetching favorites" },
            { status: 500 }
        );
    }
}
