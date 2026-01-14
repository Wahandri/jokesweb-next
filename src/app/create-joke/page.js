"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import styles from "./create-joke.module.css";
import Modal from "@/components/Modal/Modal";

export default function CreateJokePage() {
    const [jokeText, setJokeText] = useState("");
    const [modal, setModal] = useState({
        open: false,
        title: "",
        message: "",
        variant: "info",
    });
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            router.push("/auth/login");
            return;
        }
        if (session.user?.emailVerified === false) {
            router.push("/verify-required");
        }
    }, [session, status, router]);

    if (status === "loading") return <p>Loading...</p>;
    if (!session || session.user?.emailVerified === false) {
        return null;
    }

    const charLimit = 240;

    const showModal = (title, message, variant = "info") => {
        setModal({ open: true, title, message, variant });
    };

    const closeModal = () => {
        setModal((prev) => ({ ...prev, open: false }));
    };

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

        try {
            const res = await fetch("/api/jokes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: jokeText }),
            });

            const data = await res.json();

            if (res.ok) {
                showModal(
                    "¡Chiste publicado!",
                    "Tu chiste se creó con éxito.",
                    "success"
                );
                setJokeText("");
                setTimeout(() => {
                    router.push("/");
                    router.refresh();
                }, 1500);
            } else {
                showModal(
                    "No se pudo crear el chiste",
                    data.error || "Inténtalo de nuevo más tarde.",
                    "error"
                );
            }
        } catch (err) {
            showModal(
                "Error inesperado",
                "Ocurrió un error. Inténtalo de nuevo.",
                "error"
            );
        }
    };

    return (
        <>
            <div className={styles.container}>
                <div className={styles.card}>
                    <h1 className={styles.title}>Crear Nuevo Chiste</h1>
                    <form onSubmit={handleSubmit} className={styles.form}>
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
            <Modal
                open={modal.open}
                title={modal.title}
                message={modal.message}
                variant={modal.variant}
                onClose={closeModal}
            />
        </>
    );
}
