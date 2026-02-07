import User from "../models/User.js";
import axios from "axios";
import { researchEntityHistory } from "../services/externalHistoryService.js";

/**
 * Helper to call Verification API
 */
const callVerificationService = async (endpoint, data) => {
    try {
        const response = await axios.post(`${process.env.VERIFICATION_API_BASE_URL}${endpoint}`, data, {
            headers: {
                'Authorization': `Bearer ${process.env.VERIFICATION_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Verification API Error (${endpoint}):`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Verification service unreachable");
    }
};

// Aadhaar Verification - Step 1: Send OTP
export const verifyAadhaar = async (req, res) => {
    try {
        const { aadhaarNumber } = req.body;

        if (!aadhaarNumber || aadhaarNumber.length !== 12) {
            return res.status(400).json({ message: "Invalid Aadhaar number" });
        }

        // Use SurePass/Zoop API to trigger Aadhaar OTP
        const result = await callVerificationService("/corporate/aadhaar-verification/generate-otp", {
            id_number: aadhaarNumber
        });

        // Store client_id in session/db to verify OTP later
        res.status(200).json({
            success: true,
            message: "OTP sent to your Aadhaar-linked mobile number",
            clientId: result.data.client_id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PAN Verification (Real-time check)
export const verifyPAN = async (req, res) => {
    try {
        const { panNumber } = req.body;
        const userId = req.user.id;

        if (!panNumber) return res.status(400).json({ message: "PAN number required" });

        const result = await callVerificationService("/corporate/pan-verification", {
            id_number: panNumber
        });

        // If valid, update user
        if (result.success) {
            await User.findByIdAndUpdate(userId, {
                panNumber,
                name: result.data.full_name // Sync name with Govt ID
            });
            return res.status(200).json({ success: true, message: "PAN verified", data: result.data });
        }

        res.status(400).json({ success: false, message: "Invalid PAN details" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Business Verification (GST / CIN / Udyam)
export const verifyBusiness = async (req, res) => {
    try {
        const { type, registrationNumber } = req.body;
        const userId = req.user.id;

        let endpoint = "";
        if (type === 'GST') endpoint = "/corporate/gst-verification";
        if (type === 'CIN') endpoint = "/corporate/mca-verification";

        const result = await callVerificationService(endpoint, {
            id_number: registrationNumber
        });

        const updateData = {};
        if (type === 'GST') updateData.gstNumber = registrationNumber;
        if (type === 'CIN') updateData.cinNumber = registrationNumber;

        await User.findByIdAndUpdate(userId, updateData);

        res.status(200).json({
            success: true,
            message: `${type} verified successfully`,
            data: result.data
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Deep History Audit for Startups and Investors
 */
export const getDeepHistoryAudit = async (req, res) => {
    try {
        const { entityName, entityType, founderName } = req.body;

        if (!entityName || !entityType) {
            return res.status(400).json({ message: "Entity name and type are required" });
        }

        const auditReport = await researchEntityHistory(entityName, entityType, founderName);

        res.status(200).json({
            success: true,
            data: auditReport
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

