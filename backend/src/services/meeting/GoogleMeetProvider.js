import { google } from "googleapis";
import MeetingProvider from "./MeetingProvider.js";

class GoogleMeetProvider extends MeetingProvider {
    constructor(oauth2Client) {
        super();
        this.calendar = google.calendar({ version: "v3", auth: oauth2Client });
    }

    async createMeeting(meetingData) {
        try {
            const startTime = new Date(meetingData.startTime);
            const duration = meetingData.duration || 30;
            const endTime = new Date(startTime.getTime() + duration * 60000);

            const event = {
                summary: meetingData.title,
                description: meetingData.description,
                start: {
                    dateTime: startTime,
                    timeZone: meetingData.timezone || "UTC",
                },
                end: {
                    dateTime: endTime,
                    timeZone: meetingData.timezone || "UTC",
                },
                conferenceData: {
                    createRequest: {
                        requestId: `meeting-${meetingData._id.toString()}-${Date.now()}`,
                        conferenceSolutionKey: { type: "hangoutsMeet" },
                    },
                },
                attendees: meetingData.participants.map(p => ({ email: p.email })),
            };

            const response = await this.calendar.events.insert({
                calendarId: "primary",
                resource: event,
                conferenceDataVersion: 1,
            });

            const data = response.data;
            const meetLink = data.conferenceData?.entryPoints?.find(ep => ep.entryPointType === "video")?.uri;

            return {
                meetingId: data.id,
                joinUrl: meetLink || data.htmlLink,
                startUrl: meetLink || data.htmlLink,
                conferenceData: data.conferenceData,
            };
        } catch (error) {
            console.error("Google Meet creation failed:", error);
            throw new Error(`Google Meet creation failed: ${error.message}`);
        }
    }

    async updateMeeting(externalEventId, meetingData) {
        try {
            const startTime = new Date(meetingData.startTime);
            const duration = meetingData.duration || 30;
            const endTime = new Date(startTime.getTime() + duration * 60000);

            const event = {
                summary: meetingData.title,
                description: meetingData.description,
                start: {
                    dateTime: startTime,
                    timeZone: meetingData.timezone || "UTC",
                },
                end: {
                    dateTime: endTime,
                    timeZone: meetingData.timezone || "UTC",
                },
            };

            await this.calendar.events.patch({
                calendarId: "primary",
                eventId: externalEventId,
                resource: event,
            });

            return true;
        } catch (error) {
            console.error("Google Meet update failed:", error);
            throw new Error(`Google Meet update failed: ${error.message}`);
        }
    }

    async deleteMeeting(externalEventId) {
        try {
            await this.calendar.events.delete({
                calendarId: "primary",
                eventId: externalEventId,
            });
            return true;
        } catch (error) {
            console.error("Google Meet deletion failed:", error);
            // Don't throw if event already deleted
            if (error.code !== 410 && error.code !== 404) {
               throw error;
            }
            return true;
        }
    }
}

export default GoogleMeetProvider;
