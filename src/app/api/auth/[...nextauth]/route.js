import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await dbConnect();

                const user = await User.findOne({ email: credentials.email });

                if (!user) {
                    throw new Error("Email not found");
                }

                if (!user.active) {
                    throw new Error("User is inactive");
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.username,
                    role: user.role,
                    active: user.active,
                    image: user.image,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.active = user.active;
                token.username = user.name; // user.name is mapped to username in authorize
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.active = token.active;
                session.user.username = token.username;
                // Ensure name is set, fallback to username if missing (though authorize sets name=username)
                if (!session.user.name) {
                    session.user.name = token.username;
                }
                // Add image to session
                session.user.image = token.picture; // NextAuth usually maps picture to token.picture
                // But we need to ensure it comes from our DB user if we want it to be up to date on refresh
                // Actually, the authorize function returns the user object, but jwt callback receives it only on login.
                // To keep it fresh, we might need to fetch it in session callback or rely on the client side fetch we added in User Page.
                // For Navbar, it uses session. If we want it to update immediately after change without re-login, we need to update the session.
                // But session update is tricky.
                // However, since we are fetching fresh data in User Page, that's fine.
                // For Navbar, it will show the session image.
                // Let's ensure `authorize` returns the image.
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/login", // Custom login page
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
