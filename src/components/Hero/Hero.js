"use client";

import styles from "./Hero.module.css";

export default function Hero() {
    const categories = [
        { name: "All", icon: "🔥", active: true },
        { name: "Programming", icon: "💻" },
        { name: "Dark Humor", icon: "🌑" },
        { name: "One-liners", icon: "⚡" },
        { name: "Tech", icon: "📱" },
        { name: "Dad Jokes", icon: "👨" },
    ];

    return (
        <section className={styles.hero}>
            <h1 className={styles.title}>
                Find your daily dose of <span className={styles.highlight}>laughter</span>!
            </h1>

            <div className={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Search for something funny..."
                    className={styles.searchInput}
                />
                <button className={styles.searchButton}>Search</button>
            </div>

            <div className={styles.categories}>
                {categories.map((cat) => (
                    <button
                        key={cat.name}
                        className={`${styles.categoryPill} ${cat.active ? styles.active : ''}`}
                    >
                        <span>{cat.icon}</span>
                        {cat.name}
                    </button>
                ))}
            </div>
        </section>
    );
}
