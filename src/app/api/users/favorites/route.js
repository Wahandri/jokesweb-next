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

        const jokes = await Joke.find({
            _id: { $in: user.favoriteJokes },
        })
            .populate("author", "username image")
            .sort({ createdAt: -1 })
            .lean();

        const serializedFavorites = jokes.map((joke) => {
            let authorObj = {
                username: "Anónimo",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback",
            };

            if (joke.author) {
                if (typeof joke.author === "string") {
                    authorObj = {
                        username: joke.author,
                        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${joke.author}`,
                    };
                } else if (joke.author.username) {
                    authorObj = {
                        username: joke.author.username,
                        image:
                            joke.author.image ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${joke.author.username}`,
                    };
                }
            }

            return {
                ...joke,
                author: authorObj,
                score: joke.averageRating || joke.score || 0,
            };
        });

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
