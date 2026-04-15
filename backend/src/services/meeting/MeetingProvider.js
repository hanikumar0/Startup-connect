/**
 * @interface
 * Base class for meeting providers (Strategy Pattern)
 */
class MeetingProvider {
    /**
     * @param {Object} meetingData - The meeting database object or input data
     */
    async createMeeting(meetingData) {
        throw new Error("Method 'createMeeting' must be implemented.");
    }

    /**
     * @param {string} meetingId - Provider-specific meeting ID
     * @param {Object} updateData - Data to update
     */
    async updateMeeting(meetingId, updateData) {
        throw new Error("Method 'updateMeeting' must be implemented.");
    }

    /**
     * @param {string} meetingId - Provider-specific meeting ID
     */
    async deleteMeeting(meetingId) {
        throw new Error("Method 'deleteMeeting' must be implemented.");
    }

    /**
     * @param {Object} providerMetadata - Metadata stored in the DB
     * @returns {string} The join link
     */
    getJoinLink(providerMetadata) {
        return providerMetadata.joinUrl;
    }
}

export default MeetingProvider;
