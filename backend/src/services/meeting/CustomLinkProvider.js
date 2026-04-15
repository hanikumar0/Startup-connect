import MeetingProvider from "./MeetingProvider.js";

class CustomLinkProvider extends MeetingProvider {
    async createMeeting(meetingData) {
        // Custom link is provided by the user in the input
        if (!meetingData.meetingLink) {
            throw new Error("Custom meeting link is required for CustomLinkProvider");
        }

        return {
            meetingId: "custom",
            joinUrl: meetingData.meetingLink,
            startUrl: meetingData.meetingLink,
            conferenceData: { custom: true },
        };
    }

    async updateMeeting(meetingId, updateData) {
        return true;
    }

    async deleteMeeting(meetingId) {
        return true;
    }
}

export default CustomLinkProvider;
