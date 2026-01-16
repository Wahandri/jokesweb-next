import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { hashToken } from "@/lib/verificationToken";

export async function GET(req) {
    try {
        const token = req.nextUrl.searchParams.get("token");

        if (!token) {
            return NextResponse.json(
                { ok: false, error: "Token requerido" },
                { status: 400 }
            );
        }

        await dbConnect();

        const tokenHash = hashToken(token);
        const user = await User.findOne({ verificationTokenHash: tokenHash });

        if (!user) {
            return NextResponse.json(
                { ok: false, error: "Token inválido o expirado", code: "TOKEN_INVALID" },
                { status: 400 }
            );
        }

        if (user.emailVerified) {
            user.verificationTokenHash = "";
            user.verificationTokenExpires = null;
            await user.save();
            return NextResponse.json({ ok: true, message: "Ya verificado" });
        }

        if (
            !user.verificationTokenExpires ||
            user.verificationTokenExpires.getTime() < Date.now()
        ) {
            user.verificationTokenHash = "";
            user.verificationTokenExpires = null;
            await user.save();
            return NextResponse.json(
                { ok: false, error: "Token inválido o expirado", code: "TOKEN_EXPIRED" },
                { status: 400 }
            );
        }

        user.emailVerified = true;
        user.verificationTokenHash = "";
        user.verificationTokenExpires = null;
        await user.save();

        return NextResponse.json({ ok: true, message: "Email verificado" });
    } catch (error) {
        console.error("Error verifying email:", error);
        return NextResponse.json(
            { ok: false, error: "Error verificando email" },
            { status: 500 }
        );
    }
}
