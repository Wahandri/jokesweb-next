import { Resend } from "resend";

export async function sendVerificationEmail({ to, username, verifyUrl }) {
    if (!process.env.RESEND_API_KEY) {
        console.log("[DEV] Verification email link:", verifyUrl);
        return { ok: true, provider: "console" };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
    const name = username || "there";

    const { error } = await resend.emails.send({
        from,
        to,
        subject: "Verify your email",
        text: `Hi ${name},\n\nPlease verify your email by clicking the link below:\n${verifyUrl}\n\nIf you did not create this account, you can ignore this email.`,
        html: `<p>Hi ${name},</p>
<p>Please verify your email by clicking the link below:</p>
<p><a href="${verifyUrl}">Verify your email</a></p>
<p>If you did not create this account, you can ignore this email.</p>`,
    });

    if (error) {
        throw error;
    }

    return { ok: true, provider: "resend" };
}
