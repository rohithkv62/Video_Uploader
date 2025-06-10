
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Ensure process.env.API_KEY is used as per instructions.
// If process.env is not populated in browser, this will be undefined.
// The instructions state "Assume this variable is pre-configured, valid, and accessible".
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn("Gemini API Key (process.env.API_KEY) is not set. Translation service will not work.");
}

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (!ai) {
    throw new Error("Gemini API client not initialized. API Key might be missing.");
  }
  if (!text.trim()) {
    return ""; // Return empty if input is empty
  }

  try {
    const model = 'gemini-2.5-flash-preview-04-17';
    const prompt = `Translate the following text to ${targetLanguage}: "${text}"`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error translating text with Gemini API:", error);
    throw error; // Re-throw to be handled by the caller
  }
};