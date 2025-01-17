import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIResponse } from '../../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = import.meta.env.VITE_AI_MODEL || 'gemini-pro';
const TEMPERATURE = Number(import.meta.env.VITE_AI_TEMPERATURE) || 0.7;
const MAX_TOKENS = Number(import.meta.env.VITE_AI_MAX_TOKENS) || 1000;

/**
 * Gemini APIを使用してAIレスポンスを生成する
 */
export async function getGeminiResponse(
  systemPrompt: string,
  userPrompt: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<AIResponse> {
  try {
    if (!API_KEY) {
      throw new Error('Gemini API key is not set');
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL });

    const chat = model.startChat({
      history: conversationHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        temperature: TEMPERATURE,
        maxOutputTokens: MAX_TOKENS,
      },
    });

    const result = await chat.sendMessage(systemPrompt + '\n\n' + userPrompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    return { content: text };
  } catch (error) {
    console.error('Error in getGeminiResponse:', error);
    return { content: '', error: error as Error };
  }
}

/**
 * Gemini Vision APIを使用して画像を含むAIレスポンスを生成する
 */
export async function getGeminiVisionResponse(
  systemPrompt: string,
  userPrompt: string,
  imageData: string
): Promise<AIResponse> {
  try {
    if (!API_KEY) {
      throw new Error('Gemini API key is not set');
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    const result = await model.generateContent([
      systemPrompt,
      userPrompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageData,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Empty response from Gemini Vision API');
    }

    return { content: text };
  } catch (error) {
    console.error('Error in getGeminiVisionResponse:', error);
    return { content: '', error: error as Error };
  }
} 