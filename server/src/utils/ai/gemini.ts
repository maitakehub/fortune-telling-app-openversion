import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message, MessageRole } from '../../types/chat';
import { createLogger } from '../logger';

const logger = createLogger('Gemini');

// 環境変数からAPIキーを取得
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;

// Geminiモデルの設定
const MODEL_NAME = 'gemini-pro';
const TEMPERATURE = 0.7;
const TOP_P = 0.8;
const TOP_K = 40;

// エラー型の定義
class GeminiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiError';
  }
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Gemini APIを使用してレスポンスを生成する
 * @param systemPrompt システムプロンプト
 * @param messages 会話履歴
 * @returns 生成されたレスポンス
 */
export async function generateGeminiResponse(
  systemPrompt: string,
  messages: Message[]
): Promise<string> {
  try {
    if (!GEMINI_API_KEY) {
      throw new GeminiError('Gemini APIキーが設定されていません');
    }

    // Gemini APIクライアントの初期化
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        temperature: TEMPERATURE,
        topP: TOP_P,
        topK: TOP_K,
      },
    });

    // 会話履歴の構築
    const history = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    // チャットの開始
    const chat = model.startChat({
      history,
      generationConfig: {
        temperature: TEMPERATURE,
        topP: TOP_P,
        topK: TOP_K,
      },
    });

    // レスポンスの生成
    const result = await chat.sendMessage(systemPrompt);
    const response = result.response;
    
    if (!response.text()) {
      throw new GeminiError('空のレスポンスが返されました');
    }

    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    if (error instanceof GeminiError) {
      throw error;
    }
    throw new GeminiError('Gemini APIでエラーが発生しました');
  }
}

/**
 * 画像付きのプロンプトに対してレスポンスを生成する
 * @param prompt プロンプト
 * @param imageUrl 画像URL
 * @returns 生成されたレスポンス
 */
export async function generateGeminiVisionResponse(
  prompt: string,
  imageUrl: string
): Promise<string> {
  try {
    if (!GEMINI_API_KEY) {
      throw new GeminiError('Gemini APIキーが設定されていません');
    }

    // Gemini APIクライアントの初期化
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    // 画像データの取得
    const imageResponse = await fetch(imageUrl);
    const imageData = await imageResponse.arrayBuffer();
    
    // 画像MIMEタイプの判定
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // プロンプトと画像データの準備
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: Buffer.from(imageData).toString('base64'),
          mimeType
        }
      }
    ]);

    const response = result.response;
    
    if (!response.text()) {
      throw new GeminiError('空のレスポンスが返されました');
    }

    return response.text();
  } catch (error) {
    console.error('Gemini Vision API error:', error);
    if (error instanceof GeminiError) {
      throw error;
    }
    throw new GeminiError('Gemini Vision APIでエラーが発生しました');
  }
}

export async function generateResponse(
  message: string,
  history: Message[]
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }))
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    logger.error('AI応答の生成に失敗しました', { error });
    throw error;
  }
} 