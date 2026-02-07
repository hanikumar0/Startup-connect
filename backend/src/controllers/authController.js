import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Register User
export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (userExists) {
      return res.status(400).json({ message: "User with this email or phone already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role?.toUpperCase() || "STARTUP",
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isProfileCompleted: user.isProfileCompleted,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isProfileCompleted: user.isProfileCompleted,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import sendEmail from "../utils/email.js";
import redis from "../config/redis.js";

// Send OTP
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Store OTP in Redis with 10-minute expiry (600 seconds)
    await redis.set(`otp:${email}`, otp, "EX", 600);

    // Real Email logic
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await sendEmail({
          email,
          subject: "Your Startup Connect Verification Code",
          message: `Your verification code is ${otp}.`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
              <h2 style="color: #333; text-align: center;">Startup Connect</h2>
              <p style="font-size: 16px; color: #555;">Hello,</p>
              <p style="font-size: 16px; color: #555;">Your verification code for Startup Connect is:</p>
              <div style="background: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #007bff;">${otp}</span>
              </div>
              <p style="font-size: 14px; color: #888;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; 2024 Startup Connect. All rights reserved.</p>
            </div>
          `,
        });
        return res.status(200).json({ success: true, message: "OTP sent to email" });
      } catch (err) {
        console.error("Email send failed:", err.message);
      }
    }

    // Fallback if no keys provided OR email send fails
    console.log("------------------------------------------");
    console.log(`[AUTH] OTP for ${email}: ${otp}`);
    console.log("------------------------------------------");
    res.status(200).json({
      success: true,
      message: "OTP generated. If you didn't get an email, check your Backend Terminal/Console for the code."
    });
  } catch (error) {
    console.error("OTP Logic Error:", error);
    res.status(500).json({ message: "Internal server error during OTP generation." });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const storedOtp = await redis.get(`otp:${email}`);

    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    await redis.del(`otp:${email}`); // One-time use
    res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

