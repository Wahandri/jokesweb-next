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
                <h1 className={styles.title}>Crear Nuevo Chiste</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <p className={styles.error}>{error}</p>}
                    <div className={styles.inputGroup}>
                        <label htmlFor="text">Escribe tu chiste aquí:</label>
                        <textarea
                            id="text"
                            value={jokeText}
                            onChange={handleTextAreaChange}
                            required
                            className={styles.textarea}
                            placeholder="¿Por qué el desarrollador cruzó la calle?..."
                            rows={5}
                        />
                        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: getCharCountColor() }}>
                            {jokeText.length}/{charLimit}
                        </div>
                    </div>
                    <button type="submit" className={styles.button}>
                        Publicar Chiste
                    </button>
                </form>
            </div>
        </div>
    );
}
