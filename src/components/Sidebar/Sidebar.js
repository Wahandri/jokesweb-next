"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
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
                            onClick={() => signOut()}
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
        </>
    );
}
