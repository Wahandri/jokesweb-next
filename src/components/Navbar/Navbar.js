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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
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

    const handleToggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const handleNavClick = () => {
        setIsMenuOpen(false);
    };

    return (
        <>
            <nav className={styles.navbar}>
                <div className={styles.logoContainer}>
                    <Link href="/" onClick={handleNavClick}>
                        <Image
                            src="/logotipo.png"
                            alt="JokesWeb Logo"
                            width={120}
                            height={40}
                            className={styles.logo}
                            priority
                        />
                    </Link>
                </div>
                <button
                    type="button"
                    className={styles.menuButton}
                    onClick={handleToggleMenu}
                    aria-expanded={isMenuOpen}
                    aria-controls="navbar-menu"
                >
                    <span className={styles.menuIcon} aria-hidden="true">
                        ☰
                    </span>
                    <span className={styles.menuLabel}>Menú</span>
                </button>
                <div
                    id="navbar-menu"
                    className={`${styles.menu} ${isMenuOpen ? styles.menuOpen : ""}`}
                >
                    <div className={styles.links}>
                        <Link href="/" className={styles.link} onClick={handleNavClick}>
                            Chistes
                        </Link>
                        <Link href="/top" className={styles.link} onClick={handleNavClick}>
                            Mejores
                        </Link>
                        {session ? (
                            <Link
                                href="/create-joke"
                                className={styles.submitButton}
                                onClick={handleNavClick}
                            >
                                Subir Chiste
                            </Link>
                        ) : (
                            <Link
                                href="/auth/login"
                                className={styles.link}
                                onClick={handleNavClick}
                            >
                                Iniciar Sesión
                            </Link>
                        )}
                    </div>
                    <div className={styles.auth}>
                        {session && (
                            <div className={styles.userMenu}>
                                <Link href="/user" className={styles.userLink} onClick={handleNavClick}>
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
                            <Link
                                href="/auth/login"
                                className={styles.submitButton}
                                onClick={handleNavClick}
                            >
                                Iniciar Sesión
                            </Link>
                        )}
                    </div>
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
