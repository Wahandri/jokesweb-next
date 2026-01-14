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

export function jsonForbidden(message = "Forbidden") {
    return NextResponse.json({ ok: false, error: message }, { status: 403 });
}
