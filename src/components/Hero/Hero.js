"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./Hero.module.css";

export default function Hero() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("search") || "");

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/?search=${encodeURIComponent(query)}`);
        } else {
            router.push("/");
        }
    };

    return (
        <section className={styles.hero}>
            <h1 className={styles.title}>
                ¡Encuentra tu dosis diaria de <span className={styles.highlight}>risas</span>!
            </h1>

            <form onSubmit={handleSearch} className={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Busca algo divertido..."
                    className={styles.searchInput}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit" className={styles.searchButton}>Buscar</button>
            </form>
        </section>
    );
}
