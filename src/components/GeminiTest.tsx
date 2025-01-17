// file: src/components/GeminiTest.tsx

import React, { useState } from 'react';
import { getOpenAIResponse } from '../utils/openai';

export default function GeminiTest() {
  // ユーザーが入力したテキストを保持するState
  const [userInput, setUserInput] = useState('');
  
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // テスト実行（OpenAIに問い合わせ）
  const testGemini = async () => {
    setLoading(true);
    setError('');
    try {
      // ここを変更して、userInputを引数に渡す
      const result = await getOpenAIResponse(userInput, [], new Date());
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      console.error('Gemini Test Error:', err);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-purple-100">Gemini API テスト</h2>

      {/* ユーザーの入力欄を追加 */}
      <div className="space-y-2">
        <label className="block text-purple-200">質問を入力:</label>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="蠍座の恋愛運を教えて"
          className="p-2 rounded text-black w-full"
        />
      </div>

      <button
        onClick={testGemini}
        disabled={loading}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? 'テスト実行中...' : 'テスト実行'}
      </button>

      {error && (
        <div className="p-4 bg-red-500/20 text-red-100 rounded-lg">
          エラー: {error}
        </div>
      )}

      {response && (
        <div className="p-4 bg-purple-800/20 text-purple-100 rounded-lg">
          <h3 className="font-bold mb-2">API レスポンス:</h3>
          <pre className="whitespace-pre-wrap">{response}</pre>
        </div>
      )}
    </div>
  );
}
