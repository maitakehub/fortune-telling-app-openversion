import { describe, it, before, after, beforeEach } from 'mocha';
import { Builder, WebDriver, By, until } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';
import { expect } from 'chai';
import { getChromeOptions } from './config/chrome';
import chrome from 'selenium-webdriver/chrome';
import 'chromedriver';
import * as path from 'path';

let driver: WebDriver;
const baseUrl = 'http://localhost:5174';
const testEmail = `test_${Date.now()}@example.com`;
const testPassword = 'Test123!';

describe('プロフィールテスト', function(this: Mocha.Suite) {
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

    // 初期ページにアクセスしてからlocalStorageをクリア
    await driver.get('http://localhost:5173');
    await driver.executeScript('window.localStorage.clear();');
    await driver.manage().deleteAllCookies();
    console.log('テスト環境の初期化が完了しました');
  });

  after(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  it('プロフィール情報の入力と保存', async function() {
    try {
      // 新規登録
      const testEmail = `test${Date.now()}@example.com`;
      const testPassword = 'Test@123';

      // 新規登録リンクをクリック
      const signupLink = await driver.wait(
        until.elementLocated(By.css('a[href="/signup"]')),
        30000,
        '新規登録リンクが見つかりませんでした'
      );
      await signupLink.click();
      console.log('新規登録ページに遷移しました');

      // メールアドレスとパスワードを入力
      const emailInput = await driver.wait(
        until.elementLocated(By.css('[data-testid="email-input"]')),
        30000,
        'メールアドレス入力フィールドが見つかりませんでした'
      );
      await emailInput.sendKeys(testEmail);

      const passwordInput = await driver.wait(
        until.elementLocated(By.css('[data-testid="password-input"]')),
        30000,
        'パスワード入力フィールドが見つかりませんでした'
      );
      await passwordInput.sendKeys(testPassword);

      // 登録ボタンをクリック
      const submitButton = await driver.wait(
        until.elementLocated(By.css('[data-testid="signup-button"]')),
        30000,
        '登録ボタンが見つかりませんでした'
      );
      await submitButton.click();
      console.log('新規登録フォームを送信しました');

      // プロフィール設定ページへの遷移を確認
      await driver.wait(
        until.urlContains('/personal-info'),
        30000,
        'プロフィール設定ページへの遷移に失敗しました'
      );
      console.log('プロフィール設定ページに遷移しました');

      // プロフィール情報を入力
      const nameInput = await driver.wait(
        until.elementLocated(By.css('[data-testid="name-input"]')),
        30000,
        '名前入力フィールドが見つかりませんでした'
      );
      await nameInput.sendKeys('テストユーザー');

      const birthDateInput = await driver.wait(
        until.elementLocated(By.css('[data-testid="birth-date-input"]')),
        30000,
        '生年月日入力フィールドが見つかりませんでした'
      );
      await birthDateInput.sendKeys('2000-01-01');

      const birthTimeInput = await driver.wait(
        until.elementLocated(By.css('[data-testid="birth-time-input"]')),
        30000,
        '誕生時刻入力フィールドが見つかりませんでした'
      );
      await birthTimeInput.sendKeys('12:00');

      // 性別を選択
      const genderRadio = await driver.wait(
        until.elementLocated(By.css('[data-testid="gender-male"]')),
        30000,
        '性別選択ラジオボタンが見つかりませんでした'
      );
      await driver.executeScript("arguments[0].click();", genderRadio);

      // プロフィール画像をアップロード
      const imageInput = await driver.wait(
        until.elementLocated(By.css('[data-testid="profile-image-input"]')),
        30000,
        'プロフィール画像入力フィールドが見つかりませんでした'
      );
      const imagePath = path.resolve(__dirname, '../../tests/assets/test-profile.jpg');
      await imageInput.sendKeys(imagePath);

      // 保存ボタンをクリック
      const saveButton = await driver.wait(
        until.elementLocated(By.css('[data-testid="save-button"]')),
        30000,
        '保存ボタンが見つかりませんでした'
      );
      await saveButton.click();
      console.log('プロフィール情報を保存しました');

      // 成功メッセージを確認
      const successMessage = await driver.wait(
        until.elementLocated(By.css('[data-testid="success-message"]')),
        30000,
        '成功メッセージが表示されませんでした'
      );
      const messageText = await successMessage.getText();
      expect(messageText).to.include('プロフィール情報を保存しました');
      console.log('プロフィール情報の保存が完了しました');

    } catch (error) {
      console.error('テスト実行中にエラーが発生しました:', error);
      throw error;
    }
  });

  it('プロフィール画像のアップロード', async function() {
    try {
      console.log('画像アップロードテストを開始します');

      // テスト用の画像パスを設定
      const imagePath = path.resolve(__dirname, '../assets/test-profile.jpg');

      // ファイル入力要素を見つける
      const fileInput = await driver.wait(
        until.elementLocated(By.css('[data-testid="image-input"]')),
        30000
      );

      // 画像をアップロード
      await fileInput.sendKeys(imagePath);
      console.log('画像をアップロードしました');

      // プレビュー画像が表示されるのを待つ
      await driver.wait(
        until.elementLocated(By.css('[data-testid="profile-image"]')),
        30000
      );
      console.log('プレビュー画像が表示されました');

      // 保存ボタンをクリック
      const saveButton = await driver.wait(
        until.elementLocated(By.css('[data-testid="save-button"]')),
        30000
      );
      await driver.executeScript("arguments[0].click();", saveButton);
      console.log('保存ボタンをクリックしました');

      // 成功メッセージを待つ
      await driver.wait(
        until.elementLocated(By.css('[data-testid="success-message"]')),
        30000
      );
      console.log('プロフィール画像が正常にアップロードされました');

    } catch (error) {
      console.error('テスト実行中にエラーが発生しました:', error);
      await driver.takeScreenshot().then(function(data) {
        require('fs').writeFileSync('upload-error.png', data, 'base64');
        console.log('エラー時のスクリーンショットを保存しました: upload-error.png');
      });
      throw error;
    }
  });

  it('入力値バリデーション', async function() {
    try {
      console.log('バリデーションテストを開始します');

      // 名前フィールドをクリア
      const nameInput = await driver.wait(
        until.elementLocated(By.css('[data-testid="name-input"]')),
        30000
      );
      await nameInput.clear();
      console.log('名前フィールドをクリアしました');

      // 生年月日を無効な値に設定
      const birthDateInput = await driver.wait(
        until.elementLocated(By.css('[data-testid="birthDate-input"]')),
        30000
      );
      await birthDateInput.clear();
      await birthDateInput.sendKeys('invalid-date');
      console.log('無効な生年月日を入力しました');

      // 保存ボタンをクリック
      const saveButton = await driver.wait(
        until.elementLocated(By.css('[data-testid="save-button"]')),
        30000
      );
      await driver.executeScript("arguments[0].click();", saveButton);
      console.log('保存ボタンをクリックしました');

      // エラーメッセージを待つ
      await driver.wait(
        until.elementLocated(By.css('[data-testid="name-error"]')),
        30000
      );
      const nameError = await driver.findElement(By.css('[data-testid="name-error"]'));
      expect(await nameError.getText()).to.include('必須項目です');
      console.log('名前のエラーメッセージを確認しました');

      // 生年月日のエラーメッセージを確認
      const dateError = await driver.findElement(By.css('[data-testid="birthDate-error"]'));
      expect(await dateError.getText()).to.include('有効な日付を入力してください');
      console.log('生年月日のエラーメッセージを確認しました');

      console.log('バリデーションが正常に機能しています');
    } catch (error) {
      console.error('テスト実行中にエラーが発生しました:', error);
      await driver.takeScreenshot().then(function(data) {
        require('fs').writeFileSync('validation-error.png', data, 'base64');
        console.log('エラー時のスクリーンショットを保存しました: validation-error.png');
      });
      throw error;
    }
  });
}); 