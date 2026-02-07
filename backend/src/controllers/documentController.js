import StartupProfile from "../models/StartupProfile.js";
import { uploadToS3, getSignedUrl } from "../utils/s3.js";

export const uploadPitchDeck = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const userId = req.user.id;

        // Production-ready S3 upload
        const result = await uploadToS3(req.file);

        await StartupProfile.findOneAndUpdate(
            { userId },
            { pitchDeckUrl: result.key },
            { upsert: true }
        );

        res.status(200).json({
            success: true,
            message: "Pitch deck uploaded successfully",
            key: result.key,
            url: result.url
        });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getPitchDeck = async (req, res) => {
    try {
        const { startupId } = req.params;
        const profile = await StartupProfile.findOne({ userId: startupId });

        if (!profile || !profile.pitchDeckUrl) {
            return res.status(404).json({ message: "Pitch deck not found" });
        }

        // Generate a temporary signed URL so the file remains secure
        const signedUrl = await getSignedUrl(profile.pitchDeckUrl);

        res.status(200).json({ success: true, url: signedUrl });
    } catch (error) {
        console.error("Get Signed URL Error:", error);
        res.status(500).json({ message: error.message });
    }
};

