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
            return NextResponse.json({ ok: true, message: "Si existe, se reenviará" });
        }

        if (user.emailVerified) {
            return NextResponse.json({ ok: true, message: "Ya verificado" });
        }

        const token = generateVerificationToken();
        const tokenHash = hashToken(token);
        const tokenExpiry = getTokenExpiry(24);

        user.verificationTokenHash = tokenHash;
        user.verificationTokenExpires = tokenExpiry;

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

        return NextResponse.json({ ok: true, message: "Si existe, se reenviará" });
    } catch (error) {
        console.error("Error resending verification email:", error);
        return NextResponse.json(
            { ok: false, error: "Error reenviando verificación" },
            { status: 500 }
        );
    }
}
