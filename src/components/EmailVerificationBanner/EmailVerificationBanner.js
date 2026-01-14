"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import Modal from "@/components/Modal/Modal";
import styles from "./EmailVerificationBanner.module.css";

const DISMISS_KEY = "emailVerificationBannerDismissed";

export default function EmailVerificationBanner() {
    const { data: session } = useSession();
    const [dismissed, setDismissed] = useState(false);
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [modal, setModal] = useState({
        open: false,
        title: "",
        message: "",
        variant: "info",
    });
    const cooldownRef = useRef(null);

    const isUnverified = session?.user?.emailVerified === false;

    useEffect(() => {
        if (typeof window === "undefined") return;

        setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
    }, []);

    useEffect(() => {
        return () => {
            if (cooldownRef.current) {
                clearTimeout(cooldownRef.current);
            }
        };
    }, []);

    const showModal = (title, message, variant = "info") => {
        setModal({ open: true, title, message, variant });
    };

    const closeModal = () => {
        setModal((prev) => ({ ...prev, open: false }));
    };

    const handleDismiss = () => {
        setDismissed(true);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(DISMISS_KEY, "1");
        }
    };

    const handleResend = async () => {
        const targetEmail = session?.user?.email;

        if (!targetEmail) {
            showModal(
                "No se pudo reenviar",
                "No encontramos tu email en la sesión.",
                "error"
            );
            return;
        }

        setIsResendDisabled(true);

        try {
            const res = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: targetEmail }),
            });
            const data = await res.json();

            if (res.ok && data.ok) {
                showModal(
                    "Email reenviado",
                    data.message || "Si existe, enviaremos un email de verificación.",
                    "success"
                );
            } else {
                showModal(
                    "No se pudo reenviar",
                    data.error || "Ocurrió un error al reenviar.",
                    "error"
                );
            }
        } catch (resendError) {
            showModal(
                "No se pudo reenviar",
                "Ocurrió un error al reenviar.",
                "error"
            );
        } finally {
            cooldownRef.current = setTimeout(() => {
                setIsResendDisabled(false);
            }, 30000);
        }
    };

    if (!isUnverified || dismissed) {
        return null;
    }

    return (
        <div className={styles.wrapper} role="status">
            <div className={styles.banner}>
                <span className={styles.message}>
                    Tu cuenta no está verificada. Revisa tu correo para activar la cuenta.
                </span>
                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={isResendDisabled}
                        className={styles.primaryButton}
                    >
                        {isResendDisabled ? "Reenviar en 30s" : "Reenviar email"}
                    </button>
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className={styles.secondaryButton}
                    >
                        Hecho / Cerrar
                    </button>
                </div>
            </div>
            <Modal
                open={modal.open}
                title={modal.title}
                message={modal.message}
                variant={modal.variant}
                onClose={closeModal}
            />
        </div>
    );
}
