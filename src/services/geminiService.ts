import { GoogleGenAI } from "@google/genai";

// Use NEXT_PUBLIC_GEMINI_API_KEY for client-side access if needed, or implement a server action proxy.
// For simplicity in this migration (matching source), we assume client-side call or env var availability.
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;

if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
}

export const sendMessageToGemini = async (
    message: string,
    history: { role: string; parts: { text: string }[] }[]
): Promise<string> => {
    if (!ai) {
        console.error("Gemini API Key missing. Please set NEXT_PUBLIC_GEMINI_API_KEY in .env.local");
        return "Error: API Key is missing. Please configure the environment.";
    }

    try {
        // Correct usage using ai.chats.create
        const chat = ai.chats.create({
            model: "gemini-3-flash-preview", // Updated to a potentially more stable model name if preview is deprecated, or keep as is.
            config: {
                systemInstruction: `You are EcoBot, the intelligent assistant for ELocate. 
      Your personality is: Organic, Optimistic, Precise, and Helpful.
      
      Your goals:
      1. Guide users on how to recycle specific e-waste items (batteries, phones, laptops).
      2. Explain the environmental impact of e-waste in simple but impactful terms.
      3. Help locate hypothetical nearby facilities (you can invent realistic sounding local centers if asked for "nearby", or ask for their city).
      4. Use formatting like bullet points for clarity.
      5. Keep answers concise but warm. Avoid robotic phrasing.
      
      Design constraints:
      - Use emojis sparingly but effectively (🌿, 🔋, ♻️).
      - If unsure, encourage them to visit a local certified center.`,
            },
            history: history.map(h => ({
                role: h.role,
                parts: h.parts
            })),
        });

        const result = await chat.sendMessage({ message });
        return result.text || "";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "I'm having trouble connecting to the eco-network right now. Please try again in a moment.";
    }
};
