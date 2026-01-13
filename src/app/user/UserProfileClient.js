"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { genConfig } from "react-nice-avatar";
import JokeCard from "@/components/JokeCard/JokeCard";
import UserAvatar from "@/components/UserAvatar/UserAvatar";
import styles from "./user.module.css";

export default function UserProfileClient({ user, jokes }) {
    const { update } = useSession();
    const [userData, setUserData] = useState(user);
    const [userJokes, setUserJokes] = useState(jokes);
    const [username, setUsername] = useState(user.username || "");
    const [avatarConfig, setAvatarConfig] = useState(() => {
        if (user.avatarConfig && Object.keys(user.avatarConfig).length > 0) {
            return user.avatarConfig;
        }
        return genConfig(user.username || "Usuario");
    });

    useEffect(() => {
        setUserData(user);
        setUserJokes(jokes);
        setUsername(user.username || "");
        if (user.avatarConfig && Object.keys(user.avatarConfig).length > 0) {
            setAvatarConfig(user.avatarConfig);
        }
    }, [user, jokes]);

    const totalScore = userJokes.reduce((acc, joke) => acc + (joke.score || 0), 0);
    const averageRating = userJokes.length > 0 ? (totalScore / userJokes.length).toFixed(1) : "0.0";

    const handleAvatarChange = (field, value) => {
        setAvatarConfig((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const saveProfile = async () => {
        try {
            const res = await fetch("/api/users/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: username.trim() || userData.username,
                    avatarConfig,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setUserData(data.user);
                setUserJokes((prev) =>
                    prev.map((j) =>
                        j.author &&
                        (j.author._id === data.user._id ||
                            j.author.username === data.user.username ||
                            j.author.username === userData.username)
                            ? {
                                ...j,
                                author: {
                                    ...j.author,
                                    username: data.user.username,
                                    avatarConfig: avatarConfig,
                                },
                            }
                            : j
                    )
                );
                await update({ avatarConfig });
                alert("Perfil actualizado correctamente!");
            } else {
                alert("Error al actualizar el perfil");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error al actualizar el perfil");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Estás seguro de que quieres eliminar este chiste?")) return;

        try {
            const res = await fetch(`/api/jokes/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setUserJokes(userJokes.filter((joke) => joke._id !== id));
                alert("Chiste eliminado correctamente.");
            } else {
                alert("Error al eliminar el chiste.");
            }
        } catch (error) {
            console.error("Error deleting joke:", error);
            alert("Error al eliminar el chiste.");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.dashboard}>
                <div className={styles.profileCard}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatarContainer}>
                            <UserAvatar
                                username={userData.username}
                                avatarConfig={avatarConfig}
                                size={150}
                                className={styles.avatar}
                                shape={avatarConfig.shape || "circle"}
                            />
                        </div>
                        <div className={styles.userInfo}>
                            <h1 className={styles.userName}>{userData.username}</h1>
                            <p className={styles.userEmail}>{userData.email}</p>
                            <div className={styles.statsRow}>
                                <div className={styles.statBadge}>
                                    <span className={styles.statValue}>{userJokes.length}</span>
                                    <span className={styles.statLabel}>Chistes</span>
                                </div>
                                <div className={styles.statBadge}>
                                    <span className={styles.statValue}>{averageRating}</span>
                                    <span className={styles.statLabel}>Media</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.configurator}>
                        <h3 className={styles.configTitle}>Personaliza tu Avatar</h3>
                        <div className={styles.configSection}>
                            <label>Nombre de usuario</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={styles.select}
                            />
                        </div>
                        <div className={styles.configGrid}>
                            <div className={styles.configSection}>
                                <label>Sexo</label>
                                <select
                                    value={avatarConfig.sex || "man"}
                                    onChange={(e) => handleAvatarChange("sex", e.target.value)}
                                    className={styles.select}
                                >
                                    <option value="man">Hombre</option>
                                    <option value="woman">Mujer</option>
                                </select>
                            </div>
                            <div className={styles.configSection}>
                                <label>Pelo</label>
                                <select
                                    value={avatarConfig.hairStyle || "normal"}
                                    onChange={(e) => handleAvatarChange("hairStyle", e.target.value)}
                                    className={styles.select}
                                >
                                    <option value="normal">Normal</option>
                                    <option value="thick">Denso</option>
                                    <option value="mohawk">Cresta</option>
                                    <option value="womanLong">Largo</option>
                                    <option value="womanShort">Corto</option>
                                </select>
                            </div>
                            <div className={styles.configSection}>
                                <label>Gafas</label>
                                <select
                                    value={avatarConfig.glassesStyle || "none"}
                                    onChange={(e) => handleAvatarChange("glassesStyle", e.target.value)}
                                    className={styles.select}
                                >
                                    <option value="none">Sin gafas</option>
                                    <option value="round">Redondas</option>
                                    <option value="square">Cuadradas</option>
                                </select>
                            </div>
                            <div className={styles.configSection}>
                                <label>Camiseta</label>
                                <select
                                    value={avatarConfig.shirtStyle || "hoody"}
                                    onChange={(e) => handleAvatarChange("shirtStyle", e.target.value)}
                                    className={styles.select}
                                >
                                    <option value="hoody">Sudadera</option>
                                    <option value="short">Camiseta</option>
                                    <option value="polo">Polo</option>
                                </select>
                            </div>
                            <div className={styles.configSection}>
                                <label>Forma</label>
                                <select
                                    value={avatarConfig.shape || "circle"}
                                    onChange={(e) => handleAvatarChange("shape", e.target.value)}
                                    className={styles.select}
                                >
                                    <option value="circle">Circular</option>
                                    <option value="rounded">Redondeado</option>
                                    <option value="square">Cuadrado</option>
                                </select>
                            </div>
                            <div className={styles.configSection}>
                                <label>Color de pelo</label>
                                <input
                                    type="color"
                                    value={avatarConfig.hairColor || "#000000"}
                                    onChange={(e) => handleAvatarChange("hairColor", e.target.value)}
                                    className={styles.select}
                                />
                            </div>
                            <div className={styles.configSection}>
                                <label>Color de camiseta</label>
                                <input
                                    type="color"
                                    value={avatarConfig.shirtColor || "#92A1C6"}
                                    onChange={(e) => handleAvatarChange("shirtColor", e.target.value)}
                                    className={styles.select}
                                />
                            </div>
                            <div className={styles.configSection}>
                                <label>Fondo</label>
                                <input
                                    type="color"
                                    value={avatarConfig.bgColor || "#FFFFFF"}
                                    onChange={(e) => handleAvatarChange("bgColor", e.target.value)}
                                    className={styles.select}
                                />
                            </div>
                        </div>

                        <div className={styles.previewContainer}>
                            <p className={styles.previewLabel}>Vista Previa:</p>
                            <UserAvatar
                                username={userData.username}
                                avatarConfig={avatarConfig}
                                size={80}
                                className={styles.miniPreview}
                                shape={avatarConfig.shape || "circle"}
                            />
                        </div>

                        <button onClick={saveProfile} className={styles.saveButton}>
                            Guardar Nuevo Look
                        </button>
                    </div>

                    <button onClick={() => signOut({ callbackUrl: '/' })} className={styles.logoutButton}>
                        Cerrar Sesión
                    </button>
                </div>

                <div className={styles.jokesSection}>
                    <h2 className={styles.sectionTitle}>Mis Chistes Publicados</h2>
                    {userJokes.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p className={styles.emptyText}>Aún no has publicado ningún chiste.</p>
                            <Link href="/create-joke" className={styles.createButton}>
                                ¡Publicar el primero!
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {userJokes.map((joke) => (
                                <JokeCard
                                    key={joke._id}
                                    joke={joke}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
