import OpenAI from "openai";

/**
 * Service to research external history of startups and investors using AI
 */
export const researchEntityHistory = async (entityName, entityType, founderName = "") => {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const prompt = `
            You are a professional Venture Capital Due Diligence Analyst. 
            Research and provide a detailed historical report for the following ${entityType}:
            Name: ${entityName}
            Founder/Key Person: ${founderName}

            Please provide the report in JSON format with the following structure:
            {
                "trustScore": (Number, 1-100 based on perceived credibility),
                "summary": "A 3-sentence summary of their external reputation and impact.",
                "pastFunding": [
                    { "year": "YYYY", "round": "Seed/A/B", "amount": "$ amount", "source": "Lead investor or source" }
                ],
                "founderTrackRecord": [
                    { "company": "Past Co Name", "role": "Role", "outcome": "Exit/Pivot/Closure" }
                ],
                "verifiedExternalLinks": ["URL 1", "URL 2"],
                "riskAssessment": "Low/Medium/High",
                "riskNotes": "Brief explanation of risks if any."
            }

            Note: If you don't have real-time data for this specific entity, provide a realistic analysis based on general industry knowledge of entities with similar profiles.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error("AI History Research Error:", error);
        throw new Error("Unable to perform deep history audit at this time.");
    }
};
