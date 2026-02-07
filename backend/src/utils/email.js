import nodemailer from "nodemailer";

/**
 * Singleton Transporter
 * Creating the transporter once and reusing it is more efficient than
 * creating a new one for every email.
 */
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT) || 465,
    secure: (process.env.EMAIL_PORT === "465" || !process.env.EMAIL_PORT), // true for 465, false for 587 or others
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Verify Connection
 * Ensures the SMTP configuration is correct on server startup.
 */
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Email Transporter Error:", error.message);
    } else {
        console.log("🚀 Email Server is ready to send messages");
    }
});

/**
 * Send Email Utility
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient address
 * @param {string} options.subject - Subject line
 * @param {string} options.message - Plain text body
 * @param {string} [options.html] - HTML body
 * @param {string} [options.replyTo] - Reply-to address
 */
const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || `"Startup Connect" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
            replyTo: options.replyTo,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("📧 Email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("❌ Nodemailer Error:", error);
        throw error;
    }
};

export default sendEmail;

