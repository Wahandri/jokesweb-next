import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import Joke from "@/models/Joke";
import User from "@/models/User";
import JokeCard from "@/components/JokeCard/JokeCard";
import Hero from "@/components/Hero/Hero";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const params = await searchParams;

  // Fetch jokes sorted by creation date (newest first)
  let query = {};
  if (params.search) {
    query = { text: { $regex: params.search, $options: "i" } };
  }
  const jokes = await Joke.find(query).sort({ createdAt: -1 }).lean();

  let userFavorites: string[] = [];
  if (session && session.user && session.user.email) {
    const user = await User.findOne({ email: session.user.email });
    if (user) {
      userFavorites = user.favoriteJokes.map((id: any) => id.toString());
    }
  }

  // Serialize the _id and other objectIds to strings for passing to client component
  const serializedJokes = jokes.map((joke: any) => ({
    ...joke,
    _id: joke._id.toString(),
    userScores: joke.userScores?.map((s: any) => ({ ...s, _id: s._id?.toString() })) || [],
    createdAt: joke.createdAt?.toISOString(),
    updatedAt: joke.updatedAt?.toISOString(),
  }));

  return (
    <div>
      <Hero />
      <div className={styles.grid}>
        {serializedJokes.map((joke) => (
          <JokeCard
            key={joke._id}
            joke={joke}
            isFavoriteInitial={userFavorites.includes(joke._id)}
          />
        ))}
      </div>
    </div>
  );
}
