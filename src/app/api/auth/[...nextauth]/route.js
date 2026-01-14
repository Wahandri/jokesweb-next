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

                if (!user.emailVerified) {
                    throw new Error("EMAIL_NOT_VERIFIED");
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.username,
                    username: user.username,
                    role: user.role,
                    active: user.active,
                    image: user.image,
                    avatarConfig: user.avatarConfig,
                    emailVerified: user.emailVerified,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.active = user.active;
                token.username = user.username || user.name;
                token.picture = user.image;
                token.avatarConfig = user.avatarConfig || null;
                token.emailVerified = user.emailVerified;
            }
            // Handle session update
            if (trigger === "update" && session?.image) {
                token.picture = session.image;
            }
            if (trigger === "update" && session?.avatarConfig) {
                token.avatarConfig = session.avatarConfig;
            }
            return token;
        },
        async session({ session, token, trigger }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.active = token.active;
                session.user.username =
                    token.username || session.user.username || session.user.name;
                if (!session.user.name) {
                    session.user.name = session.user.username;
                }
                session.user.image = token.picture;
                session.user.avatarConfig =
                    token.avatarConfig || session.user.avatarConfig || null;
                session.user.emailVerified = token.emailVerified;
            }

            // Ensure session updates are handled (safety check for avatar updates)
            if (trigger === "update" && token.picture) {
                session.user.image = token.picture;
            }
            if (trigger === "update" && token.avatarConfig) {
                session.user.avatarConfig = token.avatarConfig;
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
