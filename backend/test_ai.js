import axios from "axios";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

async function test() {
    try {
        console.log(`Testing AI service at: ${AI_SERVICE_URL}/ai/improve-text`);
        const response = await axios.post(`${AI_SERVICE_URL}/ai/improve-text`, {
            text: "I build drones",
            type: "startup_vision"
        });
        console.log("Response:", response.data);
    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) console.error("Response data:", error.response.data);
    }
}

test();
