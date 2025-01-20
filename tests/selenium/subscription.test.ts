import { describe, it, before, after, beforeEach } from 'mocha';
import { Builder, WebDriver, By, until } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';
import { expect } from 'chai';
import { getChromeOptions } from './config/chrome';
import { waitForElement, clearBrowserData, takeScreenshot } from './utils/testHelpers';

let driver: WebDriver;
const baseUrl = 'http://localhost:5174';

describe('サブスクリプションテスト', function(this: Mocha.Suite) {
  this.timeout(60000);

  before(async () => {
    const options = getChromeOptions();
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    await driver.manage().setTimeouts({
      pageLoad: 30000,
      script: 30000,
      implicit: 5000
    });

    await clearBrowserData(driver);
  });

  after(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  describe('プラン表示', () => {
    it('サブスクリプションページが表示されること', async () => {
      await driver.get(`${baseUrl}/subscription`);
      const title = await driver.getTitle();
      expect(title).to.contain('サブスクリプション');
    });

    it('3つのプランが表示されること', async () => {
      const plans = await driver.findElements(By.css('.subscription-plan'));
      const displayedPlans = await Promise.all(plans.map(plan => plan.isDisplayed()));
      const visiblePlansCount = displayedPlans.filter(Boolean).length;
      expect(visiblePlansCount).to.equal(3);
    });

    it('各プランの詳細が正しく表示されること', async () => {
      const plans = await driver.findElements(By.css('.subscription-plan'));
      
      for (const plan of plans) {
        const name = await plan.findElement(By.css('.plan-name')).getText();
        const price = await plan.findElement(By.css('.plan-price')).getText();
        const features = await plan.findElements(By.css('.plan-feature'));
        
        expect(name).to.be.a('string').and.not.empty;
        expect(price).to.match(/¥\d+/);
        expect(features).to.have.length.above(0);
      }
    });
  });

  describe('プラン選択と支払い', () => {
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'Test@123';

    before(async () => {
      // ユーザー登録
      await driver.get(`${baseUrl}/signup`);
      const emailInput = await waitForElement(driver, '[data-testid="email-input"]');
      const passwordInput = await waitForElement(driver, '[data-testid="password-input"]');
      
      await emailInput.sendKeys(testEmail);
      await passwordInput.sendKeys(testPassword);
      
      const submitButton = await waitForElement(driver, '[data-testid="signup-button"]');
      await submitButton.click();
      
      await driver.wait(until.urlContains('/dashboard'), 5000);
    });

    it('プレミアムプランを選択できること', async () => {
      await driver.get(`${baseUrl}/subscription`);
      const premiumPlan = await waitForElement(driver, '[data-testid="premium-plan"]');
      const selectButton = await premiumPlan.findElement(By.css('.select-plan-button'));
      await selectButton.click();
      
      const confirmDialog = await waitForElement(driver, '.confirmation-dialog');
      expect(await confirmDialog.isDisplayed()).to.be.true;
    });

    it('支払い情報を入力できること', async () => {
      const cardNumberInput = await waitForElement(driver, '[data-testid="card-number"]');
      const expiryInput = await waitForElement(driver, '[data-testid="expiry"]');
      const cvcInput = await waitForElement(driver, '[data-testid="cvc"]');
      
      await cardNumberInput.sendKeys('4242424242424242');
      await expiryInput.sendKeys('1225');
      await cvcInput.sendKeys('123');
      
      const submitButton = await waitForElement(driver, '[data-testid="payment-submit"]');
      expect(await submitButton.isEnabled()).to.be.true;
    });

    it('エラー時にエラーメッセージが表示されること', async () => {
      const cardNumberInput = await waitForElement(driver, '[data-testid="card-number"]');
      await cardNumberInput.clear();
      await cardNumberInput.sendKeys('4242424242424241'); // 無効なカード番号
      
      const submitButton = await waitForElement(driver, '[data-testid="payment-submit"]');
      await submitButton.click();
      
      const errorMessage = await waitForElement(driver, '.error-message');
      expect(await errorMessage.getText()).to.include('カード情報が無効です');
    });
  });

  describe('サブスクリプション管理', () => {
    it('現在のプラン情報が表示されること', async () => {
      await driver.get(`${baseUrl}/subscription/manage`);
      const currentPlan = await waitForElement(driver, '[data-testid="current-plan"]');
      expect(await currentPlan.isDisplayed()).to.be.true;
    });

    it('プランをキャンセルできること', async () => {
      const cancelButton = await waitForElement(driver, '[data-testid="cancel-subscription"]');
      await cancelButton.click();
      
      const confirmDialog = await waitForElement(driver, '.confirmation-dialog');
      const confirmButton = await confirmDialog.findElement(By.css('[data-testid="confirm-cancel"]'));
      await confirmButton.click();
      
      const successMessage = await waitForElement(driver, '.success-message');
      expect(await successMessage.getText()).to.include('キャンセルされました');
    });
  });
}); 