import axios from "axios";
import MeetingProvider from "./MeetingProvider.js";

class TeamsProvider extends MeetingProvider {
    constructor(teamsAccessToken) {
        super();
        this.accessToken = teamsAccessToken;
        this.baseUrl = "https://graph.microsoft.com/v1.0";
    }

    async createMeeting(meetingData) {
        try {
            if (!this.accessToken) {
                throw new Error("Teams Access Token is missing. Authentication failed.");
            }

            // If using Client Credentials (Application Permission), we can't use /me
            // We use the host's email as the user principal name
            const userPath = meetingData.hostId?.email ? `users/${meetingData.hostId.email}` : "me";

            const response = await axios.post(
                `${this.baseUrl}/${userPath}/onlineMeetings`,
                {
                    subject: meetingData.title,
                    startDateTime: meetingData.startTime,
                    endDateTime: new Date(new Date(meetingData.startTime).getTime() + (meetingData.duration || 30) * 60000),
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                    },
                }
            );

            return {
                meetingId: response.data.id,
                joinUrl: response.data.joinWebUrl,
                conferenceData: response.data,
            };
        } catch (error) {
            console.error("Teams Meeting creation failed:", error);
            throw new Error(`Teams Meeting creation failed: ${error.response?.data?.message || error.message}`);
        }
    }

    async updateMeeting(meetingId, meetingData) {
        try {
            const userPath = meetingData.hostId?.email ? `users/${meetingData.hostId.email}` : "me";
            await axios.patch(
                `${this.baseUrl}/${userPath}/onlineMeetings/${meetingId}`,
                {
                    subject: meetingData.title,
                    startDateTime: meetingData.startTime,
                    endDateTime: new Date(new Date(meetingData.startTime).getTime() + (meetingData.duration || 30) * 60000),
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                    },
                }
            );
            return true;
        } catch (error) {
            console.error("Teams Meeting update failed:", error);
            throw error;
        }
    }

    async deleteMeeting(meetingId, meetingData = {}) {
        try {
            const userPath = meetingData.hostId?.email ? `users/${meetingData.hostId.email}` : "me";
            await axios.delete(`${this.baseUrl}/${userPath}/onlineMeetings/${meetingId}`, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            });
            return true;
        } catch (error) {
            console.error("Teams Meeting deletion failed:", error);
            return true;
        }
    }
}

export default TeamsProvider;
