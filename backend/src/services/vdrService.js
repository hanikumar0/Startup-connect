import VDRRoom from "../models/VDRRoom.js";
import { generateSecureKey } from "../utils/vdrEncryption.js";

/**
 * Ensures a VDR room exists for a given connection/match
 */
export const ensureVDRRoom = async (matchId, startupId, investorId) => {
    try {
        let room = await VDRRoom.findOne({ matchId });

        if (!room) {
            console.log(`[VDR] Creating new room for match ${matchId}`);
            room = await VDRRoom.create({
                matchId,
                startupId,
                investorId,
                encryptionKey: generateSecureKey(),
                isActive: true
            });
        }

        return room;
    } catch (error) {
        console.error("[VDR Service] Failed to ensure VDR room:", error.message);
        throw error;
    }
};

/**
 * Validates if a user is a participant in a VDR room
 */
export const validateVDRAccess = async (roomId, userId) => {
    const room = await VDRRoom.findById(roomId);
    if (!room) return false;
    
    return room.startupId.toString() === userId.toString() || 
           room.investorId.toString() === userId.toString();
};
