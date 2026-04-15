import nodemailer from "nodemailer";
import * as ics from "ics";
import User from "../models/User.js";

class EmailService {
    constructor() {
        console.log(`[EMAIL] Initializing SMTP Transport Layer...`);
        console.log(`[EMAIL] Identity Reference: ${process.env.EMAIL_USER || "MISSING"}`);
        console.log(`[EMAIL] Auth Token Presence: ${process.env.EMAIL_PASS ? "VERIFIED" : "UNDEFINED"}`);

        this.transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Verifying connection configuration
        this.transporter.verify((error, success) => {
            if (error) {
                console.error("[EMAIL] SMTP Handshake Failure:", error);
            } else {
                console.log("[EMAIL] SMTP Uplink Ready ✅");
            }
        });
    }

    async sendMeetingEmail(meeting, recipientInfo, type = "created") {
        try {
            let recipientEmail = "";
            let recipientName = "User";

            // Support both userId (for DB lookup) and direct guest object {email, name}
            if (typeof recipientInfo === "string") {
                const user = await User.findById(recipientInfo);
                if (!user) return;
                recipientEmail = user.email;
                recipientName = user.name;
            } else if (recipientInfo && recipientInfo.email) {
                recipientEmail = recipientInfo.email;
                recipientName = recipientInfo.name || recipientInfo.email.split('@')[0];
            } else {
                return; // Invalid recipient data
            }

            console.log(`[EMAIL] Triggering ${type} invite for: ${recipientEmail} (${recipientName})`);

            const host = await User.findById(meeting.hostId);
            const hostName = host ? host.name : "Portfolio Partner";
            const hostEmail = host ? host.email : "no-reply@startupconnect.ai";

            const { title, startTime, duration, meetingLink, description, providerType } = meeting;
            const startStr = new Date(startTime).toLocaleString();
            
            // 1. Generate ICS (Not for logical cancellations)
            let icsValue = null;
            if (type !== "cancelled") {
                const start = [
                    startTime.getUTCFullYear(),
                    startTime.getUTCMonth() + 1,
                    startTime.getUTCDate(),
                    startTime.getUTCHours(),
                    startTime.getUTCMinutes()
                ];
                
                const durationMinutes = duration || 30;
                
                const event = {
                    start,
                    duration: { minutes: durationMinutes },
                    title: `Strategic Session: ${title}`,
                    description: description || `Automated invitation via the Startup Connect Registry. Access link: ${meetingLink}`,
                    location: meetingLink || "Internal Video Bridge",
                    url: meetingLink,
                    status: 'CONFIRMED',
                    busyStatus: 'BUSY',
                    organizer: { name: hostName, email: hostEmail },
                    startInputType: 'utc',
                    productId: 'startup-connect/auto-sync'
                };

                const { error, value } = ics.createEvent(event);
                if (!error) icsValue = value;
            }

            // 2. Dynamic Content Assembly
            let subject = `Diligence Update: ${title}`;
            let template = `Hello ${recipientName},\n\n`;

            switch (type) {
                case "created":
                    subject = `New Meeting Invitation: ${title}`;
                    template += `An institutional meeting has been scheduled with ${hostName}.\n\n`;
                    break;
                case "rescheduled":
                    subject = `Reschedule Notice: ${title}`;
                    template += `${hostName} has proposed a new time for your session.\n\n`;
                    break;
                case "cancelled":
                    subject = `Session Cancelled: ${title}`;
                    template += `The meeting "${title}" has been removed from the registry.\n\n`;
                    break;
            }

            template += `Registry Details:\n`;
            template += `- TITLE: ${title}\n`;
            template += `- TIME: ${startStr}\n`;
            template += `- PLATFORM: ${providerType.toUpperCase()}\n`;
            template += `- ACCESS LINK: ${meetingLink || "PENDING"}\n\n`;
            template += `Regards,\nStartup Connect Intelligence Team`;

            const htmlContent = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #0f172a;">Meeting Invitation</h2>
                    <p>An institutional sync has been scheduled through the registry.</p>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
                        <p><strong>${title}</strong></p>
                        <p style="font-size: 14px; margin-bottom: 2px;">TIME: ${startStr}</p>
                        <p style="font-size: 14px; margin-bottom: 20px;">PLATFORM: ${providerType.toUpperCase()}</p>
                        <a href="${meetingLink}" style="background: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">JOIN MEETING HUB</a>
                    </div>
                    <p style="font-size: 12px; color: #94a3b8;">${description || "No specific agenda provided."}</p>
                </div>
            `;

            // 3. Dispatch
            await this.transporter.sendMail({
                from: `"Startup Connect" <${process.env.SMTP_USER}>`,
                to: recipientEmail,
                subject,
                text: template,
                html: htmlContent,
                attachments: icsValue ? [
                    {
                        filename: 'meeting-uplink.ics',
                        content: icsValue,
                        contentType: 'text/calendar; charset=utf-8; method=REQUEST',
                    }
                ] : [],
            });

            console.log(`[EMAIL] Professional dispatch successful to ${recipientEmail}`);

        } catch (error) {
            console.error("[EMAIL] Critical delivery failure:", error.message);
        }
    }

    async sendReminderEmail(meeting, recipientInfo) {
        try {
            let recipientEmail = "";
            let recipientName = "User";

            if (typeof recipientInfo === "string") {
                const user = await User.findById(recipientInfo);
                if (!user) return;
                recipientEmail = user.email;
                recipientName = user.name;
            } else if (recipientInfo && recipientInfo.email) {
                recipientEmail = recipientInfo.email;
                recipientName = recipientInfo.name || recipientInfo.email.split('@')[0];
            } else {
                return;
            }

            const { title, meetingLink, providerType } = meeting;

            const htmlContent = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="border-left: 4px solid #f59e0b; padding-left: 20px; margin-bottom: 30px;">
                        <h2 style="color: #0f172a; margin-bottom: 0;">Meeting Reminder</h2>
                        <p style="color: #f59e0b; font-weight: bold; margin-top: 4px;">STARTS IN 30 MINUTES</p>
                    </div>
                    <p>Hello ${recipientName}, this is an automated reminder for your upcoming session.</p>
                    <div style="background: #fffbeb; padding: 30px; border-radius: 12px; margin: 20px 0; border: 1px solid #fef3c7;">
                        <p style="font-size: 18px; margin-top: 0;"><strong>${title}</strong></p>
                        <p style="font-size: 14px; margin-bottom: 25px;">Platform: ${providerType.toUpperCase()}</p>
                        <a href="${meetingLink}" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">JOIN SESSION NOW</a>
                    </div>
                    <p style="font-size: 12px; color: #94a3b8;">If you cannot attend, please use the dashboard to reschedule or cancel.</p>
                </div>
            `;

            await this.transporter.sendMail({
                from: `"Startup Connect" <${process.env.SMTP_USER}>`,
                to: recipientEmail,
                subject: `Reminder: ${title} starts in 30 minutes`,
                html: htmlContent,
            });

            console.log(`[EMAIL] Reminder dispatched successfully to ${recipientEmail}`);
        } catch (error) {
            console.error("[EMAIL] Reminder delivery failure:", error.message);
        }
    }
}

export default new EmailService();
