/**
 * Environment Variable Validation
 * Runs at startup to catch misconfiguration before the server starts.
 */

const REQUIRED_VARS = [
    "MONGO_URI",
    "JWT_SECRET",
    "SESSION_SECRET",
    "ENCRYPTION_KEY",
];

const RECOMMENDED_VARS = [
    "REDIS_URL",
    "OPENAI_API_KEY",
    "EMAIL_USER",
    "EMAIL_PASS",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_REGION",
    "AWS_S3_BUCKET",
    "VERIFICATION_API_KEY",
    "FRONTEND_URL",
];

const INSECURE_DEFAULTS = {
    JWT_SECRET: ["superstrongsecretkey", "your_jwt_secret", "secret", "changeme"],
    SESSION_SECRET: ["dev_session_secret_change_in_production", "your_session_secret", "secret"],
    ENCRYPTION_KEY: ["01234567890123456789012345678901"],
};

export function validateEnvironment() {
    const isProduction = process.env.NODE_ENV === "production";
    const errors = [];
    const warnings = [];

    // Check required variables
    for (const varName of REQUIRED_VARS) {
        if (!process.env[varName]) {
            errors.push(`❌ Missing required env var: ${varName}`);
        }
    }

    // Check for insecure defaults in production
    if (isProduction) {
        for (const [varName, insecureValues] of Object.entries(INSECURE_DEFAULTS)) {
            const value = process.env[varName];
            if (value && insecureValues.some(v => v.toLowerCase() === value.toLowerCase())) {
                errors.push(`🔒 SECURITY: ${varName} is using an insecure default value. Change it before deploying!`);
            }
        }
    }

    // Check recommended variables
    for (const varName of RECOMMENDED_VARS) {
        const value = process.env[varName];
        if (!value || value.startsWith("your_")) {
            warnings.push(`⚠️ Missing or placeholder: ${varName} — some features may be disabled.`);
        }
    }

    // URL validation
    if (isProduction) {
        const frontendUrl = process.env.FRONTEND_URL;
        if (frontendUrl && frontendUrl.includes("localhost")) {
            errors.push("🔒 FRONTEND_URL still points to localhost in production.");
        }
        const backendUrl = process.env.BACKEND_URL;
        if (backendUrl && backendUrl.includes("localhost")) {
            errors.push("🔒 BACKEND_URL still points to localhost in production.");
        }
    }

    // Print results
    if (warnings.length > 0) {
        console.log("\n⚠️  Environment Warnings:");
        warnings.forEach(w => console.log(`   ${w}`));
    }

    if (errors.length > 0) {
        console.error("\n🚨 Environment Validation Failed:");
        errors.forEach(e => console.error(`   ${e}`));

        if (isProduction) {
            console.error("\n💀 Refusing to start in production with invalid configuration.\n");
            process.exit(1);
        } else {
            console.warn("\n⚠️  Running in development mode despite issues.\n");
        }
    } else {
        console.log("✅ Environment validation passed.\n");
    }
}
