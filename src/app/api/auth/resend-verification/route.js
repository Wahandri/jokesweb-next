import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { sendVerificationEmail } from "@/lib/email";
import {
    generateVerificationToken,
    getTokenExpiry,
    hashToken,
} from "@/lib/verificationToken";

export async function POST(req) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { ok: false, error: "Email requerido" },
                { status: 400 }
            );
        }

        await dbConnect();

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({
                ok: true,
                message: "Si el correo existe, recibirás un email de verificación.",
            });
        }

        if (user.emailVerified) {
            return NextResponse.json({
                ok: true,
                message: "Si el correo existe, recibirás un email de verificación.",
            });
        }

        const now = new Date();
        const cooldownMs = 60 * 1000;
        const windowMs = 60 * 60 * 1000;
        const maxPerWindow = 3;

        let shouldSave = false;
        let windowStart = user.verificationEmailSendWindowStart;
        let sendCount = user.verificationEmailSendCount ?? 0;

        if (!windowStart || now.getTime() - windowStart.getTime() > windowMs) {
            windowStart = now;
            sendCount = 0;
            user.verificationEmailSendWindowStart = windowStart;
            user.verificationEmailSendCount = sendCount;
            shouldSave = true;
        }

        const lastSentAt = user.lastVerificationEmailSentAt;
        const cooldownActive =
            lastSentAt && now.getTime() - lastSentAt.getTime() < cooldownMs;
        const overLimit = sendCount >= maxPerWindow;

        if (cooldownActive || overLimit) {
            if (shouldSave) {
                await user.save();
            }

            return NextResponse.json({
                ok: true,
                message: "Si el correo existe, recibirás un email de verificación.",
                code: "RATE_LIMITED",
                rateLimitType: cooldownActive ? "COOLDOWN" : "HOURLY",
            });
        }

        const token = generateVerificationToken();
        const tokenHash = hashToken(token);
        const tokenExpiry = getTokenExpiry(24);

        user.verificationTokenHash = tokenHash;
        user.verificationTokenExpires = tokenExpiry;
        user.lastVerificationEmailSentAt = now;
        user.verificationEmailSendWindowStart = windowStart ?? now;
        user.verificationEmailSendCount = sendCount + 1;

        await user.save();

        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

        try {
            await sendVerificationEmail({
                to: email,
                username: user.username,
                verifyUrl,
            });
        } catch (emailError) {
            console.error("Error resending verification email:", emailError);
        }

        return NextResponse.json({
            ok: true,
            message: "Si el correo existe, recibirás un email de verificación.",
        });
    } catch (error) {
        console.error("Error resending verification email:", error);
        return NextResponse.json(
            { ok: false, error: "Error reenviando verificación" },
            { status: 500 }
        );
    }
}
