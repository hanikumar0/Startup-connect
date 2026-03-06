import User from "../models/User.js";
import axios from "axios";
import { researchEntityHistory } from "../services/externalHistoryService.js";

/**
 * Helper to call Verification API with timeout and fallback
 */
const callVerificationService = async (endpoint, data) => {
    try {
        const response = await axios.post(`${process.env.VERIFICATION_API_BASE_URL}${endpoint}`, data, {
            headers: {
                'Authorization': `Bearer ${process.env.VERIFICATION_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 15000 // 15 second timeout
        });
        return response.data;
    } catch (error) {
        const statusCode = error.response?.status;
        const errorMsg = error.response?.data?.message || error.message;

        console.error(`Verification API Error (${endpoint}): ${statusCode} - ${errorMsg}`);

        // Provide helpful error based on status
        if (statusCode === 401 || statusCode === 403) {
            throw new Error("Verification service authentication failed. Please contact support.");
        }
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            throw new Error("Verification service timed out. Please try again.");
        }
        if (!error.response) {
            throw new Error("Verification service is currently unavailable. Please try again later.");
        }
        throw new Error(errorMsg || "Verification service error");
    }
};

// Aadhaar Verification - Step 1: Send OTP
export const verifyAadhaar = async (req, res) => {
    try {
        const { aadhaarNumber } = req.body;

        if (!aadhaarNumber || aadhaarNumber.length !== 12 || !/^\d{12}$/.test(aadhaarNumber)) {
            return res.status(400).json({ message: "Invalid Aadhaar number. Must be 12 digits." });
        }

        const result = await callVerificationService("/corporate/aadhaar-verification/generate-otp", {
            id_number: aadhaarNumber
        });

        res.status(200).json({
            success: true,
            message: "OTP sent to your Aadhaar-linked mobile number",
            clientId: result.data?.client_id
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PAN Verification
export const verifyPAN = async (req, res) => {
    try {
        const { panNumber } = req.body;
        const userId = req.user.id;

        if (!panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase())) {
            return res.status(400).json({ message: "Invalid PAN format. Expected: ABCDE1234F" });
        }

        const result = await callVerificationService("/corporate/pan-verification", {
            id_number: panNumber.toUpperCase()
        });

        if (result.success) {
            await User.findByIdAndUpdate(userId, {
                panNumber: panNumber.toUpperCase(),
                name: result.data?.full_name || undefined
            });
            return res.status(200).json({ success: true, message: "PAN verified", data: result.data });
        }

        res.status(400).json({ success: false, message: "Invalid PAN details" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Business Verification (GST / CIN)
export const verifyBusiness = async (req, res) => {
    try {
        const { type, registrationNumber } = req.body;
        const userId = req.user.id;

        if (!type || !registrationNumber) {
            return res.status(400).json({ message: "Type and registration number are required" });
        }

        let endpoint = "";
        if (type === 'GST') endpoint = "/corporate/gst-verification";
        else if (type === 'CIN') endpoint = "/corporate/mca-verification";
        else return res.status(400).json({ message: "Invalid verification type. Use GST or CIN." });

        const result = await callVerificationService(endpoint, {
            id_number: registrationNumber.toUpperCase()
        });

        const updateData = {};
        if (type === 'GST') updateData.gstNumber = registrationNumber.toUpperCase();
        if (type === 'CIN') updateData.cinNumber = registrationNumber.toUpperCase();

        await User.findByIdAndUpdate(userId, updateData);

        res.status(200).json({
            success: true,
            message: `${type} verified successfully`,
            data: result.data
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Deep History Audit
 */
export const getDeepHistoryAudit = async (req, res) => {
    try {
        const { entityName, entityType, founderName } = req.body;

        if (!entityName || !entityType) {
            return res.status(400).json({ message: "Entity name and type are required" });
        }

        if (!["startup", "investor"].includes(entityType.toLowerCase())) {
            return res.status(400).json({ message: "Entity type must be 'startup' or 'investor'" });
        }

        const auditReport = await researchEntityHistory(entityName, entityType, founderName);

        res.status(200).json({
            success: true,
            data: auditReport
        });
    } catch (error) {
        console.error("Deep History Audit Error:", error.message);
        res.status(500).json({ success: false, message: "Audit service temporarily unavailable. Please try again." });
    }
};
