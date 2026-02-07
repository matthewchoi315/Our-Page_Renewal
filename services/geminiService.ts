import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateStageImage = async (prompt: string): Promise<string | null> => {
  try {
    // 1. API 키 직접 입력 (환경변수 에러 방지)
    const genAI = new GoogleGenerativeAI("AIzaSyDzVCcDoOrqeEnspgETG2550K2XMJYAyxc");
    
    // 2. 모델 설정 (Gemini 1.5 Flash - 이미지 생성 안정성 최우선)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. AI Studio 설정대로 prompt 전달
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const candidate = response.candidates?.[0];

    // 4. 이미지 데이터(base64) 추출 로직
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
