import { GoogleGenAI } from "@google/generative-ai";

export const generateStageImage = async (prompt: string): Promise<string | null> => {
  try {
    const genAI = new GoogleGenAI("AIzaSyDzVCcDoOrqeEnspgETG2550K2XMJYAyxc");
    const model = genAI.getGenerativeModel({ model: "gemini-3.0-flash" });

    const result = await model.generateContent([
      `${prompt}. Breathtaking digital masterpiece, high quality, highly detailed digital anime style, cinematic lighting, vibrant soft colors, 4k, clean composition.`
    ]);

    const response = await result.response;
    const candidate = response.candidates?.[0];

    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    console.warn("No image data found");
    return null;
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
};
