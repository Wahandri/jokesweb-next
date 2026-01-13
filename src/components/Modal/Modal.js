"use client";

import styles from "./Modal.module.css";

export default function Modal({
    open,
    title,
    message,
    onClose,
    onConfirm,
    variant = "info",
    actionLabel = "Cerrar",
    cancelLabel,
}) {
    if (!open) return null;

    const handleConfirm = onConfirm ?? onClose;

    return (
        <div className={styles.backdrop} role="dialog" aria-modal="true">
            <div className={`${styles.modal} ${styles[variant] ?? ""}`}>
                {title && <h3 className={styles.title}>{title}</h3>}
                {message && <p className={styles.message}>{message}</p>}
                <div className={styles.actions}>
                    {cancelLabel && (
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.secondaryButton}
                        >
                            {cancelLabel}
                        </button>
                    )}
                    <button type="button" onClick={handleConfirm} className={styles.button}>
                        {actionLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
