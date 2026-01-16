import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import genBeanHeadConfig from "@/lib/genBeanHeadConfig";
import { sendVerificationEmail } from "@/lib/email";
import {
    generateVerificationToken,
    getTokenExpiry,
    hashToken
} from "@/lib/verificationToken";

export async function POST(req) {
    try {
        await dbConnect();

        const { username, email, password } = await req.json();

        if (!username || !email || !password) {
            return NextResponse.json(
                { ok: false, error: "Todos los campos son obligatorios" },
                { status: 400 }
            );
        }

        // Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { ok: false, error: "Formato de email inválido" },
                { status: 400 }
            );
        }

        // Validate Password
        // At least 8 chars, 1 uppercase, 1 number
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return NextResponse.json(
                { ok: false, error: "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número" },
                { status: 400 }
            );
        }

        // Check if user already exists (avoid enumeration with generic response)
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            if (existingUser.email === email && !existingUser.emailVerified) {
                const token = generateVerificationToken();
                const tokenHash = hashToken(token);
                const tokenExpiry = getTokenExpiry(24);

                existingUser.verificationTokenHash = tokenHash;
                existingUser.verificationTokenExpires = tokenExpiry;
                await existingUser.save();

                const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
                const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

                try {
                    await sendVerificationEmail({
                        to: email,
                        username: existingUser.username,
                        verifyUrl,
                    });
                } catch (emailError) {
                    console.error("Error sending verification email:", emailError);
                }
            }

            return NextResponse.json({
                ok: true,
                message:
                    "Si el correo es válido, recibirás un email para verificar tu cuenta.",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const baseName = username || email || "Usuario";
        const initialAvatarConfig = genBeanHeadConfig(baseName);

        // Create user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            role: "USER",
            active: true,
            avatarConfig: initialAvatarConfig,
        });

        const token = generateVerificationToken();
        const tokenHash = hashToken(token);
        const tokenExpiry = getTokenExpiry(24);

        user.emailVerified = false;
        user.verificationTokenHash = tokenHash;
        user.verificationTokenExpires = tokenExpiry;

        await user.save();

        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

        try {
            await sendVerificationEmail({ to: email, username, verifyUrl });
        } catch (emailError) {
            console.error("Error sending verification email:", emailError);
        }

        return NextResponse.json({
            ok: true,
            message:
                "Si el correo es válido, recibirás un email para verificar tu cuenta.",
        });
    } catch (error) {
        console.error("Error registering user:", error);
        return NextResponse.json(
            { ok: false, error: "Error registering user" },
            { status: 500 }
        );
    }
}
