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

  // 1. Definimos la query para la búsqueda
  const query = params.search ? { text: { $regex: params.search, $options: "i" } } : {};

  let jokes = [];
  try {
    // 2. Traemos los chistes y poblamos el autor para tener nombre y foto real de la DB
    jokes = await Joke.find(query)
      .populate('author', 'username image')
      .sort({ createdAt: -1 })
      .lean();
  } catch (error) {
    console.warn("Populate failed, falling back to basic fetch:", error);
    jokes = await Joke.find(query).sort({ createdAt: -1 }).lean();
  }

  let userFavorites: string[] = [];
  if (session?.user?.email) {
    const user = await User.findOne({ email: session.user.email });
    if (user) {
      userFavorites = user.favoriteJokes.map((id: any) => id.toString());
    }
  }

  // 3. SERIALIZACIÓN PROFUNDA: Limpieza total de objetos de MongoDB
  // Usamos JSON.parse(JSON.stringify()) para convertir ObjectIDs y Buffers en texto plano
  const plainJokes = JSON.parse(JSON.stringify(jokes));

  const serializedJokes = plainJokes.map((joke: any) => {
    // 4. Lógica para manejar autores (Nuevos con ID / Antiguos con String)
    let authorObj = {
      username: 'Anónimo',
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=fallback`
    };

    if (joke.author) {
      if (typeof joke.author === 'object' && joke.author.username) {
        // Caso Ideal: Usuario poblado correctamente
        authorObj = {
          username: joke.author.username,
          image: joke.author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${joke.author.username}`
        };
      } else if (typeof joke.author === 'string') {
        // Caso Legacy: El autor era solo un nombre escrito
        authorObj = {
          username: joke.author,
          image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${joke.author}`
        };
      }
    }

    return {
      ...joke,
      author: authorObj,
      // Sincronizamos la puntuación para las estrellas del frontend
      score: joke.averageRating || joke.score || 0,
    };
  });

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