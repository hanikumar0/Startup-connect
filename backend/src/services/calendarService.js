import CalendarEvent from "../models/CalendarEvent.js";

class CalendarService {
    /**
     * Sync meeting to internal calendar
     */
    async syncToInternal(meeting) {
        // We ensure a CalendarEvent exists for each participant and the host
        const users = [meeting.hostId, ...meeting.participants.map(p => p.userId).filter(Boolean)];
        
        for (const userId of users) {
            await CalendarEvent.findOneAndUpdate(
                { userId, meetingId: meeting._id, source: "internal" },
                {
                    startTime: meeting.startTime,
                    endTime: meeting.endTime,
                },
                { upsert: true, new: true }
            );
        }
    }

    /**
     * Sync meeting to Google Calendar (Mirror)
     */
    async syncToGoogle(meeting, providerResult) {
        if (!providerResult || !providerResult.meetingId) return;

        // In a real app, you'd handle multiple users' Google Calendars.
        // For this implementation, we assume the host's Google Calendar is synchronized.
        await CalendarEvent.findOneAndUpdate(
            { userId: meeting.hostId, meetingId: meeting._id, source: "google" },
            {
                externalEventId: providerResult.meetingId,
                startTime: meeting.startTime,
                endTime: meeting.endTime,
            },
            { upsert: true, new: true }
        );
    }

    async removeEvents(meetingId) {
        await CalendarEvent.deleteMany({ meetingId });
    }
}

export default new CalendarService();
