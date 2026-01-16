import { Resend } from "resend";

export async function sendVerificationEmail({ to, username, verifyUrl }) {
    if (!process.env.RESEND_API_KEY) {
        console.log("[DEV] Verification email link:", verifyUrl);
        return { ok: true, provider: "console" };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
    const name = username || "Hola";
    const subject = "Verifica tu email en Jokesweb";
    const text = `Hola ${name},

Para completar tu registro, verifica tu email haciendo clic en el enlace:
${verifyUrl}

Si no fuiste tú, ignora este email.`;
    const html = `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;">
  <p>Hola ${name},</p>
  <p>Para completar tu registro, verifica tu email haciendo clic en el botón:</p>
  <p>
    <a href="${verifyUrl}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">
      Verificar email
    </a>
  </p>
  <p style="font-size:14px;color:#555;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
  <p style="font-size:14px;"><a href="${verifyUrl}">${verifyUrl}</a></p>
  <p>Si no fuiste tú, ignora este email.</p>
</div>`;

    const { error } = await resend.emails.send({
        from,
        to,
        subject,
        text,
        html,
    });

    if (error) {
        throw error;
    }

    return { ok: true, provider: "resend" };
}
