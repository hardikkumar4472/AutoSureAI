import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

export const validateCarImage = async (imageUrl, apiKey) => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Fetch image from Supabase URL
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const imageBase64 = Buffer.from(response.data, "binary").toString("base64");
    const mimeType = response.headers["content-type"] || "image/jpeg";

   const prompt = `Analyze this image carefully and determine if it contains any of the following:
- A car, truck, motorcycle, bus, or any motor vehicle
- A vehicle accident, collision, or crash scene
- Damaged vehicles or accident aftermath

Answer with ONLY one word:
- "YES" if the image shows any vehicle OR any type of accident/collision or any type of damage
- "NO" if the image shows neither vehicles nor accidents

Do not include any explanation, punctuation, or additional text in your response.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType, 
        },
      },
    ]);

    const geminiResponse = await result.response;
    const text = geminiResponse.text().trim().toUpperCase();

    return text === "YES";
  } catch (err) {
    console.error("Gemini Image Validation Error:", err);
    return false;
  }
};
