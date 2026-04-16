import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Generates a secure random 32-byte key (encoded as hex)
 */
export const generateSecureKey = () => {
    return crypto.randomBytes(32).toString("hex");
};

/**
 * Encrypts a message using a room-specific key
 * @param {string} text - The message to encrypt
 * @param {string} keyHex - 32-byte key in hex format
 */
export const encryptMessage = (text, keyHex) => {
    try {
        const key = Buffer.from(keyHex, "hex");
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        
        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");
        
        // Return IV + Encrypted Data (IV is needed for decryption)
        return `${iv.toString("hex")}:${encrypted}`;
    } catch (error) {
        console.error("Encryption Error:", error.message);
        return text; // Fallback if encryption fails (should not happen in production)
    }
};

/**
 * Decrypts a message using a room-specific key
 * @param {string} encryptedText - IV + Encrypted Data separated by colon
 * @param {string} keyHex - 32-byte key in hex format
 */
export const decryptMessage = (encryptedText, keyHex) => {
    try {
        const [ivHex, dataHex] = encryptedText.split(":");
        if (!ivHex || !dataHex) return encryptedText;

        const key = Buffer.from(keyHex, "hex");
        const iv = Buffer.from(ivHex, "hex");
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        
        let decrypted = decipher.update(dataHex, "hex", "utf8");
        decrypted += decipher.final("utf8");
        
        return decrypted;
    } catch (error) {
        console.warn("Decryption Error (might be unencrypted legacy message):", error.message);
        return encryptedText; // Return original if decryption fails (fallback)
    }
};
