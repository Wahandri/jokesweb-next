import dbConnect from "@/lib/mongodb";
import Joke from "@/models/Joke";
import JokeCard from "@/components/JokeCard/JokeCard";
import styles from "./page.module.css";

export const dynamic = "force-dynamic"; // Ensure fresh data on every request

export default async function Home() {
  await dbConnect();

  // Fetch jokes sorted by creation date (newest first)
  const jokes = await Joke.find().sort({ createdAt: -1 }).lean();

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
        <p className={styles.noJokes}>No hay chistes todavía. ¡Sé el primero en crear uno!</p>
      ) : (
        <div className={styles.grid}>
          {serializedJokes.map((joke) => (
            <JokeCard key={joke._id} joke={joke} />
          ))}
        </div>
      )}
    </div>
  );
}
