import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    // Protect routes (example)
    // if (pathname.startsWith("/create-joke") && !token) {
    //   return NextResponse.redirect(new URL("/auth/login", req.url));
    // }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/create-joke/:path*",
        "/profile/:path*",
    ],
};
