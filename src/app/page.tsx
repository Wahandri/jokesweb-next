import { getServerSession } from "next-auth";
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Joke from "@/models/Joke";
import User from "@/models/User";
import JokeCard from "@/components/JokeCard/JokeCard";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import styles from "./page.module.css";

export const dynamic = "force-dynamic"; // Ensure fresh data on every request

export default async function Home() {
  await dbConnect();
  const session = await getServerSession(authOptions);

  // Fetch jokes sorted by creation date (newest first)
  const jokes = await Joke.find().sort({ createdAt: -1 }).lean();

  let userFavorites = [];
  if (session) {
    const user = await User.findOne({ email: session.user.email });
    if (user) {
      userFavorites = user.favoriteJokes.map((id: any) => id.toString());
    }
  }

  // Serialize the _id and other objectIds to strings for passing to client component
  const serializedJokes = jokes.map(joke => ({
    ...joke,
    _id: joke._id.toString(),
    userScores: joke.userScores?.map((s: any) => ({ ...s, _id: s._id?.toString() })) || [],
    createdAt: joke.createdAt?.toISOString(),
    updatedAt: joke.updatedAt?.toISOString(),
  }));

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Últimos Chistes</h1>
      {serializedJokes.length === 0 ? (
        <div className={styles.noJokes}>
          <p>No hay chistes todavía.</p>
          <Link href="/create-joke" className={styles.createButton}>
            ¡Sé el primero en crear uno!
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {serializedJokes.map((joke) => (
            <JokeCard
              key={joke._id}
              joke={joke}
              isFavoriteInitial={userFavorites.includes(joke._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
