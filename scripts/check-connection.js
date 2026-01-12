require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ Error: MONGODB_URI is not defined in .env.local");
    process.exit(1);
}

async function checkConnection() {
    try {
        console.log("⏳ Attempting to connect to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Success! Connected to MongoDB.");
        console.log(`   Database Name: ${mongoose.connection.name}`);
        console.log(`   Host: ${mongoose.connection.host}`);

        // Optional: Check if we can list collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("   Collections found:", collections.map(c => c.name).join(", ") || "None");

        await mongoose.disconnect();
        console.log("👋 Disconnected.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Connection failed:", error.message);
        process.exit(1);
    }
}

checkConnection();
