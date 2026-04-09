import StartupProfile from "../models/Startup.js";
import InvestorProfile from "../models/Investor.js";
import User from "../models/User.js";

// @desc    Complete Startup Onboarding
// @route   POST /api/onboarding/startup
export const startupOnboarding = async (req, res) => {
  try {
    const { startupName, industry, stage, fundingRequired, currency, location, description } = req.body;

    const profile = await StartupProfile.findOneAndUpdate(
      { userId: req.user.id },
      { startupName, industry, stage, fundingRequired, currency, location, description },
      { upsert: true, new: true }
    );

    await User.findByIdAndUpdate(req.user.id, { onboardingCompleted: true });

    res.status(200).json({
      success: true,
      message: "Startup profile completed successfully",
      profile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete Investor Onboarding
// @route   POST /api/onboarding/investor
export const investorOnboarding = async (req, res) => {
  try {
    const { investorName, firmName, investorType, checkSize, currency, preferredIndustries, location, bio } = req.body;

    // Basic parsing for checkSize if it's a range string "100k-500k"
    let checkSizeMin = 0;
    let checkSizeMax = 0;
    
    if (typeof checkSize === 'string') {
        const parts = checkSize.replace(/[^0-9-]/g, '').split('-');
        checkSizeMin = parseInt(parts[0]) || 0;
        checkSizeMax = parseInt(parts[1]) || checkSizeMin;
    }

    const profile = await InvestorProfile.findOneAndUpdate(
      { userId: req.user.id },
      { 
        investorName, 
        firmName, 
        investorType, 
        checkSizeMin, 
        checkSizeMax, 
        currency, 
        preferredIndustries, 
        location, 
        bio 
      },
      { upsert: true, new: true }
    );

    await User.findByIdAndUpdate(req.user.id, { onboardingCompleted: true });

    res.status(200).json({
      success: true,
      message: "Investor profile completed successfully",
      profile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
