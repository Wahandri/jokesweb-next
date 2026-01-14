"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

import Link from "next/link";
import Modal from "@/components/Modal/Modal";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showResend, setShowResend] = useState(false);
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [modal, setModal] = useState({
        open: false,
        title: "",
        message: "",
        variant: "info",
    });
    const cooldownRef = useRef(null);
    const router = useRouter();
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.user?.emailVerified === false) {
            setError("Debes verificar tu email antes de iniciar sesión.");
            setShowResend(true);
        }
    }, [session]);

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

    const handleResend = async () => {
        const targetEmail = session?.user?.email || email;

        if (!targetEmail) {
            setError("Ingresa tu email para reenviar la verificación.");
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            if (res.error === "EMAIL_NOT_VERIFIED") {
                setError("Debes verificar tu email antes de iniciar sesión.");
                setShowResend(true);
            } else {
                setError("Email o contraseña incorrectos");
                setShowResend(false);
            }
        } else {
            router.push("/");
            router.refresh();
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h1 className={styles.title}>Iniciar Sesión</h1>
                {error && <p className={styles.error}>{error}</p>}
                {showResend && (
                    <div className={styles.notice}>
                        <p className={styles.noticeText}>
                            Revisa tu bandeja de entrada y confirma tu email para activar tu cuenta.
                        </p>
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isResendDisabled}
                            className={styles.secondaryButton}
                        >
                            {isResendDisabled ? "Reenviar en 30s" : "Reenviar email"}
                        </button>
                    </div>
                )}
                <div className={styles.inputGroup}>
                    <label htmlFor="email">Correo Electrónico</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={styles.input}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="password">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={styles.input}
                    />
                </div>
                <button type="submit" className={styles.button}>
                    Entrar
                </button>

                <div className={styles.divider}>
                    <span>o</span>
                </div>

                <Link href="/auth/register" className={styles.registerLink}>
                    Crear cuenta nueva
                </Link>
            </form>
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
