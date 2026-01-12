"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import styles from "./create-joke.module.css";

export default function CreateJokePage() {
    const [jokeText, setJokeText] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const { data: session, status } = useSession();

    if (status === "loading") return <p>Loading...</p>;
    if (!session) {
        router.push("/auth/login");
        return null;
    }

    const charLimit = 240;

    const handleTextAreaChange = (e) => {
        if (e.target.value.length <= charLimit) {
            setJokeText(e.target.value);
        }
    };

    const getCharCountColor = () => {
        const length = jokeText.length;
        if (length >= charLimit) return "red";
        if (length >= charLimit * 0.8) return "orange";
        return "green";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const res = await fetch("/api/jokes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: jokeText }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("¡Chiste creado con éxito!");
                setJokeText("");
                setTimeout(() => {
                    router.push("/");
                    router.refresh();
                }, 1500);
            } else {
                setError(data.error || "Error al crear el chiste");
            }
        } catch (err) {
            setError("Ocurrió un error. Inténtalo de nuevo.");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Añadir Chiste</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <textarea
                        className={styles.textarea}
                        rows={5}
                        placeholder="Escribe tu chiste aquí (máximo 240 caracteres)"
                        value={jokeText}
                        onChange={handleTextAreaChange}
                        required
                    />
                    <div className={styles.charCountContainer}>
                        <span
                            style={{
                                color: getCharCountColor(),
                                backgroundColor: "aliceblue",
                                borderRadius: "10px",
                                padding: "2px 8px",
                                fontWeight: "bold",
                            }}
                        >
                            {jokeText.length}/{charLimit}
                        </span>
                    </div>
                    {message && <p className={styles.success}>{message}</p>}
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit" className={styles.button}>
                        Añadir Chiste
                    </button>
                </form>
            </div>
        </div>
    );
}
