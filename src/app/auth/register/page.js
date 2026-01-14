"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./register.module.css";
import Modal from "@/components/Modal/Modal";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [registrationComplete, setRegistrationComplete] = useState(false);
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [modal, setModal] = useState({
        open: false,
        title: "",
        message: "",
        variant: "info",
    });
    const cooldownRef = useRef(null);
    const [passwordError, setPasswordError] = useState("");

    const validatePassword = (pass) => {
        const hasUpperCase = /[A-Z]/.test(pass);
        const hasNumber = /\d/.test(pass);
        const isLengthValid = pass.length >= 8;

        if (!isLengthValid) return "La contraseña debe tener al menos 8 caracteres.";
        if (!hasUpperCase) return "La contraseña debe tener al menos una mayúscula.";
        if (!hasNumber) return "La contraseña debe tener al menos un número.";
        return "";
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        setPasswordError(validatePassword(newPassword));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setRegistrationComplete(false);

        const passValidation = validatePassword(password);
        if (passValidation) {
            setError(passValidation);
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setRegistrationComplete(true);
                setModal({
                    open: true,
                    title: "Verifica tu email",
                    message:
                        "Te hemos enviado un email de verificación. Revisa tu bandeja de entrada para activar tu cuenta.",
                    variant: "info",
                });
            } else {
                setError(data.error || "Error en el registro");
            }
        } catch (err) {
            setError("Ocurrió un error. Por favor intenta de nuevo.");
        }
    };

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
        if (!email) {
            setError("Ingresa tu email para reenviar la verificación.");
            return;
        }

        setIsResendDisabled(true);

        try {
            const res = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
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

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Registro</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <p className={styles.error}>{error}</p>}
                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            placeholder="Nombre de usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <input
                            type="email"
                            placeholder="Correo Electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                            className={`${styles.input} ${passwordError ? styles.invalid : ''}`}
                        />
                        {passwordError && <p className={styles.fieldError}>{passwordError}</p>}
                    </div>
                    <div className={styles.inputGroup}>
                        <input
                            type="password"
                            placeholder="Confirmar Contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>
                    <button type="submit" className={styles.button}>
                        Crear Cuenta
                    </button>
                </form>
                {registrationComplete && (
                    <div className={styles.notice}>
                        <p className={styles.noticeText}>
                            Te hemos enviado un email de verificación. Debes activarlo antes de
                            iniciar sesión.
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
                <Link href="/auth/login" className={styles.link}>
                    Entrar con usuario existente
                </Link>
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
