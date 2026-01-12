import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

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

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return NextResponse.json(
                { ok: false, error: "El usuario o email ya existe" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            role: "USER",
            active: true,
        });

        await user.save();

        return NextResponse.json(
            { ok: true, message: "User registered successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error registering user:", error);
        return NextResponse.json(
            { ok: false, error: "Error registering user" },
            { status: 500 }
        );
    }
}
