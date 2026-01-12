import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import Joke from "@/models/Joke";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const sortByScore = searchParams.get("sortByScore") === "true";

        let query = Joke.find().populate('author', 'username image');

        if (sortByScore) {
            query = query.sort({ score: -1 }).limit(10);
        } else {
            query = query.sort({ createdAt: -1 }); // Default sort by newest
        }

        const jokes = await query.exec();

        return NextResponse.json({ ok: true, jokes });
    } catch (error) {
        console.error("Error fetching jokes:", error);
        return NextResponse.json(
            { ok: false, error: "Error fetching jokes" },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { ok: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();

        // Get user ID from DB using email if session.user.id is not reliable or to be safe
        // But we should rely on session if configured correctly.
        // Let's assume session.user.id is there (we will verify/ensure it).
        // If not, we fetch user.
        // Actually, let's fetch the user to be safe and get the _id.
        const User = (await import("@/models/User")).default;
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { text } = await req.json();

        if (!text) {
            return NextResponse.json(
                { ok: false, error: "Text is required" },
                { status: 400 }
            );
        }

        const joke = new Joke({
            text,
            author: user._id,
        });

        const savedJoke = await joke.save();

        return NextResponse.json({ ok: true, savedJoke }, { status: 201 });
    } catch (error) {
        console.error("Error creating joke:", error);
        return NextResponse.json(
            { ok: false, error: "Error creating joke" },
            { status: 500 }
        );
    }
}
