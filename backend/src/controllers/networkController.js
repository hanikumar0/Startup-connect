import ExternalStartup from "../models/ExternalStartup.js";
import ExternalInvestor from "../models/ExternalInvestor.js";
import fs from "fs";
import path from "path";

/**
 * @desc    Strict Network API for role-based discovery
 * @route   GET /api/network
 * @access  Private
 */
export const getNetworkData = async (req, res) => {
    try {
        const user = req.user || {};
        const userRole = (user.role || "").trim().toLowerCase();
        
        // 🛠️ EMERGENCY DIAGNOSTIC LOG
        const logPath = path.join(process.cwd(), "network_debug.log");
        const logEntry = `\n[${new Date().toISOString()}] User: ${user.name} | ID: ${user._id} | Role: "${userRole}"\n`;
        fs.appendFileSync(logPath, logEntry);
        
        let data = [];
        let dataType = "";
        let count = 0;

        // STRICT ROLE-BASED LOGIC (FORCE FIX)
        if (userRole === "startup") {
            // Startup sees ONLY investors
            dataType = "investors";
            data = await ExternalInvestor.find({}).lean(); // Fetch all investors
            count = data.length;
        } else if (userRole === "investor") {
            // Investor sees ONLY startups
            dataType = "startups";
            data = await ExternalStartup.find({}).lean(); // Fetch all startups
            count = data.length;
        } else {
            console.log(`[NETWORK ERROR] Unauthorized Role: ${userRole}`);
            return res.status(200).json({ 
                success: true, 
                type: "unknown",
                count: 0,
                data: [],
                message: "Role not recognized for network discovery" 
            });
        }

        // STRICT LOGGING SYSTEM (UI Render Count Verification)
        console.log(`\n================================`);
        console.log(`NETWORK RESPONSE (${userRole.toUpperCase()} USER)`);
        console.log(`================================`);
        console.log(`Role:             ${userRole}`);
        console.log(`Data Type:        ${dataType}`);
        console.log(`Fetched from DB:  ${count}`);
        console.log(`Sent to UI:       ${count}`);
        
        // 🎯 EXACT LOG FORMAT REQUESTED
        console.log(userRole === "investor" ? `Sending startups: ${count}` : `Sending investors: ${count}`);
        
        console.log(`================================\n`);

        res.status(200).json({
            success: true,
            type: dataType,
            count: count,
            data: data
        });

    } catch (error) {
        console.error("Network API Error:", error.message);
        res.status(500).json({ success: false, message: "Strategic anomaly in Network API flow." });
    }
};
