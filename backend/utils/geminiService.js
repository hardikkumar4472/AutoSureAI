import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: fs.readFileSync(path).toString("base64"),
      mimeType
    },
  };
}

export const validateAccidentImage = async (filePath, mimeType) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("⚠️ GEMINI_API_KEY is missing. Skipping image validation.");
      return true; // Allow if no key is configured
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Analyze this image. Is it related to a car, a vehicle, traffic, or a car accident? Answer strictly with 'YES' or 'NO'.";
    
    // Ensure mimeType is valid for Gemini (jpeg, png, webp, heic, heif)
    // Multer gives e.g., 'image/jpeg'
    const imagePart = fileToGenerativePart(filePath, mimeType);

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text().trim().toUpperCase();

    console.log(`Gemini Image Analysis: ${text}`);

    return text.includes("YES");
  } catch (error) {
    console.error("Gemini Validation Error:", error);
    // Fallback: If external service fails, we might want to allow it to not block the user 
    // or block it. Given this is a filter, failing open is usually safer for UX unless strict security.
    return true; 
  }
};
