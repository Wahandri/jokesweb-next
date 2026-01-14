import crypto from "crypto";

export function generateVerificationToken() {
    return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

export function getTokenExpiry(hours = 24) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hours);
    return expiresAt;
}
