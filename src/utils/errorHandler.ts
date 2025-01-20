import { toast } from 'react-toastify';

// エラーメッセージの定数
export const ErrorMessages = {
  NETWORK_ERROR: 'ネットワークエラーが発生しました',
  SERVER_ERROR: 'サーバーエラーが発生しました',
  VALIDATION_ERROR: '入力内容に誤りがあります',
  AUTHENTICATION_ERROR: '認証エラーが発生しました',
  NOT_FOUND: 'リソースが見つかりません',
  UNKNOWN_ERROR: '予期せぬエラーが発生しました'
} as const;

// エラーの種類
export type ErrorType = keyof typeof ErrorMessages;

// APIエラーレスポンスの型
interface ApiErrorResponse {
  status?: string;
  message?: string;
  error?: string;
}

// エラーハンドリング関数
export const handleError = async (error: unknown): Promise<string> => {
  console.error('Error:', error);

  if (error instanceof Response) {
    try {
      const errorData: ApiErrorResponse = await error.json();
      const message = errorData.message || errorData.error || ErrorMessages.SERVER_ERROR;
      toast.error(message);
      return message;
    } catch {
      toast.error(ErrorMessages.SERVER_ERROR);
      return ErrorMessages.SERVER_ERROR;
    }
  }

  if (error instanceof Error) {
    if (error.message.includes('Failed to fetch')) {
      toast.error(ErrorMessages.NETWORK_ERROR);
      return ErrorMessages.NETWORK_ERROR;
    }
    toast.error(error.message);
    return error.message;
  }

  toast.error(ErrorMessages.UNKNOWN_ERROR);
  return ErrorMessages.UNKNOWN_ERROR;
};

// APIリクエスト用のラッパー関数
export const fetchWithErrorHandling = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw response;
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// 入力値バリデーション関数
export const validateInput = (value: string, type: 'email' | 'password' | 'name' | 'date'): string | null => {
  switch (type) {
    case 'email':
      if (!value) return '必須項目です';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '有効なメールアドレスを入力してください';
      break;
    case 'password':
      if (!value) return '必須項目です';
      if (value.length < 8) return 'パスワードは8文字以上で入力してください';
      if (!/[A-Z]/.test(value)) return 'パスワードには大文字を含める必要があります';
      if (!/[a-z]/.test(value)) return 'パスワードには小文字を含める必要があります';
      if (!/[0-9]/.test(value)) return 'パスワードには数字を含める必要があります';
      break;
    case 'name':
      if (!value) return '必須項目です';
      if (value.length < 2) return '名前は2文字以上で入力してください';
      break;
    case 'date':
      if (!value) return '必須項目です';
      const date = new Date(value);
      if (isNaN(date.getTime())) return '有効な日付を入力してください';
      break;
  }
  return null;
}; 