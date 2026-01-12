import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Joke from "@/models/Joke";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import UserProfileClient from "./UserProfileClient";

export const dynamic = "force-dynamic";

export default async function UserProfile() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    await dbConnect();

    // Fetch User
    const user = await User.findOne({ email: session.user.email }).lean();

    if (!user) {
        // Handle edge case where session exists but user not in DB (shouldn't happen)
        redirect("/auth/login");
    }

    // Fetch Jokes by Author ID
    const jokes = await Joke.find({ author: user._id }).sort({ createdAt: -1 }).lean();

    // Deep Serialization
    const serializedUser = JSON.parse(JSON.stringify({
        ...user,
        _id: user._id.toString(),
        favoriteJokes: user.favoriteJokes?.map(id => id.toString()) || []
    }));

    const serializedJokes = JSON.parse(JSON.stringify(jokes)).map(joke => ({
        ...joke,
        _id: joke._id.toString(),
        author: {
            _id: user._id.toString(),
            username: user.username,
            image: user.image
        },
        userScores: joke.userScores?.map(s => ({ ...s, _id: s._id?.toString() })) || [],
        ratings: joke.ratings || [],
        createdAt: joke.createdAt?.toString(), // JSON.stringify handles dates but explicit is safer if needed
        updatedAt: joke.updatedAt?.toString()
    }));

    return (
        <UserProfileClient
            user={serializedUser}
            jokes={serializedJokes}
        />
    );
}
