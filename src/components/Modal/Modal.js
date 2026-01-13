"use client";

import styles from "./Modal.module.css";

export default function Modal({
    open,
    title,
    message,
    onClose,
    variant = "info",
    actionLabel = "Cerrar",
    onConfirm,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
}) {
    if (!open) return null;

    const isConfirmModal = typeof onConfirm === "function";

    return (
        <div className={styles.backdrop} role="dialog" aria-modal="true">
            <div className={`${styles.modal} ${styles[variant] ?? ""}`}>
                {title && <h3 className={styles.title}>{title}</h3>}
                {message && <p className={styles.message}>{message}</p>}
                {isConfirmModal ? (
                    <div className={styles.actions}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`${styles.button} ${styles.secondaryButton}`}
                        >
                            {cancelLabel}
                        </button>
                        <button type="button" onClick={onConfirm} className={styles.button}>
                            {confirmLabel}
                        </button>
                    </div>
                ) : (
                    <button type="button" onClick={onClose} className={styles.button}>
                        {actionLabel}
                    </button>
                )}
            </div>
        </div>
    );
}
