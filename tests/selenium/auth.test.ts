import { WebDriver } from 'selenium-webdriver';
import { describe, it, before, after, beforeEach } from 'mocha';
import { expect } from 'chai';
import {
  waitForElement,
  waitForUrl,
  takeScreenshot,
  clearBrowserData,
  initializeDriver,
  waitForElementAndClick,
  waitForElementAndType
} from './utils/testHelpers';

const baseUrl = 'http://localhost:5174';
const testUser = {
  email: `test${Date.now()}@example.com`,
  password: 'Test1234!'
};

describe('認証テスト', function() {
  this.timeout(60000);
  let driver: WebDriver;

  before(async function() {
    driver = await initializeDriver();
  });

  after(async function() {
    if (driver) {
      console.log('Closing ChromeDriver...');
      await driver.quit();
      console.log('ChromeDriver closed successfully');
    }
  });

  beforeEach(async function() {
    await clearBrowserData(driver);
  });

  describe('新規登録', function() {
    it('新規登録フォームが表示されること', async function() {
      console.log('Navigating to signup page...');
      await driver.get(`${baseUrl}/signup`);
      console.log('Checking signup form...');
      const form = await waitForElement(driver, '[data-testid="signup-form"]');
      expect(form).to.exist;
      console.log('Signup form verified successfully');
    });

    it('バリデーションエラーが表示されること', async function() {
      console.log('Testing validation error...');
      await driver.get(`${baseUrl}/signup`);
      await waitForElementAndClick(driver, '[data-testid="submit-button"]');
      const errorMessage = await waitForElement(driver, '[data-testid="error-message"]');
      expect(await errorMessage.getText()).to.not.be.empty;
    });

    it('新規登録が成功すること', async function() {
      console.log('Testing signup process...');
      await driver.get(`${baseUrl}/signup`);
      await waitForElementAndType(driver, '[data-testid="email-input"]', testUser.email);
      await waitForElementAndType(driver, '[data-testid="password-input"]', testUser.password);
      await waitForElementAndClick(driver, '[data-testid="submit-button"]');
      await waitForUrl(driver, `${baseUrl}/login`);
    });
  });

  describe('ログイン', function() {
    it('ログインフォームが表示されること', async function() {
      console.log('Navigating to login page...');
      await driver.get(`${baseUrl}/login`);
      console.log('Checking login form...');
      const form = await waitForElement(driver, '[data-testid="login-form"]');
      expect(form).to.exist;
      console.log('Login form verified successfully');
    });

    it('無効な認証情報でログインが失敗すること', async function() {
      console.log('Testing invalid login...');
      await driver.get(`${baseUrl}/login`);
      await waitForElementAndType(driver, '[data-testid="email-input"]', 'invalid@example.com');
      await waitForElementAndType(driver, '[data-testid="password-input"]', 'invalid');
      await waitForElementAndClick(driver, '[data-testid="submit-button"]');
      const errorMessage = await waitForElement(driver, '[data-testid="error-message"]');
      expect(await errorMessage.getText()).to.not.be.empty;
    });

    it('有効な認証情報でログインが成功すること', async function() {
      console.log('Testing valid login...');
      await driver.get(`${baseUrl}/login`);
      await waitForElementAndType(driver, '[data-testid="email-input"]', testUser.email);
      await waitForElementAndType(driver, '[data-testid="password-input"]', testUser.password);
      await waitForElementAndClick(driver, '[data-testid="submit-button"]');
      await waitForUrl(driver, `${baseUrl}/dashboard`);
    });
  });

  describe('ログアウト', function() {
    it('ログアウトが成功すること', async function() {
      console.log('Testing logout...');
      // まずログインする
      await driver.get(`${baseUrl}/login`);
      await waitForElementAndType(driver, '[data-testid="email-input"]', testUser.email);
      await waitForElementAndType(driver, '[data-testid="password-input"]', testUser.password);
      await waitForElementAndClick(driver, '[data-testid="submit-button"]');
      await waitForUrl(driver, `${baseUrl}/dashboard`);

      // ログアウトする
      await waitForElementAndClick(driver, '[data-testid="logout-button"]');
      await waitForUrl(driver, `${baseUrl}/login`);
    });
  });
}); 