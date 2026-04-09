import Lead from "../models/Lead.js";
import Campaign from "../models/Campaign.js";
import User from "../models/User.js";
import sendEmail from "../utils/email.js";
import csv from "csv-parser";
import { Readable } from "stream";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// @desc    Import leads from CSV
// @route   POST /api/admin/outreach/leads/import
export const importLeads = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const results = [];
    const stream = Readable.from(req.file.buffer);

    stream
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          const leadsToImport = results.map((row) => ({
            name: row.name || row.Name,
            email: row.email || row.Email,
            linkedin: row.linkedin || row.LinkedIn || row.Linkedin,
            company: row.company || row.Company,
            type: (row.type || row.Type || "startup").toLowerCase(),
            industry: row.industry || row.Industry,
            source: row.source || "csv_import",
          }));

          let importedCount = 0;
          for (const leadData of leadsToImport) {
            if (!leadData.email) continue;
            
            await Lead.findOneAndUpdate(
              { email: leadData.email.toLowerCase() },
              { ...leadData, email: leadData.email.toLowerCase() },
              { upsert: true, new: true }
            );
            importedCount++;
          }

          res.status(200).json({
            success: true,
            message: `${importedCount} leads processed successfully`,
          });
        } catch (err) {
          res.status(500).json({ success: false, message: "Error processing CSV data: " + err.message });
        }
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all leads
// @route   GET /api/admin/outreach/leads
export const getLeads = async (req, res) => {
  try {
    const { type, status, search } = req.query;
    let query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    const leads = await Lead.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: leads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update lead status
// @route   PATCH /api/admin/outreach/leads/:id/status
export const updateLeadStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    );
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a campaign
// @route   POST /api/admin/outreach/campaign
export const createCampaign = async (req, res) => {
  try {
    const { name, type, subject, message } = req.body;
    const campaign = await Campaign.create({ name, type, subject, message });
    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all campaigns
// @route   GET /api/admin/outreach/campaign
export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get campaign by ID
// @route   GET /api/admin/outreach/campaign/:id
export const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });
    res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send campaign emails
// @route   POST /api/admin/outreach/campaign/send
export const sendCampaign = async (req, res) => {
  try {
    const { campaignId } = req.body;
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    // Find leads of the same type that are still "new"
    const leads = await Lead.find({ type: campaign.type, status: "new" });

    if (leads.length === 0) {
      return res.status(400).json({ success: false, message: "No new leads found for this campaign type" });
    }

    let sentCount = 0;
    for (const lead of leads) {
      try {
        const personalizedMessage = campaign.message
          .replace(/{name}/g, lead.name)
          .replace(/{company}/g, lead.company || "your company");

        await sendEmail({
          email: lead.email,
          subject: campaign.subject,
          message: personalizedMessage,
          html: personalizedMessage.replace(/\n/g, "<br/>"),
        });

        lead.status = "contacted";
        await lead.save();
        sentCount++;
      } catch (err) {
        console.error(`Failed to send email to ${lead.email}:`, err.message);
      }
    }

    campaign.status = "sent";
    campaign.sentCount += sentCount;
    await campaign.save();

    res.status(200).json({
      success: true,
      message: `Emails sent to ${sentCount} leads`,
      sentCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate LinkedIn message
// @route   POST /api/admin/outreach/linkedin-message
export const generateLinkedInMessage = async (req, res) => {
  try {
    const { name, company, type } = req.body;

    const prompt = `Write a short, professional LinkedIn outreach message for a ${type} founder named ${name} who is building ${company || 'their startup'}. The message should invite them to join "Startup Connect", a platform connecting startups and investors. Keep it under 300 characters, friendly but professional.`;

    try {
      // Try Gemini first
      if (process.env.GEMINI_API_KEY) {
        try {
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const result = await model.generateContent(prompt);
          return res.status(200).json({ success: true, data: result.response.text().trim() });
        } catch (geminiError) {
          console.error("Gemini outreach generation error:", geminiError.message);
        }
      }

      // Fallback to OpenAI
      if (process.env.OPENAI_API_KEY) {
        const completion = await openai.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "gpt-3.5-turbo",
        });

        const message = completion.choices[0].message.content;
        return res.status(200).json({ success: true, data: message });
      }

      // Final fallback
      throw new Error("No AI service available");
    } catch (aiError) {
      // Fallback
      const fallback = `Hi ${name}, I've been following your work at ${company || 'your startup'}. We're launching Startup Connect to help ${type === 'startup' ? 'startups find funding' : 'investors find great deals'}. Would love to have you join our private beta. Let me know if you're interested!`;
      res.status(200).json({ success: true, data: fallback, note: "AI service unavailable, using template" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get outreach analytics
// @route   GET /api/admin/outreach/analytics
export const getOutreachAnalytics = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const contactedLeads = await Lead.countDocuments({ status: "contacted" });
    const repliedLeads = await Lead.countDocuments({ status: "replied" });
    
    // Check which leads have actually signed up
    const leadEmails = await Lead.find({}, 'email');
    const emails = leadEmails.map(l => l.email.toLowerCase());
    const joinedLeadsCount = await User.countDocuments({ email: { $in: emails } });

    // Update leads status to "joined" if they are in User table
    if (joinedLeadsCount > 0) {
        const users = await User.find({ email: { $in: emails } }, 'email');
        const userEmails = users.map(u => u.email.toLowerCase());
        await Lead.updateMany({ email: { $in: userEmails }, status: { $ne: 'joined' } }, { status: 'joined' });
    }

    const joinedLeads = await Lead.countDocuments({ status: "joined" });
    const joinRate = totalLeads > 0 ? (joinedLeads / totalLeads) * 100 : 0;

    const campaigns = await Campaign.find();
    const totalSent = campaigns.reduce((acc, curr) => acc + curr.sentCount, 0);

    // Monthly growth (mock for UI)
    const stats = [
      { month: 'Jan', leads: 45 },
      { month: 'Feb', leads: 78 },
      { month: 'Mar', leads: 156 },
      { month: 'Apr', leads: totalLeads },
    ];

    res.status(200).json({
      success: true,
      data: {
        totalLeads,
        contactedLeads,
        repliedLeads,
        joinedLeads,
        totalSent,
        joinRate: joinRate.toFixed(1),
        stats
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
