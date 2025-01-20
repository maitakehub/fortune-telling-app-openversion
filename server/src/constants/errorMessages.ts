import { ErrorType } from '../types/errors';

interface ErrorMessage {
  ja: string;
  en: string;
}

export const ErrorMessages: Record<ErrorType, ErrorMessage> = {
  [ErrorType.VALIDATION]: {
    ja: "入力内容が正しくありません。",
    en: "Invalid input."
  },
  [ErrorType.AUTHENTICATION]: {
    ja: "認証に失敗しました。",
    en: "Authentication failed."
  },
  [ErrorType.AUTHORIZATION]: {
    ja: "アクセス権限がありません。",
    en: "Access denied."
  },
  [ErrorType.NOT_FOUND]: {
    ja: "リソースが見つかりません。",
    en: "Resource not found."
  },
  [ErrorType.DUPLICATE]: {
    ja: "リソースが既に存在します。",
    en: "Resource already exists."
  },
  [ErrorType.NETWORK]: {
    ja: "ネットワークエラーが発生しました。",
    en: "Network error occurred."
  },
  [ErrorType.SERVER]: {
    ja: "サーバーエラーが発生しました。",
    en: "Internal server error occurred."
  },
  [ErrorType.UNKNOWN]: {
    ja: "予期せぬエラーが発生しました。",
    en: "An unexpected error occurred."
  }
};

export const getErrorMessage = (type: ErrorType, language: 'ja' | 'en' = 'ja'): string => {
  return ErrorMessages[type][language];
};

export type ErrorMessageKey = keyof typeof ErrorMessages;
export type ErrorMessageValue = typeof ErrorMessages[ErrorMessageKey];
export type ErrorMessageLanguage = keyof ErrorMessage; 