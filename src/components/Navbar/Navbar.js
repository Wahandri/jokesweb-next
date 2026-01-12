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
                    Jokes
                </Link>
                <Link href="/top" className={styles.link}>
                    Top Rated
                </Link>
                {session ? (
                    <Link href="/create-joke" className={styles.submitButton}>
                        Submit Joke
                    </Link>
                ) : (
                    <Link href="/auth/login" className={styles.link}>
                        Login
                    </Link>
                )}
            </div>
            <div className={styles.auth}>
                {session && (
                    <div className={styles.userMenu}>
                        <span className={styles.userName}>Hola, {session.user.name}</span>
                        <button onClick={() => signOut()} className={styles.logoutButton}>
                            Logout
                        </button>
                    </div>
                )}
                {!session && (
                    <Link href="/create-joke" className={styles.submitButton}>
                        Submit Joke
                    </Link>
                )}
            </div>
        </nav>
    );
}
