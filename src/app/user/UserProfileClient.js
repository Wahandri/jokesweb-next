"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import JokeCard from "@/components/JokeCard/JokeCard";
import styles from "./user.module.css";

// DiceBear v7 Collection Configuration - Exact API Parameters
const AVATAR_COLLECTIONS = {
    avataaars: {
        name: "Avataaars",
        url: "https://api.dicebear.com/7.x/avataaars/svg",
        parameters: {
            accessories: {
                label: "Accesorios",
                options: [
                    { value: "kurt", label: "Kurt" },
                    { value: "prescription01", label: "Gafas Graduadas 1" },
                    { value: "prescription02", label: "Gafas Graduadas 2" },
                    { value: "round", label: "Gafas Redondas" },
                    { value: "sunglasses", label: "Gafas de Sol" },
                    { value: "wayfarers", label: "Wayfarers" },
                    { value: "eyepatch", label: "Parche" }
                ]
            },
            top: {
                label: "Pelo / Sombrero",
                options: [
                    { value: "hat", label: "Sombrero" },
                    { value: "hijab", label: "Hijab" },
                    { value: "turban", label: "Turbante" },
                    { value: "winterHat1", label: "Gorro Invernal 1" },
                    { value: "winterHat02", label: "Gorro Invernal 2" },
                    { value: "winterHat03", label: "Gorro Invernal 3" },
                    { value: "winterHat04", label: "Gorro Invernal 4" },
                    { value: "bob", label: "Bob" },
                    { value: "bun", label: "Moño" },
                    { value: "curly", label: "Rizado" },
                    { value: "curvy", label: "Ondulado" },
                    { value: "dreads", label: "Rastas" },
                    { value: "frida", label: "Estilo Frida" },
                    { value: "fro", label: "Afro" },
                    { value: "froBand", label: "Afro con Banda" },
                    { value: "longButNotTooLong", label: "Largo Moderado" },
                    { value: "miaWallace", label: "Mia Wallace" },
                    { value: "shavedSides", label: "Lados Rapados" },
                    { value: "straight01", label: "Liso 1" },
                    { value: "straight02", label: "Liso 2" },
                    { value: "straightAndStrand", label: "Liso con Mechón" },
                    { value: "dreads01", label: "Rastas Cortas 1" },
                    { value: "dreads02", label: "Rastas Cortas 2" },
                    { value: "frizzle", label: "Rizado Corto" },
                    { value: "shaggy", label: "Despeinado" },
                    { value: "shaggyMullet", label: "Mullet" },
                    { value: "shortCurly", label: "Corto Rizado" },
                    { value: "shortFlat", label: "Corto Plano" },
                    { value: "shortRound", label: "Corto Redondo" },
                    { value: "shortWaved", label: "Corto Ondulado" },
                    { value: "sides", label: "Lados" },
                    { value: "theCaesar", label: "Corte César" },
                    { value: "theCaesarAndSidePart", label: "César con Raya" },
                    { value: "bigHair", label: "Pelo Voluminoso" }
                ]
            },
            clothing: {
                label: "Ropa",
                options: [
                    { value: "blazerAndShirt", label: "Blazer con Camisa" },
                    { value: "blazerAndSweater", label: "Blazer con Suéter" },
                    { value: "collarAndSweater", label: "Suéter Cuello Alto" },
                    { value: "graphicShirt", label: "Camiseta Gráfica" },
                    { value: "hoodie", label: "Sudadera" },
                    { value: "overall", label: "Peto" },
                    { value: "shirtCrewNeck", label: "Camiseta Cuello Redondo" },
                    { value: "shirtScoopNeck", label: "Camiseta Escote" },
                    { value: "shirtVNeck", label: "Camiseta Cuello V" }
                ]
            }
        }
    },
    "pixel-art": {
        name: "Pixel Art",
        url: "https://api.dicebear.com/7.x/pixel-art/svg",
        parameters: {
            accessories: {
                label: "Accesorios",
                options: [
                    { value: "variant01", label: "Estilo 1" },
                    { value: "variant02", label: "Estilo 2" },
                    { value: "variant03", label: "Estilo 3" },
                    { value: "variant04", label: "Estilo 4" }
                ]
            },
            clothing: {
                label: "Ropa",
                options: [
                    { value: "variant01", label: "Estilo 1" },
                    { value: "variant02", label: "Estilo 2" },
                    { value: "variant03", label: "Estilo 3" },
                    { value: "variant04", label: "Estilo 4" },
                    { value: "variant05", label: "Estilo 5" },
                    { value: "variant06", label: "Estilo 6" },
                    { value: "variant07", label: "Estilo 7" },
                    { value: "variant08", label: "Estilo 8" },
                    { value: "variant09", label: "Estilo 9" },
                    { value: "variant10", label: "Estilo 10" },
                    { value: "variant11", label: "Estilo 11" },
                    { value: "variant12", label: "Estilo 12" },
                    { value: "variant13", label: "Estilo 13" },
                    { value: "variant14", label: "Estilo 14" },
                    { value: "variant15", label: "Estilo 15" },
                    { value: "variant16", label: "Estilo 16" },
                    { value: "variant17", label: "Estilo 17" },
                    { value: "variant18", label: "Estilo 18" },
                    { value: "variant19", label: "Estilo 19" },
                    { value: "variant20", label: "Estilo 20" },
                    { value: "variant21", label: "Estilo 21" },
                    { value: "variant22", label: "Estilo 22" },
                    { value: "variant23", label: "Estilo 23" }
                ]
            }
        }
    },
    adventurer: {
        name: "Adventurer",
        url: "https://api.dicebear.com/7.x/adventurer/svg",
        parameters: {
            eyes: {
                label: "Ojos",
                options: [
                    { value: "variant01", label: "Estilo 1" },
                    { value: "variant02", label: "Estilo 2" },
                    { value: "variant03", label: "Estilo 3" },
                    { value: "variant04", label: "Estilo 4" },
                    { value: "variant05", label: "Estilo 5" },
                    { value: "variant06", label: "Estilo 6" },
                    { value: "variant07", label: "Estilo 7" },
                    { value: "variant08", label: "Estilo 8" },
                    { value: "variant09", label: "Estilo 9" },
                    { value: "variant10", label: "Estilo 10" },
                    { value: "variant11", label: "Estilo 11" },
                    { value: "variant12", label: "Estilo 12" },
                    { value: "variant13", label: "Estilo 13" },
                    { value: "variant14", label: "Estilo 14" },
                    { value: "variant15", label: "Estilo 15" },
                    { value: "variant16", label: "Estilo 16" },
                    { value: "variant17", label: "Estilo 17" },
                    { value: "variant18", label: "Estilo 18" },
                    { value: "variant19", label: "Estilo 19" },
                    { value: "variant20", label: "Estilo 20" },
                    { value: "variant21", label: "Estilo 21" },
                    { value: "variant22", label: "Estilo 22" },
                    { value: "variant23", label: "Estilo 23" },
                    { value: "variant24", label: "Estilo 24" },
                    { value: "variant25", label: "Estilo 25" },
                    { value: "variant26", label: "Estilo 26" }
                ]
            },
            mouth: {
                label: "Boca",
                options: [
                    { value: "variant01", label: "Estilo 1" },
                    { value: "variant02", label: "Estilo 2" },
                    { value: "variant03", label: "Estilo 3" },
                    { value: "variant04", label: "Estilo 4" },
                    { value: "variant05", label: "Estilo 5" },
                    { value: "variant06", label: "Estilo 6" },
                    { value: "variant07", label: "Estilo 7" },
                    { value: "variant08", label: "Estilo 8" },
                    { value: "variant09", label: "Estilo 9" },
                    { value: "variant10", label: "Estilo 10" },
                    { value: "variant11", label: "Estilo 11" },
                    { value: "variant12", label: "Estilo 12" },
                    { value: "variant13", label: "Estilo 13" },
                    { value: "variant14", label: "Estilo 14" },
                    { value: "variant15", label: "Estilo 15" },
                    { value: "variant16", label: "Estilo 16" },
                    { value: "variant17", label: "Estilo 17" },
                    { value: "variant18", label: "Estilo 18" },
                    { value: "variant19", label: "Estilo 19" },
                    { value: "variant20", label: "Estilo 20" },
                    { value: "variant21", label: "Estilo 21" },
                    { value: "variant22", label: "Estilo 22" },
                    { value: "variant23", label: "Estilo 23" },
                    { value: "variant24", label: "Estilo 24" },
                    { value: "variant25", label: "Estilo 25" },
                    { value: "variant26", label: "Estilo 26" },
                    { value: "variant27", label: "Estilo 27" },
                    { value: "variant28", label: "Estilo 28" },
                    { value: "variant29", label: "Estilo 29" },
                    { value: "variant30", label: "Estilo 30" }
                ]
            },
            skinColor: {
                label: "Color de Piel",
                options: [
                    { value: "variant01", label: "Tono 1" },
                    { value: "variant02", label: "Tono 2" },
                    { value: "variant03", label: "Tono 3" },
                    { value: "variant04", label: "Tono 4" },
                    { value: "variant05", label: "Tono 5" }
                ]
            }
        }
    }
};

export default function UserProfileClient({ user, jokes }) {
    const { update } = useSession();
    const [userData, setUserData] = useState(user);
    const [userJokes, setUserJokes] = useState(jokes);

    // Avatar configuration with collection support
    const [selectedCollection, setSelectedCollection] = useState("avataaars");
    const [avatarConfig, setAvatarConfig] = useState({
        seed: user.username || "user"
    });
    const [previewUrl, setPreviewUrl] = useState("");

    const totalScore = userJokes.reduce((acc, joke) => acc + (joke.score || 0), 0);
    const averageRating = userJokes.length > 0 ? (totalScore / userJokes.length).toFixed(1) : "0.0";

    // Generate preview URL whenever configuration changes
    useEffect(() => {
        const collection = AVATAR_COLLECTIONS[selectedCollection];
        const params = new URLSearchParams();

        // Always add seed
        params.append("seed", avatarConfig.seed || "default");

        // Add only non-empty parameters
        Object.keys(collection.parameters).forEach(paramKey => {
            const value = avatarConfig[paramKey];
            if (value && value !== "" && value !== "blank") {
                params.append(paramKey, value);
            }
        });

        const url = `${collection.url}?${params.toString()}`;
        setPreviewUrl(url);
    }, [avatarConfig, selectedCollection]);

    const handleCollectionChange = (newCollection) => {
        setSelectedCollection(newCollection);
        // Reset config to seed only when changing collection
        setAvatarConfig({ seed: user.username || "user" });
    };

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
                await update({ image: previewUrl }); // Update session immediately
                alert("Avatar actualizado correctamente!");
            } else {
                alert("Error al actualizar el avatar");
            }
        } catch (error) {
            console.error("Error updating avatar:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Estás seguro de que quieres eliminar este chiste?")) return;

        try {
            const res = await fetch(`/api/jokes/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setUserJokes(userJokes.filter(joke => joke._id !== id));
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
                            <Image
                                src={userData.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`}
                                alt={userData.username}
                                width={150}
                                height={150}
                                className={styles.avatar}
                                unoptimized
                                priority
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

                        {/* Collection Selector */}
                        <div className={styles.configSection}>
                            <label><strong>Colección</strong></label>
                            <select
                                value={selectedCollection}
                                onChange={(e) => handleCollectionChange(e.target.value)}
                                className={styles.select}
                            >
                                {Object.keys(AVATAR_COLLECTIONS).map(collectionKey => (
                                    <option key={collectionKey} value={collectionKey}>
                                        {AVATAR_COLLECTIONS[collectionKey].name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Dynamic Parameter Selectors */}
                        <div className={styles.configGrid}>
                            {Object.keys(AVATAR_COLLECTIONS[selectedCollection].parameters).map(paramKey => {
                                const param = AVATAR_COLLECTIONS[selectedCollection].parameters[paramKey];
                                return (
                                    <div key={paramKey} className={styles.configSection}>
                                        <label>{param.label}</label>
                                        <select
                                            value={avatarConfig[paramKey] || ""}
                                            onChange={(e) => handleConfigChange(paramKey, e.target.value)}
                                            className={styles.select}
                                        >
                                            <option value="">Aleatorio</option>
                                            {param.options.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Preview with standard img tag for instant updates */}
                        <div className={styles.previewContainer}>
                            <p className={styles.previewLabel}>Vista Previa:</p>
                            {previewUrl && (
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    width={80}
                                    height={80}
                                    className={styles.miniPreview}
                                />
                            )}
                        </div>

                        <button onClick={saveAvatar} className={styles.saveButton}>
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
