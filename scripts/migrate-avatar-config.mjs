import dotenv from "dotenv";
import mongoose from "mongoose";
import dbConnect from "../src/lib/mongodb.js";
import genBeanHeadConfig, {
    normalizeBeanHeadConfig,
} from "../src/lib/genBeanHeadConfig.js";
import User from "../src/models/User.js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const isEqualConfig = (left, right) =>
    JSON.stringify(left) === JSON.stringify(right);

const getNormalizedConfig = (config, name) => {
    if (!config || typeof config !== "object") {
        return genBeanHeadConfig(name);
    }
    return normalizeBeanHeadConfig(config, name);
};

const migrate = async () => {
    console.log("Connecting to database...");
    await dbConnect();
    console.log("Connected.");

    let scanned = 0;
    let updated = 0;

    const cursor = User.find({
        avatarConfig: { $exists: true, $ne: null },
    }).cursor();

    for await (const user of cursor) {
        scanned += 1;
        const normalized = getNormalizedConfig(
            user.avatarConfig,
            user.username || "Usuario"
        );

        if (!isEqualConfig(user.avatarConfig, normalized)) {
            await User.updateOne(
                { _id: user._id },
                { $set: { avatarConfig: normalized } }
            );
            updated += 1;
        }
    }

    console.log(`Scanned ${scanned} users, updated ${updated}.`);
};

try {
    await migrate();
    await mongoose.connection.close();
    console.log("Migration complete.");
    process.exit(0);
} catch (error) {
    console.error("Migration failed:", error);
    await mongoose.connection.close();
    process.exit(1);
}
