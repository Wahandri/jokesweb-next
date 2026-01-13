"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import styles from "./Sidebar.module.css";
import Modal from "../Modal/Modal";

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const { data: session } = useSession();

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const openLogoutModal = () => {
        setIsLogoutModalOpen(true);
    };

    const closeLogoutModal = () => {
        setIsLogoutModalOpen(false);
    };

    const handleLogout = async () => {
        setIsLogoutModalOpen(false);
        setIsOpen(false);
        await signOut();
    };

    return (
        <>
            <div className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
                <div className={styles.content}>
                    <Link href="/" className={styles.link} onClick={toggleSidebar}>
                        INICIO
                    </Link>
                    <Link href="/top" className={styles.link} onClick={toggleSidebar}>
                        TOP 10
                    </Link>
                    {session && (
                        <Link
                            href="/favorites"
                            className={styles.link}
                            onClick={toggleSidebar}
                        >
                            FAVORITOS
                        </Link>
                    )}
                    {session ? (
                        <button
                            onClick={openLogoutModal}
                            className={`${styles.link} ${styles.button}`}
                        >
                            SALIR
                        </button>
                    ) : (
                        <Link
                            href="/auth/login"
                            className={styles.link}
                            onClick={toggleSidebar}
                        >
                            LOGIN
                        </Link>
                    )}
                </div>
                <button className={styles.toggleButton} onClick={toggleSidebar}>
                    {isOpen ? "✕" : "☰"}
                </button>
            </div>
            {isOpen && <div className={styles.overlay} onClick={toggleSidebar} />}
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
