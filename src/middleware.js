import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    if (
        token &&
        token.emailVerified === false &&
        (pathname.startsWith("/create-joke") ||
            pathname.startsWith("/favorites") ||
            pathname.startsWith("/profile"))
    ) {
        return NextResponse.redirect(new URL("/verify-required", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/create-joke/:path*",
        "/favorites/:path*",
        "/profile/:path*",
    ],
};
