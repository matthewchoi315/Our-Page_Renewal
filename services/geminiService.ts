
import { GoogleGenAI } from "@google/genai";

export const generateStageImage = async (prompt: string): Promise<string | null> => {
  try {
    // 가이드라인에 따라 호출 직전에 인스턴스 생성
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
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
    
    console.warn("Gemini response did not contain image data.");
    return null;
  } catch (error) {
    console.error("Gemini image generation failed:", error);
    return null;
  }
};
