import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

const logger = pino({
    level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
    ...(isProduction
        ? {
            // Production: structured JSON logs for log aggregation services
            formatters: {
                level(label) {
                    return { level: label };
                },
            },
            timestamp: pino.stdTimeFunctions.isoTime,
        }
        : {
            // Development: pretty-printed logs
            transport: {
                target: "pino/file",
                options: { destination: 1 }, // stdout
            },
            timestamp: pino.stdTimeFunctions.isoTime,
        }),
    // Redact sensitive fields from logs
    redact: {
        paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "body.password",
            "body.otp",
            "body.aadhaarNumber",
            "body.panNumber",
        ],
        clobberWith: "[REDACTED]",
    },
});

export default logger;
