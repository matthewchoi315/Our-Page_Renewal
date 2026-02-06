import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateStageImage = async (prompt: string): Promise<string | null> => {
  try {
    const genAI = new GoogleGenerativeAI("AIzaSyDzVCcDoOrqeEnspgETG2550K2XMJYAyxc");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    
    if (!response.candidates || response.candidates.length === 0) {
      return null;
    }

    const parts = response.candidates[0].content.parts;
    for (const part of parts) {
      if (part.inlineData?.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
};
