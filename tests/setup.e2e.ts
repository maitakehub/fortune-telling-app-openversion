import { beforeAll, afterAll } from '@jest/globals';
import { createLogger } from '../server/src/utils/logger';

const logger = createLogger('E2ETestSetup');

beforeAll(async () => {
  try {
    // フロントエンドサーバーとバックエンドサーバーが起動していることを確認
    logger.info('Starting E2E test setup');
    
    // 環境変数の設定
    process.env.NODE_ENV = 'test';
    process.env.PORT = '5173';
    process.env.API_URL = 'http://localhost:5173/api';
    
    logger.info('E2E test setup completed');
  } catch (error) {
    logger.error('Failed to setup E2E test environment:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    logger.info('Cleaning up E2E test environment');
    // 必要なクリーンアップ処理を追加
  } catch (error) {
    logger.error('Failed to cleanup E2E test environment:', error);
    throw error;
  }
}); 