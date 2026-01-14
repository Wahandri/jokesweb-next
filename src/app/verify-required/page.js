"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Modal from "@/components/Modal/Modal";
import styles from "./verify-required.module.css";

export default function VerifyRequiredPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [modal, setModal] = useState({
        open: false,
        title: "",
        message: "",
        variant: "info",
    });
    const cooldownRef = useRef(null);

    useEffect(() => {
        return () => {
            if (cooldownRef.current) {
                clearTimeout(cooldownRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            router.push("/auth/login");
            return;
        }

        if (session.user?.emailVerified) {
            router.push("/");
        }
    }, [session, status, router]);

    const showModal = (title, message, variant = "info") => {
        setModal({ open: true, title, message, variant });
    };

    const closeModal = () => {
        setModal((prev) => ({ ...prev, open: false }));
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
                if (data.code === "RATE_LIMITED") {
                    const rateLimitMessage =
                        data.rateLimitType === "HOURLY"
                            ? "Has alcanzado el límite de 3 envíos por hora. Inténtalo más tarde."
                            : "Espera un minuto antes de reenviar el email.";

                    showModal("Espera antes de reenviar", rateLimitMessage, "info");
                } else {
                    showModal(
                        "Email reenviado",
                        data.message || "Si existe, enviaremos un email de verificación.",
                        "success"
                    );
                }
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

    if (status === "loading") {
        return (
            <div className={styles.container}>
                <p>Verificando tu sesión...</p>
            </div>
        );
    }

    if (!session || session.user?.emailVerified) {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Verificación requerida</h1>
                <p className={styles.description}>
                    Para continuar con esta acción necesitas verificar tu correo electrónico.
                    Revisa tu bandeja de entrada (y spam) y confirma tu cuenta.
                </p>
                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={isResendDisabled}
                        className={styles.primaryButton}
                    >
                        {isResendDisabled ? "Reenviar en 30s" : "Reenviar email"}
                    </button>
                    <Link href="/" className={styles.secondaryButton}>
                        Volver al inicio
                    </Link>
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
