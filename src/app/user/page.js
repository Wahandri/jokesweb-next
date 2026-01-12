"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import JokeCard from "@/components/JokeCard/JokeCard";
import styles from "./user.module.css";

export default function UserProfile() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [jokes, setJokes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [userData, setUserData] = useState(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        } else if (status === "authenticated") {
            fetchData();
        }
    }, [status, router]);

    const fetchData = async () => {
        try {
            // Fetch user jokes
            const jokesRes = await fetch("/api/jokes");
            if (jokesRes.ok) {
                const allJokes = await jokesRes.json();
                const myJokes = allJokes.filter(joke =>
                    (joke.author?.username === session.user.name) ||
                    (joke.author === session.user.name) // Fallback if not populated (though it should be)
                );
                setJokes(myJokes);
            }

            // Fetch user data (role, score, etc.) - Assuming we might need a specific endpoint or just rely on session if updated.
            // But the requirement says "realiza una consulta (fetch) a la base de datos para mostrar los datos más recientes".
            // We don't have a specific /api/users/me endpoint. 
            // However, we can use the session data if we trust it's fresh enough (it is updated on login).
            // But to be "fresh", we should ideally fetch it.
            // Since we don't have a user endpoint, I will create a simple one or just use the session for now if I can't create a new route easily without plan approval.
            // Wait, I can create a new route /api/users/me if I want to be thorough.
            // Or I can use the existing /api/users/favorites (which returns favorites) to maybe piggyback? No.
            // Let's check if I can just use the session. The prompt says "realiza una consulta (fetch) a la base de datos".
            // This implies I SHOULD fetch.
            // I'll create a new route `src/app/api/users/me/route.js` to get current user details.
            // But first, let me check if I can just use the session for now to avoid creating too many files if not strictly needed.
            // Actually, the prompt is explicit: "realiza una consulta (fetch) a la base de datos".
            // So I will create `src/app/api/users/me/route.js`.

            const userRes = await fetch("/api/users/me");
            if (userRes.ok) {
                const data = await userRes.json();
                setUserData(data);
            } else {
                // Fallback to session if API fails or doesn't exist yet (I need to create it)
                setUserData(session.user);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Estás seguro de que quieres eliminar este chiste?")) return;

        try {
            const res = await fetch(`/api/jokes/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setJokes(jokes.filter(joke => joke._id !== id));
                alert("Chiste eliminado correctamente.");
            } else {
                alert("Error al eliminar el chiste.");
            }
        } catch (error) {
            console.error("Error deleting joke:", error);
            alert("Error al eliminar el chiste.");
        }
    };

    if (status === "loading" || loading) {
        return <div className={styles.container}><p>Cargando perfil...</p></div>;
    }

    if (!session) return null;

    const totalScore = jokes.reduce((acc, joke) => acc + (joke.score || 0), 0);

    const displayUser = userData || session.user;

    const [avatarConfig, setAvatarConfig] = useState({
        seed: displayUser.username || "user",
        accessories: "round",
        top: "shortHair",
        clothing: "hoodie"
    });

    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarConfig.seed}&accessories=${avatarConfig.accessories}&top=${avatarConfig.top}&clothing=${avatarConfig.clothing}`;
        setPreviewUrl(url);
    }, [avatarConfig]);

    const handleConfigChange = (key, value) => {
        setAvatarConfig(prev => ({ ...prev, [key]: value }));
    };

    const saveAvatar = async () => {
        try {
            const res = await fetch("/api/users/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: previewUrl }),
            });

            if (res.ok) {
                const data = await res.json();
                setUserData(data.user);
                await update({ image: previewUrl }); // Update session
                alert("Avatar actualizado correctamente!");
            } else {
                alert("Error al actualizar el avatar");
            }
        } catch (error) {
            console.error("Error updating avatar:", error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.profileCard}>
                <div className={styles.avatarContainer}>
                    <Image
                        src={previewUrl || displayUser.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayUser.username}`}
                        alt={displayUser.username || displayUser.name}
                        width={150}
                        height={150}
                        className={styles.avatar}
                        priority
                    />
                </div>

                <div className={styles.userInfo}>
                    <h1 className={styles.userName}>{displayUser.username || displayUser.name}</h1>
                    <p className={styles.userEmail}>{displayUser.email}</p>
                    {displayUser.role && <p className={styles.userRole}>Rol: {displayUser.role}</p>}
                </div>

                <div className={styles.configurator}>
                    <h3 className={styles.configTitle}>Personaliza tu Avatar</h3>

                    <div className={styles.configSection}>
                        <label>Accesorios:</label>
                        <div className={styles.options}>
                            {["round", "sunglasses", "kurt", "prescription01", "none"].map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => handleConfigChange("accessories", opt)}
                                    className={`${styles.optionBtn} ${avatarConfig.accessories === opt ? styles.active : ''}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.configSection}>
                        <label>Pelo:</label>
                        <div className={styles.options}>
                            {["shortHair", "longHair", "mohawk", "curly", "bald"].map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => handleConfigChange("top", opt)}
                                    className={`${styles.optionBtn} ${avatarConfig.top === opt ? styles.active : ''}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.configSection}>
                        <label>Ropa:</label>
                        <div className={styles.options}>
                            {["hoodie", "blazer", "sweater", "shirt", "overall"].map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => handleConfigChange("clothing", opt)}
                                    className={`${styles.optionBtn} ${avatarConfig.clothing === opt ? styles.active : ''}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button onClick={saveAvatar} className={styles.saveButton}>
                        Guardar Avatar
                    </button>
                </div>

                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{jokes.length}</span>
                        <span className={styles.statLabel}>Chistes</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{totalScore.toFixed(1)}</span>
                        <span className={styles.statLabel}>Puntos Totales</span>
                    </div>
                </div>

                <button onClick={() => signOut({ callbackUrl: '/' })} className={styles.logoutButton}>
                    Cerrar Sesión
                </button>
            </div>

            <h2 className={styles.sectionTitle}>Mis Chistes</h2>

            {jokes.length === 0 ? (
                <div className={styles.emptyState}>
                    <p className={styles.emptyText}>Aún no has hecho reír a nadie. ¡Crea tu primer chiste!</p>
                    <Link href="/create-joke" className={styles.createButton}>
                        Crear Chiste
                    </Link>
                </div>
            ) : (
                <div className={styles.grid}>
                    {jokes.map((joke) => (
                        <JokeCard
                            key={joke._id}
                            joke={joke}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
