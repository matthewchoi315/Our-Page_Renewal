
import { GoogleGenAI } from "@google/genai";

export const generateStageImage = async (prompt: string): Promise<string | null> => {
  try {
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      console.error("API Key is missing or not configured. Image generation requires an API key. Please ensure process.env.API_KEY is correctly set in your execution environment.");
      return null;
    }

    // 가이드라인에 따라 호출 직전에 인스턴스 생성
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // 가장 빠르고 비용 효율적인 이미지 모델
      contents: {
        parts: [
          {
            text: `${prompt}. Digital anime masterpiece, high quality, vibrant and soft colors, clean lines, cinematic lighting, 4k resolution, centered composition.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        },
      },
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    console.warn("Gemini response did not contain image data, or candidate was empty.");
    return null;
  } catch (error: any) {
    if (error.message?.includes("API_KEY_INVALID")) {
      console.error("Gemini image generation failed: The provided API Key is invalid. Please check your API key configuration.", error);
    } else {
      console.error("Gemini image generation failed due to an API error:", error);
    }
    return null;
  }
};
