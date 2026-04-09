import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    // Note: The Node.js SDK doesn't have a direct listModels method in some versions
    // But we can try to initialize some common ones
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    
    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("test");
            console.log(`✅ Model ${m} is working.`);
        } catch (e) {
            console.log(`❌ Model ${m} failed: ${e.message}`);
        }
    }
  } catch (e) {
    console.error("Setup error:", e.message);
  }
}

listModels();
