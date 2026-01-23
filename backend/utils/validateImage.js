import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

export const validateCarImage = async (imagePath, apiKey) => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString("base64");

    const prompt = "Analyze this image. Does it show a car, vehicle, or a car accident? If yes, answer 'YES'. If the image is unclear, blurry, or does not contain a car or vehicle, answer 'NO'. Return ONLY 'YES' or 'NO'.";

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg", 
        },
      },
    ]);

    const response = await result.response;
    const text = response.text().trim().toUpperCase();

    return text === "YES";
  } catch (err) {
    console.error("Gemini Image Validation Error:", err);
    return false;
  }
};
