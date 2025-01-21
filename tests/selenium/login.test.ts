import { describe, test, beforeAll, afterAll } from '@jest/globals';
import { WebDriver } from 'selenium-webdriver';
import {
  initializeDriver,
  waitForElement,
  waitForElementAndType,
  waitForElementAndClick,
  waitForUrlContains,
  takeScreenshot,
} from './utils/testHelpers';

describe('Login Tests', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await initializeDriver();
  });

  afterAll(async () => {
    await driver.quit();
  });

  test('should login with test account', async () => {
    // ログインページにアクセス
    await driver.get('http://localhost:5173/login');

    // メールアドレスとパスワードを入力
    await waitForElementAndType(driver, '[data-testid="email-input"]', 'test@example.com');
    await waitForElementAndType(driver, '[data-testid="password-input"]', 'Test123456');

    // ログインボタンをクリック
    await waitForElementAndClick(driver, '[data-testid="login-button"]');

    // ダッシュボードにリダイレクトされることを確認
    await waitForUrlContains(driver, '/dashboard');

    // スクリーンショットを撮影
    await takeScreenshot(driver, 'login-success');
  }, 30000);
}); 