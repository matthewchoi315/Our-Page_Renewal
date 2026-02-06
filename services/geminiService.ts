
import { GoogleGenAI } from "@google/genai";

export const generateStageImage = async (prompt: string): Promise<string | null> => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing. Assume pre-configured in production.");
    return null;
  }

  try {
    const ai = new GoogleGenAI({"AIzaSyDzVCcDoOrqeEnspgETG2550K2XMJYAyxc"});
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `${prompt}. Breathtaking digital masterpiece, high quality, highly detailed digital anime style, cinematic lighting, vibrant soft colors, 4k, clean composition.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        },
      },
    });

    // Check all parts for inlineData (image bytes)
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    console.warn("No image data found in Gemini response parts");
    return null;
  } catch (error) {
    console.error("Gemini image generation error:", error);
    return null;
  }
};
