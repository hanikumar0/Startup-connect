import Meeting from "../models/Meeting.js";
import ProviderFactory from "./meeting/ProviderFactory.js";
import calendarService from "./calendarService.js";
import { scheduleMeetingReminder, cancelMeetingReminder } from "./meetingQueue.js";
import { createNotification } from "./notificationService.js";
import emailService from "./emailService.js";
import AuthService from "./meeting/AuthService.js";

class MeetingService {
    async scheduleMeeting(data, credentials = {}) {
        const { title, description, hostId, participants, startTime, duration, providerType, timezone, meetingLink } = data;

        // Fetch valid OAuth credentials if not provided (Unified Token Handler)
        if (Object.keys(credentials).length === 0) {
            try {
                credentials = await AuthService.getCredentials(providerType, hostId);
            } catch (err) {
                console.warn(`[AUTH] Could not automatically fetch ${providerType} credentials:`, err.message);
                // Continue, maybe provider doesn't need tokens or they are passed in
            }
        }

        // 1. Create meeting in DB
        const meeting = await Meeting.create({
            title,
            description,
            hostId,
            participants,
            startTime,
            duration: duration || 30,
            providerType,
            timezone,
            meetingLink,
            status: data.status || "scheduled",
        });

        // 2. Create meeting via provider
        const provider = ProviderFactory.getProvider(providerType, credentials);
        
        // Populate hostId to ensure provider has details like email for user-specific API calls
        await meeting.populate("hostId", "name email googleTokens");
        
        const providerResult = await provider.createMeeting(meeting);

        // 3. Update meeting with provider metadata
        meeting.providerMetadata = providerResult;
        meeting.meetingLink = providerResult.joinUrl;
        await meeting.save();

        // 4. Sync calendars
        await calendarService.syncToInternal(meeting);
        if (["google", "google_meet"].includes(providerType)) {
            await calendarService.syncToGoogle(meeting, providerResult);
        }

        // 5. Schedule reminder
        await scheduleMeetingReminder(meeting);

        // 6. Notify participants (In-App + Email)
        for (const p of participants) {
            // In-App Notification (Users only)
            if (p.userId) {
                await createNotification({
                    userId: p.userId,
                    type: "meeting_request",
                    title: "New Meeting Scheduled",
                    message: `${title} has been scheduled for you.`,
                    link: `/meetings/room/${meeting._id}`,
                    meetingId: meeting._id,
                });
            }

            // Email Notification (Users + Guests)
            const recipientInfo = p.userId ? p.userId : { email: p.email, name: p.name };
            await emailService.sendMeetingEmail(meeting, recipientInfo, "created");
        }

        return meeting;
    }

    async instantMeeting(data, credentials = {}) {
        const meetingData = {
            ...data,
            startTime: new Date(),
            duration: 30, // Default 30 min for instant
            status: "live", // Start immediately
        };

        const meeting = await this.scheduleMeeting(meetingData, credentials);
        
        // Notify participants instantly
        for (const p of meeting.participants) {
            if (p.userId) {
                await createNotification({
                    userId: p.userId,
                    type: "instant_start",
                    title: "Meeting Started",
                    message: `An instant meeting "${meeting.title}" has started. Join now!`,
                    link: `/meetings/room/${meeting._id}`,
                    meetingId: meeting._id,
                });
            }
        }

        return meeting;
    }

    async cancelMeeting(meetingId, userId, reason) {
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) throw new Error("Meeting not found");

        // 1. Update DB
        meeting.status = "cancelled";
        meeting.cancelledBy = userId;
        meeting.cancellationReason = reason;
        await meeting.save();

        // 2. Cancellation through provider
        try {
            const credentials = await AuthService.getCredentials(meeting.providerType, meeting.hostId);
            const provider = ProviderFactory.getProvider(meeting.providerType, credentials);
            if (meeting.providerMetadata?.meetingId) {
                await provider.deleteMeeting(meeting.providerMetadata.meetingId, meeting);
            }
        } catch (error) {
            console.error("Provider deletion failed during cancellation:", error.message);
        }

        // 3. Update Calendars
        await calendarService.removeEvents(meetingId);

        // 4. Cancel Reminder
        await cancelMeetingReminder(meetingId);

        // 5. Update Reliability Score for host (if they cancelled)
        if (meeting.hostId.toString() === userId.toString()) {
            await this.updateReliabilityScore(userId, "meeting_cancelled");
        }

        // 6. Notify participants (Host + Everyone on list)
        const participants = [
            { userId: meeting.hostId },
            ...meeting.participants
        ];

        for (const p of participants) {
            const isActor = p.userId?.toString() === userId.toString();
            if (isActor) continue; // Don't notify the one who cancelled

            // In-App (Users only)
            if (p.userId) {
                await createNotification({
                    userId: p.userId,
                    type: "cancelled",
                    title: "Meeting Cancelled",
                    message: `The meeting "${meeting.title}" has been cancelled. Reason: ${reason}`,
                    meetingId: meeting._id,
                });
            }

            // Email (Users + Guests)
            const recipientInfo = p.userId ? p.userId : { email: p.email, name: p.name };
            await emailService.sendMeetingEmail(meeting, recipientInfo, "cancelled");
        }

        return meeting;
    }

    async requestCancellation(meetingId, userId, reason) {
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) throw new Error("Meeting not found");

        meeting.cancellationRequests.push({ userId, reason, status: "pending" });
        meeting.status = "cancellation_requested";
        await meeting.save();

        // Notify Host
        await createNotification({
            userId: meeting.hostId,
            type: "cancellation_request",
            title: "Cancellation Requested",
            message: `A participant has requested to cancel "${meeting.title}". Reason: ${reason}`,
            link: `/meetings/room/${meeting._id}`,
            meetingId: meeting._id,
        });

        // Track behavior (requesting cancel also impacts score slightly)
        await this.updateReliabilityScore(userId, "cancellation_requested");

        return meeting;
    }

    async approveCancellation(meetingId, requestId, hostId) {
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) throw new Error("Meeting not found");

        if (meeting.hostId.toString() !== hostId.toString()) {
            throw new Error("Unauthorized: Only host can approve cancellation");
        }

        const request = meeting.cancellationRequests.id(requestId);
        if (!request) throw new Error("Request not found");

        request.status = "approved";
        return await this.cancelMeeting(meetingId, hostId, `Approved request from participant: ${request.reason}`);
    }

    async requestReschedule(meetingId, userId, data) {
        const { proposedStartTime, proposedDuration, note } = data;
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) throw new Error("Meeting not found");

        meeting.rescheduleRequests.push({ 
            userId, 
            proposedStartTime, 
            proposedDuration, 
            note, 
            status: "pending" 
        });
        meeting.status = "reschedule_requested";
        await meeting.save();

        // Notify Host
        await createNotification({
            userId: meeting.hostId,
            type: "reschedule_request",
            title: "Reschedule Proposed",
            message: `A new time has been proposed for "${meeting.title}".`,
            link: `/meetings/room/${meeting._id}`,
            meetingId: meeting._id,
        });

        return meeting;
    }

    async rescheduleMeeting(meetingId, newStartTime, newDuration) {
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) throw new Error("Meeting not found");

        meeting.startTime = newStartTime;
        if (newDuration) meeting.duration = newDuration;
        meeting.status = "scheduled"; // Reset from reschedule_requested
        await meeting.save();

        // 1. Update Provider
        try {
            const credentials = await AuthService.getCredentials(meeting.providerType, meeting.hostId);
            const provider = ProviderFactory.getProvider(meeting.providerType, credentials);
            
            await meeting.populate("hostId", "name email");
            
            if (meeting.providerMetadata?.meetingId) {
                await provider.updateMeeting(meeting.providerMetadata.meetingId, meeting);
            }
        } catch (error) {
            console.error("Provider update failed during reschedule:", error.message);
        }

        // 2. Update Calendars
        await calendarService.syncToInternal(meeting);
        if (meeting.providerType === "google") {
            await calendarService.syncToGoogle(meeting, meeting.providerMetadata);
        }

        // 3. Reschedule Reminder
        await cancelMeetingReminder(meetingId);
        await scheduleMeetingReminder(meeting);

        // 4. Notify everyone
        const allParticipants = [
            { userId: meeting.hostId },
            ...meeting.participants
        ];

        for (const p of allParticipants) {
            // In-App (Users only)
            if (p.userId) {
                await createNotification({
                    userId: p.userId,
                    type: "rescheduled",
                    title: "Meeting Rescheduled",
                    message: `The meeting "${meeting.title}" has been rescheduled to ${new Date(newStartTime).toLocaleString()}.`,
                    link: `/meetings/room/${meeting._id}`,
                    meetingId: meeting._id,
                });
            }

            // Email (Users + Guests)
            const recipientInfo = p.userId ? p.userId : { email: p.email, name: p.name };
            await emailService.sendMeetingEmail(meeting, recipientInfo, "rescheduled");
        }

        return meeting;
    }

    async approveReschedule(meetingId, requestId, hostId) {
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) throw new Error("Meeting not found");

        const request = meeting.rescheduleRequests.id(requestId);
        if (!request) throw new Error("Request not found");

        request.status = "approved";
        return await this.rescheduleMeeting(meetingId, request.proposedStartTime, request.proposedDuration);
    }

    async checkAbuseLogic(meetingId) {
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) return;

        const pendingCancels = meeting.cancellationRequests.filter(r => r.status === "pending").length;
        const totalParticipants = meeting.participants.length;

        if (pendingCancels > totalParticipants / 2) {
            await createNotification({
                userId: meeting.hostId,
                type: "abuse_warning",
                title: "Consensus Warning",
                message: `Most participants of "${meeting.title}" have requested cancellation. You may want to reschedule.`,
                link: `/meetings/room/${meeting._id}`,
                meetingId: meeting._id,
            });
        }
    }

    async updateReliabilityScore(userId, event) {
        try {
            const User = (await import("../models/User.js")).default;
            const user = await User.findById(userId);
            if (!user) return;

            let penalty = 0;
            let warning = false;

            switch (event) {
                case "meeting_cancelled": penalty = 5; user.meetingHistory.cancelledMeetings++; break;
                case "cancellation_requested": penalty = 2; break;
                case "no_show": penalty = 10; user.meetingHistory.noShows++; break;
                case "rescheduled": penalty = 1; user.meetingHistory.rescheduledMeetings++; break;
            }

            user.reliabilityScore = Math.max(0, user.reliabilityScore - penalty);
            
            if (user.reliabilityScore < 70) warning = true;

            await user.save();

            if (warning) {
                await createNotification({
                    userId,
                    type: "system_warning",
                    title: "Reliability Warning",
                    message: `Your professional reliability score is at ${user.reliabilityScore}. Low scores may affect matching priority.`,
                });
            }
        } catch (error) {
            console.error("Score update failed:", error);
        }
    }

    async getAISuggestions(meetingId) {
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) throw new Error("Meeting not found");

        const slots = [];
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        for (let i = 0; i < 3; i++) {
            const start = new Date(tomorrow);
            start.setHours(meeting.startTime.getHours() + (i * 2) + 1, 0, 0, 0);
            const end = new Date(start);
            end.setHours(start.getHours() + 1);
            
            slots.push({
                startTime: start,
                endTime: end,
                confidence: 85 - (i * 10),
                reason: i === 0 ? "High overlap with previous patterns" : "Optimal timezone window",
            });
        }

        return slots;
    }
}

export default new MeetingService();
