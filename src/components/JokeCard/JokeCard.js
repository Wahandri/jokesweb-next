"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import styles from "./JokeCard.module.css";

export default function JokeCard({ joke }) {
    const { data: session } = useSession();
    const [score, setScore] = useState(joke.score);
    const [userScore, setUserScore] = useState(
        joke.userScores?.find((s) => s.email === session?.user?.email)?.score || 0
    );
    const [isFavorite, setIsFavorite] = useState(false); // Initial state should ideally come from props if possible, but for now we might fetch or just toggle

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
                <span className={styles.author}>Autor: {joke.author}</span>
                {session && (
                    <button onClick={handleFavorite} className={styles.favButton}>
                        <Image src="/estrella.png" alt="Favorite" width={24} height={24} />
                    </button>
                )}
            </div>

            <p className={styles.text}>{joke.text}</p>

            <div className={styles.footer}>
                <div className={styles.scoreContainer}>
                    <Image
                        src={getScoreImage(score)}
                        alt={`Score: ${score}`}
                        width={100}
                        height={20}
                        className={styles.scoreImage}
                    />
                    <div className={styles.voting}>
                        {[1, 2, 3, 4, 5].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleVote(num)}
                                className={`${styles.voteBtn} ${userScore === num ? styles.selected : ''}`}
                                title={`Votar ${num}`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
