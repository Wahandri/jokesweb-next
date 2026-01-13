"use client";

import styles from "./Modal.module.css";

export default function Modal({
    open,
    title,
    message,
    onClose,
    variant = "info",
    actionLabel = "Cerrar",
}) {
    if (!open) return null;

    return (
        <div className={styles.backdrop} role="dialog" aria-modal="true">
            <div className={`${styles.modal} ${styles[variant] ?? ""}`}>
                {title && <h3 className={styles.title}>{title}</h3>}
                {message && <p className={styles.message}>{message}</p>}
                <button type="button" onClick={onClose} className={styles.button}>
                    {actionLabel}
                </button>
            </div>
        </div>
    );
}
