"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./verify-email.module.css";

export default function VerifyEmailClient({ token }) {
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("Verificando...");
    const [email, setEmail] = useState("");
    const [resendMessage, setResendMessage] = useState("");
    const [isResending, setIsResending] = useState(false);
    const [isTokenExpired, setIsTokenExpired] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const verify = async () => {
            const tokenFromProp = token?.trim();
            const tokenFromUrl = !tokenFromProp
                ? new URLSearchParams(window.location.search).get("token")
                : "";
            const tokenToVerify = tokenFromProp || tokenFromUrl || "";

            if (!tokenToVerify) {
                setStatus("error");
                setMessage("Token no encontrado. Revisa el enlace del email.");
                return;
            }

            try {
                if (process.env.NODE_ENV === "development") {
                    console.log("[verify-email] token present:", Boolean(tokenToVerify));
                }
                const res = await fetch(
                    `/api/auth/verify-email?token=${encodeURIComponent(tokenToVerify)}`
                );
                const data = await res.json();

                if (process.env.NODE_ENV === "development") {
                    console.log("[verify-email] status:", res.status);
                    if (data?.error) {
                        console.log("[verify-email] error:", data.error);
                    }
                }

                if (res.ok && data.ok) {
                    setStatus("success");
                    setMessage("Email verificado correctamente.");
                    setIsTokenExpired(false);
                } else {
                    setStatus("error");
                    setMessage(data.error || "No se pudo verificar");
                    setIsTokenExpired(data.error === "Token expirado");
                }
            } catch (error) {
                setStatus("error");
                setMessage("Ocurrió un error al verificar");
            }
        };

        verify();
    }, [token]);

    useEffect(() => {
        if (status !== "success") return;

        const timeoutId = setTimeout(() => {
            router.push("/auth/login");
            router.refresh();
        }, 2500);

        return () => clearTimeout(timeoutId);
    }, [router, status]);

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
                if (data.code === "RATE_LIMITED") {
                    const rateLimitMessage =
                        data.rateLimitType === "HOURLY"
                            ? "Has alcanzado el límite de 3 envíos por hora. Inténtalo más tarde."
                            : "Espera un minuto antes de reenviar el email.";

                    setResendMessage(rateLimitMessage);
                } else {
                    setResendMessage(
                        data.message || "Si existe, enviaremos un nuevo email."
                    );
                }
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
                        <p>Ya puedes iniciar sesión.</p>
                        <Link href="/auth/login" className={styles.link}>
                            Ir a iniciar sesión
                        </Link>
                        <p className={styles.info}>Redirigiendo en unos segundos...</p>
                    </div>
                )}
                {status === "error" && (
                    <div className={styles.error}>
                        <p>❌ Error: {message}</p>
                        {isTokenExpired && (
                            <div className={styles.resend}>
                                <p>Tu enlace expiró. Reenviaremos uno nuevo.</p>
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
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
