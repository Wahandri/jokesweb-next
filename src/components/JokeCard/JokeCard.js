"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import styles from "./JokeCard.module.css";

export default function JokeCard({ joke, isFavoriteInitial = false }) {
    const { data: session } = useSession();
    const [score, setScore] = useState(joke.score);
    const [userScore, setUserScore] = useState(
        joke.userScores?.find((s) => s.email === session?.user?.email)?.score || 0
    );
    const [isFavorite, setIsFavorite] = useState(isFavoriteInitial);

    // Calculate which score image to show based on average score
    const getScoreImage = (currentScore) => {
        if (currentScore < 1) return "/score0.png";
        if (currentScore < 2) return "/score1.png";
        if (currentScore < 3) return "/score2.png";
        if (currentScore < 4) return "/score3.png";
        return "/score4.png";
    };

    const handleVote = async (newScore) => {
        if (!session) return alert("Inicia sesión para votar");

        try {
            const res = await fetch(`/api/jokes/${joke._id}/score`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    score: newScore,
                    userEmail: session.user.email,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setScore(data.joke.score);
                setUserScore(newScore);
            }
        } catch (error) {
            console.error("Error voting:", error);
        }
    };

    const handleFavorite = async () => {
        if (!session) return alert("Inicia sesión para guardar favoritos");

        try {
            // Logic to toggle favorite would go here. 
            // For now, we just implement the add to favorite as per requirements for the star button.
            // If we want to toggle, we need to know if it's already a favorite.
            // The requirement says "Añade un botón de 'Favorito' ... que llame a la API /api/users/favorites"
            // But usually it's a toggle. Let's assume adding for now or check API.
            // The legacy API had /:id/favorite to add.
            // Wait, the plan said "GET /api/users/favorites". 
            // I need to check if I implemented a POST/PUT for favorites.
            // Looking back at step 93 (User Request), it said:
            // "GET /api/users/favorites: Devuelve la lista..."
            // It didn't explicitly ask for a POST endpoint for favorites in Step 3, but Step 5 says:
            // "Añade un botón de 'Favorito' ... que llame a la API /api/users/favorites."
            // This implies I might have missed creating the POST endpoint for favorites in Step 3?
            // Let me check my Step 3 work. 
            // I implemented GET /api/users/favorites.
            // I did NOT implement POST /api/users/favorites or POST /api/jokes/:id/favorite.
            // The user request in Step 3 was specific about endpoints to create.
            // But Step 5 asks for a button to call it. 
            // I should probably implement the API route for adding favorites if it's missing, or maybe I missed it in the prompt.
            // Re-reading Step 3 prompt: "GET /api/users/favorites ... Devuelve la lista...". It didn't ask for POST.
            // But Step 5 says: "Añade un botón de 'Favorito' ... que llame a la API /api/users/favorites."
            // This is slightly ambiguous. It likely means "call an API to add to favorites".
            // I will implement a server action or a new API route for adding favorites if needed, or just use the one I have if I can adapt it (unlikely for GET).
            // I will create a new route `src/app/api/jokes/[id]/favorite/route.js` to handle toggling favorites, similar to legacy.

            const res = await fetch(`/api/jokes/${joke._id}/favorite`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: session.user.id }), // Or just use session on server
            });

            if (res.ok) {
                setIsFavorite(!isFavorite); // Optimistic toggle
                alert("Favorito actualizado!");
            }
        } catch (error) {
            console.error("Error favorites:", error);
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.userInfo}>
                    <Image
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${joke.author}`}
                        alt={joke.author}
                        width={40}
                        height={40}
                        className={styles.avatar}
                    />
                    <div className={styles.userMeta}>
                        <span className={styles.author}>@{joke.author}</span>
                        <span className={styles.date}>2h ago</span>
                    </div>
                </div>
                <div className={styles.categoryTag}>
                    <span>Programming</span>
                </div>
            </div>

            <div className={styles.jokeContent}>
                <p className={styles.text}>{joke.text}</p>
            </div>

            <div className={styles.footer}>
                <div className={styles.rating}>
                    <div className={styles.stars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} style={{ color: star <= Math.round(score) ? '#FFD700' : '#E0E0E0' }}>★</span>
                        ))}
                    </div>
                    <span className={styles.scoreValue}>{score.toFixed(1)}</span>
                </div>

                <div className={styles.actions}>
                    {session && (
                        <button onClick={handleFavorite} className={styles.actionButton}>
                            <Image
                                src={isFavorite ? "/estrella.png" : "/emptyStarIcon.png"} // Ideally use SVGs or icons
                                alt="Favorite"
                                width={20}
                                height={20}
                            />
                        </button>
                    )}
                    <button className={styles.actionButton}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
