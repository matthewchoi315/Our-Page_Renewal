import { GoogleGenAI } from "@google/generative-ai";

export const generateStageImage = async (prompt: string): Promise<string | null> => {
  try {
    const genAI = new GoogleGenAI("AIzaSyDzVCcDoOrqeEnspgETG2550K2XMJYAyxc");
    const model = genAI.getGenerativeModel({ model: "gemini-3.0-flash" });

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const candidate = response.candidates?.[0];

    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
};
