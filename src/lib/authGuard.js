import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getVerifiedSessionOrNull() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return null;
    }

    if (!session.user?.emailVerified) {
        return { error: "EMAIL_NOT_VERIFIED" };
    }

    return session;
}

export function jsonForbidden(message = "Forbidden", code = "FORBIDDEN") {
    return NextResponse.json(
        { ok: false, error: message, code },
        { status: 403 }
    );
}

export function jsonUnauthorized(message = "No autenticado") {
    return NextResponse.json(
        { ok: false, error: message, code: "UNAUTHORIZED" },
        { status: 401 }
    );
}
