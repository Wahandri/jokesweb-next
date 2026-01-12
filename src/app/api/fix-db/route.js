import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Joke from "@/models/Joke";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET() {
    try {
        await dbConnect();

        // Find all jokes
        // We use lean() to get plain objects, but we need to update them, so maybe not lean.
        // Actually, we want to find jokes where author is NOT an ObjectId.
        // But in Mongoose schema it is defined as ObjectId, so finding might fail or return cast error if we filter by it?
        // No, we can find all and check manually, or use $type query if supported.
        // Simplest is to fetch all (assuming not millions) and iterate.

        // We need to bypass the schema validation for the find, or use a lean query.
        const jokes = await Joke.find({}).lean();

        let updatedCount = 0;
        let errors = [];

        for (const joke of jokes) {
            // Check if author is a valid ObjectId
            const authorValue = joke.author;

            const isValidObjectId = mongoose.Types.ObjectId.isValid(authorValue);

            // If it's a string and NOT a valid ObjectId (or if it is a valid ObjectId string but we want to ensure it's stored as ObjectId? Mongoose handles that usually)
            // The error "Cast to ObjectId failed for value 'Wahandri'" implies 'Wahandri' is the value.

            if (!isValidObjectId) {
                // It's likely a username string
                const username = authorValue;
                console.log(`Fixing joke ${joke._id} with author '${username}'`);

                // Find user by username
                const user = await User.findOne({ username: username });

                if (user) {
                    // Update the joke directly using updateOne to bypass schema casting issues on the 'find' side if any
                    await Joke.updateOne(
                        { _id: joke._id },
                        { $set: { author: user._id } }
                    );
                    updatedCount++;
                } else {
                    errors.push(`User not found for username: ${username} (Joke ID: ${joke._id})`);
                    // Optional: Create a dummy user or assign to a default admin?
                    // For now, just log error.
                }
            }
        }

        return NextResponse.json({
            ok: true,
            message: `Fixed ${updatedCount} jokes.`,
            errors
        });

    } catch (error) {
        console.error("Error fixing DB:", error);
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
