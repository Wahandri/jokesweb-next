"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./verify-email.module.css";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const token = useMemo(() => searchParams.get("token"), [searchParams]);
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("Verificando...");
    const [email, setEmail] = useState("");
    const [resendMessage, setResendMessage] = useState("");
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus("error");
                setMessage("Token no encontrado. Revisa el enlace del email.");
                return;
            }

            try {
                const res = await fetch(
                    `/api/auth/verify-email?token=${encodeURIComponent(token)}`
                );
                const data = await res.json();

                if (res.ok && data.ok) {
                    setStatus("success");
                    setMessage(data.message || "Email verificado");
                } else {
                    setStatus("error");
                    setMessage(data.error || "No se pudo verificar");
                }
            } catch (error) {
                setStatus("error");
                setMessage("Ocurrió un error al verificar");
            }
        };

        verify();
    }, [token]);

    const handleResend = async () => {
        setIsResending(true);
        setResendMessage("");
        try {
            const res = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (res.ok && data.ok) {
                setResendMessage(
                    data.message || "Si existe, enviaremos un nuevo email."
                );
            } else {
                setResendMessage(data.error || "No se pudo reenviar.");
            }
        } catch (error) {
            setResendMessage("Ocurrió un error al reenviar.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Verificación de Email</h1>
                {status === "loading" && (
                    <p className={styles.info}>Verificando...</p>
                )}
                {status === "success" && (
                    <div className={styles.success}>
                        <p>✅ {message}</p>
                        <Link href="/auth/login" className={styles.link}>
                            Ir a iniciar sesión
                        </Link>
                    </div>
                )}
                {status === "error" && (
                    <div className={styles.error}>
                        <p>❌ Error: {message}</p>
                        <div className={styles.resend}>
                            <p>¿Necesitas un nuevo email?</p>
                            <input
                                type="email"
                                placeholder="Tu correo"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.input}
                            />
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={!email || isResending}
                                className={styles.button}
                            >
                                {isResending ? "Reenviando..." : "Reenviar email"}
                            </button>
                            {resendMessage && (
                                <p className={styles.info}>{resendMessage}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
