"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import BeanHeadDefault, { BeanHead as BeanHeadNamed } from "beanheads";
import JokeCard from "@/components/JokeCard/JokeCard";
import genBeanHeadConfig, {
    ACCESSORY_OPTIONS,
    BODY_OPTIONS,
    CLOTHING_OPTIONS,
    CLOTHING_COLOR_OPTIONS,
    EYEBROWS_OPTIONS,
    EYES_OPTIONS,
    FACIAL_HAIR_OPTIONS,
    GRAPHIC_OPTIONS,
    HAIR_OPTIONS,
    HAIR_COLOR_OPTIONS,
    HAT_OPTIONS,
    HAT_COLOR_OPTIONS,
    LIP_COLOR_OPTIONS,
    MOUTH_OPTIONS,
    SKIN_TONE_OPTIONS,
    CIRCLE_COLOR_OPTIONS,
    normalizeBeanHeadConfig,
} from "@/lib/genBeanHeadConfig";
import styles from "./user.module.css";

const BeanHead = BeanHeadNamed ?? BeanHeadDefault;

export default function UserProfileClient({ user, jokes }) {
    const { update } = useSession();
    const [userData, setUserData] = useState(user);
    const [userJokes, setUserJokes] = useState(jokes);
    const [username, setUsername] = useState(user.username || "");
    const normalizeConfigForName = (config, name) =>
        normalizeBeanHeadConfig(config, name || user.username || "Usuario");
    const [avatarConfig, setAvatarConfig] = useState(() => {
        if (user.avatarConfig && Object.keys(user.avatarConfig).length > 0) {
            return normalizeConfigForName(
                user.avatarConfig,
                user.username || "Usuario"
            );
        }
        return genBeanHeadConfig(user.username || "Usuario");
    });
    const [shape, setShape] = useState(() => {
        if (user.avatarConfig?.shape) {
            return user.avatarConfig.shape;
        }
        if (user.avatarConfig?.mask === true) {
            return "circle";
        }
        return "rounded";
    });

    useEffect(() => {
        setUserData(user);
        setUserJokes(jokes);
        setUsername(user.username || "");
        if (user.avatarConfig && Object.keys(user.avatarConfig).length > 0) {
            setAvatarConfig(
                normalizeConfigForName(user.avatarConfig, user.username || "Usuario")
            );
        } else {
            setAvatarConfig(genBeanHeadConfig(user.username || "Usuario"));
        }
        if (user.avatarConfig?.shape) {
            setShape(user.avatarConfig.shape);
        } else if (user.avatarConfig?.mask === true) {
            setShape("circle");
        } else {
            setShape("rounded");
        }
    }, [user, jokes]);

    const totalScore = userJokes.reduce((acc, joke) => acc + (joke.score || 0), 0);
    const averageRating = userJokes.length > 0 ? (totalScore / userJokes.length).toFixed(1) : "0.0";
    const normalizedAvatarConfig = normalizeConfigForName(
        avatarConfig,
        username.trim() || userData.username || "Usuario"
    );

    const handleAvatarChange = (field, value) => {
        setAvatarConfig((prev) =>
            normalizeConfigForName(
                {
                    ...prev,
                    [field]: value,
                },
                username.trim() || userData.username || "Usuario"
            )
        );
    };

    const handleShapeChange = (value) => {
        setShape(value);
        setAvatarConfig((prev) =>
            normalizeConfigForName(
                {
                    ...prev,
                    mask: value === "circle",
                },
                username.trim() || userData.username || "Usuario"
            )
        );
    };

    const saveProfile = async () => {
        const nextAvatarConfig = normalizeConfigForName(
            avatarConfig,
            username.trim() || userData.username || "Usuario"
        );
        try {
            const res = await fetch("/api/users/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: username.trim() || userData.username,
                    avatarConfig: nextAvatarConfig,
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
                                    avatarConfig: nextAvatarConfig,
                                },
                            }
                            : j
                    )
                );
                setAvatarConfig(nextAvatarConfig);
                await update({ avatarConfig: nextAvatarConfig });
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
                            <div
                                className={styles.avatar}
                                style={{
                                    width: 150,
                                    height: 150,
                                    borderRadius:
                                        shape === "circle"
                                            ? "50%"
                                            : shape === "rounded"
                                                ? "12px"
                                                : "0px",
                                }}
                            >
                                <BeanHead
                                    {...normalizedAvatarConfig}
                                    mask={shape === "circle"}
                                    style={{ width: "100%", height: "100%" }}
                                />
                            </div>
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
                                <label>Cuerpo</label>
                                <select
                                    value={normalizedAvatarConfig.body || "chest"}
                                    onChange={(e) => handleAvatarChange("body", e.target.value)}
                                    className={styles.select}
                                >
                                    {BODY_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option === "chest" ? "Pecho" : "Busto"}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.configSection}>
                                <label>Pelo</label>
                                <select
                                    value={normalizedAvatarConfig.hair || "short"}
                                    onChange={(e) => handleAvatarChange("hair", e.target.value)}
                                    className={styles.select}
                                >
                                    {HAIR_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.configSection}>
                                <label>Ceja</label>
                                <select
                                    value={normalizedAvatarConfig.eyebrows || "raised"}
                                    onChange={(e) =>
                                        handleAvatarChange("eyebrows", e.target.value)
                                    }
                                    className={styles.select}
                                >
                                    {EYEBROWS_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.configSection}>
                                <label>Ojos</label>
                                <select
                                    value={normalizedAvatarConfig.eyes || "normal"}
                                    onChange={(e) => handleAvatarChange("eyes", e.target.value)}
                                    className={styles.select}
                                >
                                    {EYES_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.configSection}>
                                <label>Boca</label>
                                <select
                                    value={normalizedAvatarConfig.mouth || "grin"}
                                    onChange={(e) => handleAvatarChange("mouth", e.target.value)}
                                    className={styles.select}
                                >
                                    {MOUTH_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.configSection}>
                                <label>Accesorio</label>
                                <select
                                    value={normalizedAvatarConfig.accessory || "none"}
                                    onChange={(e) =>
                                        handleAvatarChange("accessory", e.target.value)
                                    }
                                    className={styles.select}
                                >
                                    {ACCESSORY_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.configSection}>
                                <label>Vello facial</label>
                                <select
                                    value={normalizedAvatarConfig.facialHair || "none"}
                                    onChange={(e) =>
                                        handleAvatarChange("facialHair", e.target.value)
                                    }
                                    className={styles.select}
                                >
                                    {FACIAL_HAIR_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.configSection}>
                                <label>Ropa</label>
                                <select
                                    value={normalizedAvatarConfig.clothing || "shirt"}
                                    onChange={(e) =>
                                        handleAvatarChange("clothing", e.target.value)
                                    }
                                    className={styles.select}
                                >
                                    {CLOTHING_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.configSection}>
                                <label>Gráfico</label>
                                <select
                                    value={normalizedAvatarConfig.graphic || "none"}
                                    onChange={(e) =>
                                        handleAvatarChange("graphic", e.target.value)
                                    }
                                    className={styles.select}
                                >
                                    {GRAPHIC_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.configSection}>
                                <label>Sombrero</label>
                                <select
                                    value={normalizedAvatarConfig.hat || "none"}
                                    onChange={(e) => handleAvatarChange("hat", e.target.value)}
                                    className={styles.select}
                                >
                                    {HAT_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.configSection}>
                                <label>Forma</label>
                                <select
                                    value={shape}
                                    onChange={(e) => handleShapeChange(e.target.value)}
                                    className={styles.select}
                                >
                                    <option value="circle">Circular</option>
                                    <option value="rounded">Redondeado</option>
                                    <option value="square">Cuadrado</option>
                                </select>
                            </div>
                            <div className={styles.configSection}>
                                <label>Color de pelo</label>
                                <select
                                    value={normalizedAvatarConfig.hairColor || "black"}
                                    onChange={(e) =>
                                        handleAvatarChange("hairColor", e.target.value)
                                    }
                                    className={styles.select}
                                >
                                    {HAIR_COLOR_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.configSection}>
                                <label>Color de sombrero</label>
                                <select
                                    value={normalizedAvatarConfig.hatColor || "black"}
                                    onChange={(e) =>
                                        handleAvatarChange("hatColor", e.target.value)
                                    }
                                    className={styles.select}
                                >
                                    {HAT_COLOR_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.configSection}>
                                <label>Color de ropa</label>
                                <select
                                    value={normalizedAvatarConfig.clothingColor || "blue"}
                                    onChange={(e) =>
                                        handleAvatarChange("clothingColor", e.target.value)
                                    }
                                    className={styles.select}
                                >
                                    {CLOTHING_COLOR_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.configSection}>
                                <label>Color de labios</label>
                                <select
                                    value={normalizedAvatarConfig.lipColor || "pink"}
                                    onChange={(e) =>
                                        handleAvatarChange("lipColor", e.target.value)
                                    }
                                    className={styles.select}
                                >
                                    {LIP_COLOR_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.configSection}>
                                <label>Fondo</label>
                                <select
                                    value={normalizedAvatarConfig.circleColor || "blue"}
                                    onChange={(e) =>
                                        handleAvatarChange("circleColor", e.target.value)
                                    }
                                    className={styles.select}
                                >
                                    {CIRCLE_COLOR_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.configSection}>
                                <label>Tono de piel</label>
                                <select
                                    value={normalizedAvatarConfig.skinTone || "light"}
                                    onChange={(e) =>
                                        handleAvatarChange("skinTone", e.target.value)
                                    }
                                    className={styles.select}
                                >
                                    {SKIN_TONE_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.configSection}>
                                <label>Mascarilla</label>
                                <select
                                    value={normalizedAvatarConfig.faceMask ? "true" : "false"}
                                    onChange={(e) =>
                                        handleAvatarChange(
                                            "faceMask",
                                            e.target.value === "true"
                                        )
                                    }
                                    className={styles.select}
                                >
                                    <option value="false">No</option>
                                    <option value="true">Sí</option>
                                </select>
                            </div>
                            <div className={styles.configSection}>
                                <label>Color de mascarilla</label>
                                <select
                                    value={normalizedAvatarConfig.faceMaskColor || "blue"}
                                    onChange={(e) =>
                                        handleAvatarChange("faceMaskColor", e.target.value)
                                    }
                                    className={styles.select}
                                >
                                    {CLOTHING_COLOR_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.configSection}>
                                <label>Pestañas</label>
                                <select
                                    value={normalizedAvatarConfig.lashes ? "true" : "false"}
                                    onChange={(e) =>
                                        handleAvatarChange(
                                            "lashes",
                                            e.target.value === "true"
                                        )
                                    }
                                    className={styles.select}
                                >
                                    <option value="false">No</option>
                                    <option value="true">Sí</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.previewContainer}>
                            <p className={styles.previewLabel}>Vista Previa:</p>
                            <div
                                className={styles.miniPreview}
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius:
                                        shape === "circle"
                                            ? "50%"
                                            : shape === "rounded"
                                                ? "10px"
                                                : "0px",
                                }}
                            >
                                <BeanHead
                                    {...normalizedAvatarConfig}
                                    mask={shape === "circle"}
                                    style={{ width: "100%", height: "100%" }}
                                />
                            </div>
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
