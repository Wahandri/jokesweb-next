import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import Joke from "@/models/Joke";
import User from "@/models/User";
import JokeCard from "@/components/JokeCard/JokeCard";
import Hero from "@/components/Hero/Hero";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { serializeJokesWithAuthorAndScore } from "@/lib/serializeJokes";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const params = await searchParams;

  // 1. Definimos la query para la búsqueda
  const query = params.search ? { text: { $regex: params.search, $options: "i" } } : {};

  // 2. Query dividida: ObjectId vs string en author
  // Query 1: chistes con author ObjectId → se pueden popular
  const jokesWithObjectId = await Joke.find({
    ...query,
    author: { $type: 'objectId' }
  })
    .populate('author', 'username image')
    .lean();

  // Query 2: chistes con author string → NO se intenta popular
  const jokesWithString = await Joke.find({
    ...query,
    author: { $type: 'string' }
  })
    .lean();

  // 3. Unimos ambos arrays y ordenamos por createdAt en memoria
  const jokes = [...jokesWithObjectId, ...jokesWithString].sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  let userFavorites: string[] = [];
  if (session?.user?.email) {
    const user = await User.findOne({ email: session.user.email });
    if (user) {
      userFavorites = user.favoriteJokes.map((id: any) => id.toString());
    }
  }

  const serializedJokes = serializeJokesWithAuthorAndScore(jokes);

  return (
    <div className={styles.container}>
      <Hero />
      <div className={styles.grid}>
        {serializedJokes.length > 0 ? (
          serializedJokes.map((joke: any) => (
            <JokeCard
              key={joke._id}
              joke={joke}
              isFavoriteInitial={userFavorites.includes(joke._id)}
            />
          ))
        ) : (
          <p className={styles.noJokes}>No hay chistes que mostrar.</p>
        )}
      </div>
    </div>
  );
}
