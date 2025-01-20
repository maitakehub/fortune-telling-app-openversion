import { FortuneReading, TarotReading, NumerologyReading, PalmReading, DreamReading } from '../types';
import { AuthError, ErrorType } from '../types/errors';

const API_URL = import.meta.env.VITE_API_URL || `http://localhost:${import.meta.env.EXPRESS_PORT || '3000'}`;

// 占い結果をサーバーに保存
export async function saveFortuneReading(reading: FortuneReading): Promise<void> {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new AuthError(
      ErrorType.UNAUTHORIZED,
      'ログインが必要です'
    );
  }

  const response = await fetch(`${API_URL}/api/fortune/readings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(reading)
  });

  if (!response.ok) {
    throw new Error('占い結果の保存に失敗しました');
  }
}

// 占い結果をローカルストレージにも保存
export function saveFortuneReadingLocally(reading: FortuneReading): void {
  try {
    const readings = getFortuneReadingsFromLocal();
    readings.push(reading);
    localStorage.setItem('fortuneReadings', JSON.stringify(readings));
  } catch (error) {
    console.error('ローカルストレージへの保存に失敗:', error);
    throw new Error('ローカルストレージへの保存に失敗しました');
  }
}

// ローカルストレージから占い結果を取得
export function getFortuneReadingsFromLocal(): FortuneReading[] {
  try {
    const stored = localStorage.getItem('fortuneReadings');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('ローカルストレージからの読み込みに失敗:', error);
    return [];
  }
}

// サーバーから占い結果を取得
export async function getFortuneReadings(): Promise<FortuneReading[]> {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new AuthError(
      ErrorType.UNAUTHORIZED,
      'ログインが必要です'
    );
  }

  const response = await fetch(`${API_URL}/api/fortune/readings`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('占い結果の取得に失敗しました');
  }

  return response.json();
}

// 特定の種類の占い結果のみを取得
export function getReadingsByType<T extends FortuneReading>(
  readings: FortuneReading[],
  type: T['type']
): T[] {
  return readings.filter(reading => reading.type === type) as T[];
}

// 占い結果をPDFとしてエクスポート
export async function exportReadingToPDF(reading: FortuneReading): Promise<Blob> {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new AuthError(
      ErrorType.UNAUTHORIZED,
      'ログインが必要です'
    );
  }

  const response = await fetch(`${API_URL}/api/fortune/export/pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(reading)
  });

  if (!response.ok) {
    throw new Error('PDFのエクスポートに失敗しました');
  }

  return response.blob();
}

// 占い結果をJSONとしてエクスポート
export function exportReadingToJSON(reading: FortuneReading): string {
  try {
    return JSON.stringify(reading, null, 2);
  } catch (error) {
    console.error('JSONエクスポートに失敗:', error);
    throw new Error('JSONエクスポートに失敗しました');
  }
}

// 占い結果の削除
export async function deleteFortuneReading(readingId: string): Promise<void> {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new AuthError(
      ErrorType.UNAUTHORIZED,
      'ログインが必要です'
    );
  }

  const response = await fetch(`${API_URL}/api/fortune/readings/${readingId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('占い結果の削除に失敗しました');
  }

  // ローカルストレージからも削除
  try {
    const readings = getFortuneReadingsFromLocal();
    const updatedReadings = readings.filter(reading => 
      'id' in reading && reading.id !== readingId
    );
    localStorage.setItem('fortuneReadings', JSON.stringify(updatedReadings));
  } catch (error) {
    console.error('ローカルストレージからの削除に失敗:', error);
  }
} 