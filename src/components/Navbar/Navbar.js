"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import styles from "./Navbar.module.css";

export default function Navbar() {
    const { data: session } = useSession();

    return (
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
                            <Image
                                src={session.user.image || `https://robohash.org/${session.user.name}?set=set1`}
                                alt={session.user.name}
                                width={32}
                                height={32}
                                className={styles.avatar}
                            />
                            <span className={styles.userName}>{session.user.name}</span>
                        </Link>
                        <button onClick={() => signOut()} className={styles.logoutButton}>
                            Cerrar Sesión
                        </button>
                    </div>
                )}
                {!session && (
                    <Link href="/create-joke" className={styles.submitButton}>
                        Subir Chiste
                    </Link>
                )}
            </div>
        </nav>
    );
}
