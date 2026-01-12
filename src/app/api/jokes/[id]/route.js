import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import Joke from "@/models/Joke";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

        await dbConnect();
        const { id } = await params;
        const joke = await Joke.findById(id);

        if (!joke) return NextResponse.json({ error: "Chiste no encontrado" }, { status: 404 });

        // Verificación de autoría: Comparamos el ID del usuario de la sesión con el author del chiste
        // Usamos .toString() para asegurar que comparamos textos planos
        if (joke.author.toString() !== session.user.id) {
            return NextResponse.json({ error: "No tienes permiso para borrar este chiste" }, { status: 403 });
        }

        await Joke.findByIdAndDelete(id);
        return NextResponse.json({ ok: true, message: "Chiste eliminado" });
    } catch (error) {
        return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
    }
}