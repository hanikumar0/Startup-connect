import User from "../models/User.js";
import Startup from "../models/Startup.js";
import Investor from "../models/Investor.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/email.js";
import safeRedis from "../config/redis.js";

// Generate JWT Access Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1h", // Short lived access token
  });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || "refresh_secret", {
    expiresIn: "7d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "startup",
      provider: "email",
    });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password, loginType } = req.body; // loginType: 'startup' or 'investor'

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ROLE VALIDATION: Strict Separation
    if (loginType && user.role.toLowerCase() !== loginType.toLowerCase()) {
        return res.status(403).json({ 
            success: false, 
            message: `You are registered as a ${user.role}. Please use the ${user.role} login portal.` 
        });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
        onboardingCompleted: user.onboardingCompleted,
        profileId: user.role === 'startup' 
          ? (await (await import("../models/Startup.js")).default.findOne({ userId: user._id }))?._id 
          : (user.role === 'investor' ? (await (await import("../models/Investor.js")).default.findOne({ userId: user._id }))?._id : null)
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
export const logout = async (req, res) => {
  // Logic to invalidate refresh token if stored in DB/Redis
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate reset token (short-lived)
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

        // In production, send this token via email
        console.log(`[AUTH] Reset Link: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`);
        
        // Mock email
        await sendEmail({
            email,
            subject: "Startup Connect - Reset Password",
            message: `Click the link to reset your password: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
        });

        res.status(200).json({ success: true, message: "Reset link sent to email" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "Invalid token or user not found" });
        }

        user.password = await bcrypt.hash(password, 10);
        await user.save();

        res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        res.status(400).json({ message: "Invalid or expired token" });
    }
};

// Placeholder for Google/LinkedIn Auth - usually handled via Passport callbacks
// but adding skeleton for POST versions if needed
export const googleAuth = async (req, res) => {
    res.status(501).json({ message: "Google Auth POST not implemented. Use GET /api/auth/google" });
};

export const linkedinAuth = async (req, res) => {
    res.status(501).json({ message: "LinkedIn Auth POST not implemented. Use GET /api/auth/linkedin" });
};

// Aliases so authRoutes.js can import by its expected names
export const registerUser = register;
export const loginUser = login;

// @desc    Check if current session/token is valid
// @route   GET /api/auth/session  (used internally by frontend)
export const checkAuthSession = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

// @desc    Get logged-in user's full profile
// @route   GET /api/auth/profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update logged-in user's profile
// @route   PUT /api/auth/profile
export const updateUserProfile = async (req, res) => {
    try {
        const allowedFields = ["name", "avatar", "phone", "bio"];
        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a user's public profile by ID
// @route   GET /api/auth/profile/:id
export const getPublicProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("name avatar role bio");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate and send 6-digit OTP to email
// @route   POST /api/auth/send-otp
export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already registered" });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store in Redis with 15 min expiry
        await safeRedis.set(`otp:${email}`, otp, "EX", 900);

        // Send email
        await sendEmail({
            email,
            subject: "Verify your Startup Connect Account",
            message: `Your verification code is: ${otp}. It will expire in 15 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 20px; background-color: #f9f9f9;">
                    <h2 style="color: #000; text-align: center; font-style: italic;">STARTUP CONNECT</h2>
                    <p style="font-size: 16px; color: #555; text-align: center;">Verify your account to join the community.</p>
                    <div style="background: #000; color: #fff; padding: 30px; border-radius: 15px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 48px; font-weight: 900; letter-spacing: 12px; font-style: italic;">${otp}</span>
                    </div>
                    <p style="font-size: 14px; color: #999; text-align: center;">This code expires in 15 minutes.</p>
                </div>
            `
        });

        res.status(200).json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP and register user
// @route   POST /api/auth/register-verify
export const registerVerify = async (req, res) => {
    try {
        const { name, email, password, role, otp } = req.body;

        // Verify OTP
        const storedOTP = await safeRedis.get(`otp:${email}`);
        if (!storedOTP || storedOTP !== otp) {
            return res.status(400).json({ message: "Invalid or expired verification code" });
        }

        // Delete OTP after successful verification
        await safeRedis.del(`otp:${email}`);

        // Double check user doesn't exist (concurrency)
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "startup",
            provider: "email",
            isVerified: true,
            emailVerified: true, // Mark as verified since OTP was successful
        });

        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.status(201).json({
            success: true,
            token,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                emailVerified: user.emailVerified,
                onboardingCompleted: user.onboardingCompleted,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
