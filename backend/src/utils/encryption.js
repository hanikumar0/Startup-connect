import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

/**
 * Get a valid 32-byte key from the configured ENCRYPTION_KEY.
 * If the key is a hex string (64 chars), decode it. Otherwise use SHA-256 hash.
 */
function getKey() {
    const rawKey = process.env.ENCRYPTION_KEY;

    if (!rawKey) {
        console.warn('⚠️ ENCRYPTION_KEY not set — using derived fallback. Set a proper key for production!');
        return crypto.createHash('sha256').update('startup-connect-default-key').digest();
    }

    // If it's a 64-char hex string (32 bytes as hex), decode it
    if (/^[0-9a-fA-F]{64}$/.test(rawKey)) {
        return Buffer.from(rawKey, 'hex');
    }

    // If it's exactly 32 bytes, use directly
    if (Buffer.byteLength(rawKey, 'utf8') === 32) {
        return Buffer.from(rawKey, 'utf8');
    }

    // Otherwise, hash it to get a consistent 32-byte key
    // This handles any arbitrary string, including the longer key in .env
    return crypto.createHash('sha256').update(rawKey).digest();
}

let ENCRYPTION_KEY_BUFFER;
try {
    ENCRYPTION_KEY_BUFFER = getKey();
} catch (error) {
    console.error("❌ Failed to initialize encryption key:", error.message);
    // Use a derived key so the app doesn't crash on startup
    ENCRYPTION_KEY_BUFFER = crypto.createHash('sha256').update('emergency-fallback').digest();
}

/**
 * Encrypts sensitive data using AES-256-CBC
 * @param {string} text 
 * @returns {string} Encrypted string in format "iv:ciphertext"
 */
export const encrypt = (text) => {
    if (!text) return text;
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY_BUFFER, iv);
        let encrypted = cipher.update(text, 'utf8');
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        console.error("Encryption error:", error.message);
        throw new Error("Failed to encrypt data");
    }
};

/**
 * Decrypts AES-256-CBC encrypted data
 * @param {string} text 
 * @returns {string} Decrypted plaintext
 */
export const decrypt = (text) => {
    if (!text || !text.includes(':')) return text;
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY_BUFFER, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString('utf8');
    } catch (error) {
        console.error("Decryption error:", error.message);
        throw new Error("Failed to decrypt data");
    }
};
