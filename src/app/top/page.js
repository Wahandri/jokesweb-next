import { getServerSession } from "next-auth";
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Joke from "@/models/Joke";
import User from "@/models/User";
import JokeCard from "@/components/JokeCard/JokeCard";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import styles from "./top.module.css";

export const dynamic = "force-dynamic";

export default async function TopJokesPage() {
    await dbConnect();
    const session = await getServerSession(authOptions);

    // Fetch top 10 jokes sorted by score descending
    const jokes = await Joke.find().sort({ score: -1 }).limit(10).lean();

    let userFavorites = [];
    if (session) {
        const user = await User.findOne({ email: session.user.email });
        if (user) {
            userFavorites = user.favoriteJokes.map((id) => id.toString());
        }
    }

    const serializedJokes = jokes.map((joke) => ({
        ...joke,
        _id: joke._id.toString(),
        userScores: joke.userScores?.map((s) => ({
            ...s,
            _id: s._id?.toString(),
        })) || [],
        createdAt: joke.createdAt?.toISOString(),
        updatedAt: joke.updatedAt?.toISOString(),
    }));

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>🏆 Top 10 Chistes 🏆</h1>
                <p className={styles.subtitle}>Los mejores chistes votados por la comunidad</p>
            </div>

            {serializedJokes.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>Aún no hay chistes en el ranking.</p>
                    <Link href="/create-joke" className={styles.createButton}>
                        ¡Sé el primero en crear uno!
                    </Link>
                </div>
            ) : (
                <div className={styles.grid}>
                    {serializedJokes.map((joke, index) => (
                        <div key={joke._id} className={styles.cardWrapper}>
                            <div className={styles.rank}>#{index + 1}</div>
                            <JokeCard
                                joke={joke}
                                isFavoriteInitial={userFavorites.includes(joke._id)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
