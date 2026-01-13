"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import styles from "./Navbar.module.css";
import UserAvatar from "../UserAvatar/UserAvatar";
import Modal from "../Modal/Modal";

export default function Navbar() {
    const { data: session } = useSession();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const displayName = session?.user?.username || session?.user?.name || "Usuario";
    const avatarConfig = session?.user?.avatarConfig || null;

    const openLogoutModal = () => {
        setIsLogoutModalOpen(true);
    };

    const closeLogoutModal = () => {
        setIsLogoutModalOpen(false);
    };

    const handleLogout = async () => {
        setIsLogoutModalOpen(false);
        await signOut();
    };

    return (
        <>
            <nav className={styles.navbar}>
                <div className={styles.logoContainer}>
                    <Link href="/">
                        <Image
                            src="/logotipo.png"
                            alt="JokesWeb Logo"
                            width={150}
                            height={50}
                            className={styles.logo}
                            priority
                        />
                    </Link>
                </div>
                <div className={styles.links}>
                    <Link href="/" className={styles.link}>
                        Chistes
                    </Link>
                    <Link href="/top" className={styles.link}>
                        Mejores
                    </Link>
                    {session ? (
                        <Link href="/create-joke" className={styles.submitButton}>
                            Subir Chiste
                        </Link>
                    ) : (
                        <Link href="/auth/login" className={styles.link}>
                            Iniciar Sesión
                        </Link>
                    )}
                </div>
                <div className={styles.auth}>
                    {session && (
                        <div className={styles.userMenu}>
                            <Link href="/user" className={styles.userLink}>
                                <UserAvatar
                                    username={displayName}
                                    avatarConfig={avatarConfig}
                                    size={32}
                                    className={styles.avatar}
                                    shape="circle"
                                />
                                <span className={styles.userName}>{displayName}</span>
                            </Link>
                            <button onClick={openLogoutModal} className={styles.logoutButton}>
                                Cerrar Sesión
                            </button>
                        </div>
                    )}
                    {!session && (
                        <Link href="/auth/login" className={styles.submitButton}>
                            Iniciar Sesión
                        </Link>
                    )}
                </div>
            </nav>
            <Modal
                open={isLogoutModalOpen}
                title="¿Cerrar sesión?"
                message="Podrás volver a iniciar sesión cuando quieras."
                variant="info"
                actionLabel="Cerrar sesión"
                cancelLabel="Cancelar"
                onClose={closeLogoutModal}
                onConfirm={handleLogout}
            />
        </>
    );
}
