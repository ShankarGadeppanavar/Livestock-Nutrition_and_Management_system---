
import { GoogleGenAI } from "@google/genai";
import { Pig, FeedStatus } from "../types.ts";

// Initialize AI with the environment-provided API key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fetches AI-generated nutrition and management advice based on current herd state.
 * Uses gemini-3-pro-preview for complex reasoning over agricultural metrics.
 */
export const getNutritionAdvice = async (pigs: Pig[]) => {
  if (!pigs || pigs.length === 0) return "Add livestock to the registry to receive AI-powered insights.";

  const underfedCount = pigs.filter(p => p.status === FeedStatus.UNDERFED).length;
  const totalWeight = pigs.reduce((acc, p) => acc + p.weight, 0);
  const avgWeight = totalWeight / pigs.length;
  const groups = Array.from(new Set(pigs.map(p => p.group))).join(', ');

  const prompt = `
    Analyze this livestock herd profile:
    - Population: ${pigs.length} animals
    - Underfeeding Rate: ${((underfedCount / pigs.length) * 100).toFixed(1)}%
    - Avg Weight: ${avgWeight.toFixed(2)} kg
    - Active Groups: ${groups}

    Provide 3 concise, high-impact management tips. 
    Format using markdown bullet points (* Item) and use **bold** for key terms.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are an expert livestock nutritionist and farm systems engineer. You specialize in maximizing Feed Conversion Ratios (FCR) and herd health through precision nutrition.",
        temperature: 0.75,
        topP: 0.9,
      }
    });
    
    return response.text || "Ensure regular trough cleaning and check for competition among Growers.";
  } catch (error) {
    console.error("Gemini advice error:", error);
    return "Insights temporarily unavailable. Manual check recommended for: **Trough Distribution Efficiency** and **Group Ration Accuracy**.";
  }
};
