import { GoogleGenerativeAI } from '@google/generative-ai';

// import.meta.env を使用して環境変数にアクセス
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('Gemini API key is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

export async function getGeminiResponse(prompt: string): Promise<string> {
  if (!API_KEY) {
    throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your environment.');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error getting Gemini response:', error);
    throw new Error('AIレスポンスの生成中にエラーが発生しました。');
  }
} 