import { GoogleGenAI } from "@google/generative-ai"; // Fixed library path

export const generateStageImage = async (prompt: string): Promise<string | null> => {
  try {
    // 1. Initialize with your API Key
    const genAI = new GoogleGenAI("AIzaSyDzVCcDoOrqeEnspgETG2550K2XMJYAyxc");
    
    // 2. Setup Gemini 3.0 Flash model
    const model = genAI.getGenerativeModel({ model: "gemini-3.0-flash" });

    // 3. Request content using the prompt you configured in AI Studio
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const candidate = response.candidates?.[0];

    // 4. Extract image data from the response
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Gemini 3.0 Flash Error");
    return null;
  }
};
