import axios from "axios";
import MeetingProvider from "./MeetingProvider.js";

class ZoomProvider extends MeetingProvider {
    constructor(zoomAccessToken) {
        super();
        this.accessToken = zoomAccessToken;
        this.baseUrl = "https://api.zoom.us/v2";
    }

    async createMeeting(meetingData) {
        try {
            if (!this.accessToken) {
                throw new Error("Zoom Access Token is missing. Authentication failed.");
            }

            // Server-to-Server OAuth uses 'me' to refer to the account authenticated
            const response = await axios.post(
                `${this.baseUrl}/users/me/meetings`,
                {
                    topic: meetingData.title,
                    type: 2, // Scheduled meeting
                    start_time: meetingData.startTime,
                    duration: meetingData.duration || 30,
                    settings: {
                        join_before_host: true,
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                    },
                }
            );

            return {
                meetingId: response.data.id.toString(),
                joinUrl: response.data.join_url,
                startUrl: response.data.start_url,
                conferenceData: response.data,
            };
        } catch (error) {
            console.error("Zoom Meeting creation failed:", error);
            throw new Error(`Zoom Meeting creation failed: ${error.response?.data?.message || error.message}`);
        }
    }

    async updateMeeting(meetingId, meetingData) {
        try {
            await axios.patch(
                `${this.baseUrl}/meetings/${meetingId}`,
                {
                    topic: meetingData.title,
                    start_time: meetingData.startTime,
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                    },
                }
            );
            return true;
        } catch (error) {
            console.error("Zoom Meeting update failed:", error);
            throw error;
        }
    }

    async deleteMeeting(meetingId) {
        try {
            await axios.delete(`${this.baseUrl}/meetings/${meetingId}`, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            });
            return true;
        } catch (error) {
            console.error("Zoom Meeting deletion failed:", error);
            return true;
        }
    }
}

export default ZoomProvider;
