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

  let jokes = [];
  try {
    jokes = await Joke.find(query).populate('author', 'username image').sort({ createdAt: -1 }).lean();
  } catch (error) {
    console.warn("Populate failed, falling back to basic fetch:", error);
    try {
      jokes = await Joke.find(query).sort({ createdAt: -1 }).lean();
    } catch (innerError) {
      console.error("Critical error fetching jokes:", innerError);
    }
  }

  let userFavorites: string[] = [];
  if (session && session.user && session.user.email) {
    const user = await User.findOne({ email: session.user.email });
    if (user) {
      userFavorites = user.favoriteJokes.map((id: any) => id.toString());
    }
  }

  // Serialize the _id and other objectIds to strings for passing to client component
  const serializedJokes = jokes.map((joke: any) => {
    // Handle author: could be populated object, ObjectId string, or legacy username string
    let authorObj = {
      _id: 'unknown',
      username: 'Anonymous',
      image: null
    };

    if (joke.author) {
      if (typeof joke.author === 'object' && joke.author.username) {
        // Populated object
        authorObj = {
          _id: joke.author._id ? joke.author._id.toString() : 'unknown',
          username: joke.author.username,
          image: joke.author.image || null
        };
      } else if (typeof joke.author === 'string') {
        // Legacy string (username) or ObjectId string
        // If it looks like an ObjectId, we might not have the username, so default to Anonymous or try to guess?
        // But based on the error "Wahandri", it's a username.
        // We can assume it's the username.
        authorObj.username = joke.author;
        // Generate DiceBear URL if image is missing (JokeCard handles this fallback too, but good to be explicit if needed)
      }
    }

    return {
      ...joke,
      _id: joke._id.toString(),
      author: authorObj,
      userScores: joke.userScores?.map((s: any) => ({ ...s, _id: s._id?.toString() })) || [],
      ratings: joke.ratings || [],
      createdAt: joke.createdAt?.toISOString(),
      updatedAt: joke.updatedAt?.toISOString(),
    };
  });

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
