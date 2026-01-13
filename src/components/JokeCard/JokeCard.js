"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import styles from "./JokeCard.module.css";

export default function JokeCard({
    joke,
    isFavoriteInitial = false,
    onDelete = undefined,
    onFavoriteChange = undefined,
}) {
    const { data: session } = useSession();
    const [score, setScore] = useState(joke.score ?? 0);
    const [userScore, setUserScore] = useState(
        joke.userScores?.find((s) => s.email === session?.user?.email)?.score || 0
    );
    const [isFavorite, setIsFavorite] = useState(isFavoriteInitial);

    const [isSpeaking, setIsSpeaking] = useState(false);
    const [author, setAuthor] = useState(joke.author);
    const authorUsername = author?.username;
    const authorEmail = author?.email;
    const authorImage = author?.image;

    useEffect(() => {
        setAuthor(joke.author);
    }, [joke.author]);

    useEffect(() => {
        if (!session?.user || !author) return;

        const isCurrentUser =
            (authorUsername && authorUsername === session.user.username) ||
            (authorEmail && authorEmail === session.user.email);

        if (!isCurrentUser) return;

        const newImage = session.user.image;

        // Solo actualizamos si la imagen realmente cambia
        if (newImage && authorImage !== newImage) {
            setAuthor((prev) => ({
                ...prev,
                image: newImage,
            }));
        }
    }, [
        session?.user?.image,
        session?.user?.username,
        session?.user?.email,
        authorUsername,
        authorEmail,
        authorImage,
    ]);

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
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    score: newScore,
                    userEmail: session.user.email,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                const updatedJoke = data.joke;
                setScore(updatedJoke.averageRating ?? updatedJoke.score ?? 0);
                setUserScore(newScore);
                if (updatedJoke.author) {
                    setAuthor(updatedJoke.author);
                }
            }
        } catch (error) {
            console.error("Error voting:", error);
        }
    };

    const handleFavorite = async () => {
        if (!session) return alert("Inicia sesión para guardar favoritos");

        try {
            const res = await fetch(`/api/jokes/${joke._id}/favorite`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: session.user.id }),
            });

            if (res.ok) {
                const nextIsFavorite = !isFavorite;
                setIsFavorite(nextIsFavorite);
                if (typeof onFavoriteChange === "function") {
                    onFavoriteChange(joke._id, nextIsFavorite);
                }
                alert("Favorito actualizado!");
            }
        } catch (error) {
            console.error("Error favorites:", error);
        }
    };

    const handleSpeak = () => {
        if (!("speechSynthesis" in window)) return;

        window.speechSynthesis.cancel();

        if (isSpeaking) {
            setIsSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(joke.text);
        utterance.lang = "es-ES";
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const avatarUsername = author?.username || "Anonymous";

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.userInfo}>
                    <Image
                        src={
                            author?.image ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarUsername}`
                        }
                        alt={avatarUsername}
                        width={40}
                        height={40}
                        className={styles.avatar}
                        unoptimized
                    />
                    <div className={styles.userMeta}>
                        <span className={styles.author}>@{avatarUsername}</span>
                        <span className={styles.date}>
                            {new Date(joke.createdAt).toLocaleDateString("es-ES")}
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles.jokeContent}>
                <p className={styles.text}>{joke.text}</p>
            </div>

            <div className={styles.footer}>
                <div className={styles.rating}>
                    <div className={styles.stars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => handleVote(star)}
                                className={styles.starButton}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                                <span style={{ color: star <= Math.round(score) ? '#FFD700' : '#E0E0E0', fontSize: '1.2rem' }}>★</span>
                            </button>
                        ))}
                    </div>
                    <span className={styles.scoreValue}>{score.toFixed(1)}</span>
                    <span className={styles.emoji} style={{ fontSize: '1.5rem', marginLeft: '10px' }}>
                        {score < 1 ? '😕' : score < 2 ? '😐' : score < 3 ? '🙂' : score < 4 ? '🤭' : '😂'}
                    </span>
                </div>

                <div className={styles.actions}>
                    <button
                        onClick={handleSpeak}
                        className={`${styles.actionButton} ${isSpeaking ? styles.speaking : ''}`}
                        aria-label="Escuchar chiste"
                        title="Escuchar chiste"
                    >
                        {isSpeaking ? '🔊' : '🔈'}
                    </button>
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
                    {onDelete && (
                        <button
                            onClick={() => onDelete(joke._id)}
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            title="Eliminar chiste"
                        >
                            🗑️
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
