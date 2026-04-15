import User from "../models/User.js";

export const submitKYC = async (req, res) => {
    try {
        const userId = req.user.id;
        const { kycData } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.kycStatus === "pending" || user.kycStatus === "verified") {
            return res.status(400).json({ 
                success: false, 
                message: "KYC already submitted or verified. Modification restricted." 
            });
        }

        // Add submission timestamp and status
        const updatedKYCData = {
            ...kycData,
            submittedAt: new Date()
        };

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { 
                kycData: updatedKYCData, 
                kycStatus: "pending" 
            }, 
            { new: true }
        );

        res.status(200).json({ 
            success: true, 
            message: "KYC submitted successfully and is now under review.",
            kycStatus: "pending"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getKYCStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("kycStatus kycData name email phone role companyName investorType funding");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ 
            success: true, 
            kycStatus: user.kycStatus,
            kycData: user.kycData,
            profile: {
                name: user.name,
                email: user.email,
                phone: user.phone || "",
                role: user.role,
                companyName: user.companyName,
                investorType: user.investorType,
                funding: user.funding
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
