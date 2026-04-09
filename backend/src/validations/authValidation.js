import { z } from "zod";

export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters."),
        email: z.string().email("Invalid institutional email format."),
        password: z.string().min(8, "Security protocol requires at least 8 characters."),
        role: z.enum(["startup", "investor", "admin"], "Invalid strategic role."),
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format."),
        password: z.string().min(1, "Password is required for session calibration."),
    })
});

export const resetPasswordSchema = z.object({
    body: z.object({
        newPassword: z.string().min(8, "New security passphrase must be at least 8 chars."),
    })
});
