"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import JokeCard from "@/components/JokeCard/JokeCard";
import styles from "./favorites.module.css";

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { data: session, status } = useSession();

    const handleFavoriteChange = (jokeId, isNowFavorite) => {
        if (!isNowFavorite) {
            setFavorites((prev) => prev.filter((j) => j._id !== jokeId));
        }
    };

    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            router.push("/auth/login");
            return;
        }

        const fetchFavorites = async () => {
            try {
                const res = await fetch("/api/users/favorites");
                if (res.ok) {
                    const data = await res.json();
                    setFavorites(data.favoriteJokes);
                }
            } catch (error) {
                console.error("Error fetching favorites:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [session, status, router]);

    if (status === "loading" || loading) {
        return (
            <div className={styles.loadingContainer}>
                <p>Cargando favoritos...</p>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Mis Chistes Favoritos</h1>
            {favorites.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>Aún no tienes chistes favoritos.</p>
                    <p>¡Explora la lista y guarda los que más te gusten!</p>
                    <Link href="/" className={styles.createButton}>
                        Ver chistes
                    </Link>
                </div>
            ) : (
                <div className={styles.grid}>
                    {favorites.map((joke) => (
                        <JokeCard
                            key={joke._id}
                            joke={joke}
                            isFavoriteInitial={true}
                            onFavoriteChange={handleFavoriteChange}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
