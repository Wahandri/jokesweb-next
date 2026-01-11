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

        let query = Joke.find();

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

        const { text } = await req.json();

        if (!text) {
            return NextResponse.json(
                { ok: false, error: "Text is required" },
                { status: 400 }
            );
        }

        const joke = new Joke({
            text,
            author: session.user.name || "Anonymous", // Use session user name
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
