import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

console.log("☁️ [CLOUDINARY] Initializing Zero-Auth Public Storage Engine...");

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        return {
            folder: "chat_uploads",
            resource_type: "auto", 
            type: "upload",          // ✅ PUBLIC ACCESS (CRITICAL)
            access_mode: "public",   // ✅ Ensures no authentication required
            use_filename: true,
            unique_filename: true
        };
    },
});

/**
 * PRODUCTION-GRADE UPLOADER (As per strict rules)
 */
export const uploadFile = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",   
      type: "upload",          // ✅ PUBLIC ACCESS (CRITICAL)
      access_mode: "public",   
      folder: "chat_uploads",
    });
    return result.secure_url;
  } catch (error) {
    console.error("❌ [CLOUDINARY] Static Upload Error:", error);
    throw error;
  }
};

export const upload = multer({ 
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB Limit
});

export default cloudinary;
