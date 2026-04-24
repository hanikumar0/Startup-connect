import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import Notification from "../models/Notification.js";
import Meeting from "../models/Meeting.js";
import { createNotification } from "./notificationService.js";
import emailService from "./emailService.js";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
let isRedisUp = true;

const connection = new IORedis(REDIS_URL, { 
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => Math.min(times * 1000, 30000)
});

connection.on("error", (err) => {
    if (isRedisUp) {
        console.warn("⚠️ Meeting Queue: Redis connection lost. Reminders suspended.");
        isRedisUp = false;
    }
});

connection.on("connect", () => {
    isRedisUp = true;
    console.log("🚀 Meeting Queue: Redis connected.");
});

export const meetingQueue = new Queue("meeting_reminders", { connection });

meetingQueue.on("error", (err) => {
    // Suppress spammy bullmq error logs if disconnected
});

// Worker to handle reminders
const worker = new Worker(
    "meeting_reminders",
    async (job) => {
        const { meetingId, type } = job.data;
        const meeting = await Meeting.findById(meetingId);

        if (!meeting || meeting.status === "cancelled" || meeting.status === "ended") {
            return;
        }

        const participants = [
            { userId: meeting.hostId },
            ...meeting.participants
        ];

        if (type === "reminder_30min_email") {
            // Check if meeting start time changed or if already sent
            if (meeting.reminderSent) return;

            console.log(`[QUEUE] Processing 30-min Email Reminders for Meeting: ${meeting._id}`);
            
            for (const p of participants) {
                const recipientInfo = p.userId ? p.userId : { email: p.email, name: p.name };
                await emailService.sendReminderEmail(meeting, recipientInfo);
            }

            meeting.reminderSent = true;
            await meeting.save();
        }

        if (type === "reminder_15min_notification") {
            console.log(`[QUEUE] Processing 15-min In-App Notifications for Meeting: ${meeting._id}`);
            
            for (const p of participants) {
                if (p.userId) {
                    await createNotification({
                        userId: p.userId,
                        type: "reminder_15min",
                        title: "Upcoming Meeting",
                        message: `Reminder: Your meeting "${meeting.title}" starts in 15 minutes.`,
                        link: `/meetings/room/${meeting._id}`,
                        meetingId: meeting._id,
                    });
                }
            }
        }
    },
    { connection }
);

worker.on("completed", (job) => {
    console.log(`[QUEUE] Job ${job.id} finalized successfully.`);
});

worker.on("failed", (job, err) => {
    console.error(`[QUEUE] Job ${job.id} failed: ${err.message}`);
});

/**
 * Schedule a reminder for a meeting
 */
export const scheduleMeetingReminder = async (meeting) => {
    const startTime = new Date(meeting.startTime);
    
    // 1. 30 Minutes before (Email)
    const reminder30 = new Date(startTime.getTime() - 30 * 60 * 1000);
    const delay30 = reminder30.getTime() - Date.now();

    if (!isRedisUp) {
        console.warn("[QUEUE] Skipping reminder scheduling: Redis is down.");
        return;
    }

    if (delay30 > 0) {
        await meetingQueue.add(
            `email-reminder-${meeting._id}`,
            { meetingId: meeting._id, type: "reminder_30min_email" },
            { delay: delay30, jobId: `email-reminder-${meeting._id}` }
        );
    }

    // 2. 15 Minutes before (In-App)
    const reminder15 = new Date(startTime.getTime() - 15 * 60 * 1000);
    const delay15 = reminder15.getTime() - Date.now();

    if (delay15 > 0) {
        await meetingQueue.add(
            `notify-reminder-${meeting._id}`,
            { meetingId: meeting._id, type: "reminder_15min_notification" },
            { delay: delay15, jobId: `notify-reminder-${meeting._id}` }
        );
    }
};

/**
 * Cancel a scheduled reminder
 */
export const cancelMeetingReminder = async (meetingId) => {
    const jobEmail = await meetingQueue.getJob(`email-reminder-${meetingId}`);
    if (jobEmail) await jobEmail.remove();

    const jobNotify = await meetingQueue.getJob(`notify-reminder-${meetingId}`);
    if (jobNotify) await jobNotify.remove();
};

