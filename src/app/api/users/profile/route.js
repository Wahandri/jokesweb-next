import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(req) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
        }

        // Validate that the image URL is from DiceBear (security check)
        if (!image.startsWith("https://api.dicebear.com/")) {
            return NextResponse.json({ error: "Invalid image source" }, { status: 400 });
        }

        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            { image },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ ok: true, user: updatedUser }, { status: 200 });

    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
