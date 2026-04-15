import MeetingProvider from "./MeetingProvider.js";

class InternalProvider extends MeetingProvider {
    async createMeeting(meetingData) {
        // Internal meetings use the app's own WebRTC room
        // The roomId is usually the meeting ID itself
        const roomId = meetingData._id.toString();
        const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const internalLink = `${baseUrl}/meetings/room/${roomId}`;

        return {
            meetingId: roomId,
            joinUrl: internalLink,
            startUrl: internalLink,
            conferenceData: { internal: true },
        };
    }

    async updateMeeting(meetingId, updateData) {
        // Nothing special to update for internal links unless the base URL changes
        return true;
    }

    async deleteMeeting(meetingId) {
        // Internal meetings don't need external deletion
        return true;
    }
}

export default InternalProvider;
