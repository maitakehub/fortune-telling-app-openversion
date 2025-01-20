import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import time
import os
from datetime import datetime
import sys
import subprocess
from pathlib import Path
import requests

# AppStarterをインポート
sys.path.append(str(Path(__file__).parent.parent))
from scripts.start_app import AppStarter

class FortuneTellingAppTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """テストクラス全体の前処理"""
        print("Starting test setup...")
        try:
            # 環境変数の設定
            os.environ['NODE_ENV'] = 'test'
            
            # データベースのクリーンアップ
            try:
                response = requests.get('http://localhost:3000/api/user/db/cleanup')
                print(f"Initial cleanup response: {response.json()}")
            except Exception as e:
                print(f"Initial cleanup failed: {e}")

            cls.app_starter = AppStarter()
            if not cls.app_starter.start():
                raise Exception("Failed to start application")
            
            print("App starter initialized and started")
            
        except Exception as e:
            print(f"Error during setup: {str(e)}")
            raise

    @classmethod
    def tearDownClass(cls):
        """テストクラス全体の後処理"""
        # テストユーザーのクリーンアップ
        try:
            response = requests.get('http://localhost:3000/api/user/db/cleanup')
            print(f"Final cleanup response: {response.json()}")
        except Exception as e:
            print(f"Final cleanup failed: {e}")
        
        if hasattr(cls, 'app_starter'):
            cls.app_starter.cleanup()
        
        if hasattr(cls, 'driver'):
            cls.driver.quit()

    def setUp(self):
        """各テストケースの前処理"""
        print("\nInitializing test case...")  # デバッグ出力
        
        # ヘッドレスモードの設定
        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--window-size=1920,1080')
        
        self.driver = webdriver.Chrome(options=chrome_options)
        print("Chrome driver created in headless mode")  # デバッグ出力
        
        self.driver.get("http://localhost:5173")
        print("Navigated to application")  # デバッグ出力
        self.wait = WebDriverWait(self.driver, 10)

        try:
            # ページの読み込み完了を待機
            self.wait.until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            print("Page loaded successfully")  # デバッグ出力
        except TimeoutException:
            print("Timeout waiting for page to load")  # エラー出力
            self.save_screenshot("page_load_timeout")  # エラー時のスクリーンショット
            raise

    def tearDown(self):
        """各テストケースの後処理"""
        if self.driver:
            self.driver.quit()

    def test_01_signup_flow(self):
        """新規ユーザー登録のテスト"""
        try:
            print("Starting signup flow test...")  # デバッグ出力
            
            # ページ全体の読み込みを待機
            self.wait.until(
                EC.visibility_of_element_located((By.XPATH, "//div[contains(@class, 'min-h-screen')]"))
            )
            print("Main container found")  # デバッグ出力

            # 新規登録ボタンをクリック
            signup_btn = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[.//span[text()='新規登録']]"))
            )
            print("Signup button found")  # デバッグ出力
            signup_btn.click()
            print("Clicked signup button")  # デバッグ出力

            # 新規登録フォームに入力
            email_input = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
            )
            email_input.send_keys("test@example.com")

            password_input = self.driver.find_element(By.CSS_SELECTOR, "input[type='password']")
            password_input.send_keys("testpassword123")

            # 新規登録ボタンをクリック
            submit_btn = self.driver.find_element(By.XPATH, "//button[@type='submit']")
            submit_btn.click()

            # 登録成功メッセージを確認
            success_alert = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'successful')]"))
            )
            self.assertTrue(success_alert.is_displayed())
            self.save_screenshot("signup_success")

        except Exception as e:
            print(f"Error in signup flow: {str(e)}")  # エラー出力
            self.save_screenshot("signup_error")
            raise e

    def test_02_personal_info_flow(self):
        """個人情報入力フローのテスト"""
        try:
            print("個人情報入力フローテスト開始")
            
            # ページ全体の読み込みを待機
            self.wait.until(
                EC.visibility_of_element_located((By.XPATH, "//div[contains(@class, 'min-h-screen')]"))
            )
            print("ページ読み込み完了")

            # フォームの存在確認
            form = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='personal-info-form']"))
            )
            print("フォーム要素確認完了")

            # 名前入力
            name_input = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='name-input']"))
            )
            name_input.send_keys("テストユーザー")
            print("名前入力完了")

            # 生年月日入力
            birth_date = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='birth-date-input']"))
            )
            birth_date.send_keys("1990-01-01")
            print("生年月日入力完了")

            # 星座選択
            zodiac_select = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='zodiac-select']"))
            )
            zodiac_select.click()
            zodiac_select.send_keys("牡羊座")
            print("星座選択完了")

            # 送信ボタンクリック
            submit_button = self.wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='submit-personal-info']"))
            )
            submit_button.click()
            print("フォーム送信完了")

            # フォーチュンページへの遷移を待機
            self.wait.until(
                EC.url_contains("/fortune")
            )
            print("フォーチュンページへの遷移確認完了")

            current_url = self.driver.current_url
            self.assertTrue("/fortune" in current_url, f"Expected URL to contain '/fortune', but got {current_url}")

        except Exception as e:
            print(f"テスト失敗: {str(e)}")
            print(f"現在のURL: {self.driver.current_url}")
            print(f"ページソース: {self.driver.page_source}")
            raise

    def test_03_fortune_telling_flow(self):
        """占い実行フローのテスト"""
        try:
            # ページ全体の読み込みを待機
            self.wait.until(
                EC.visibility_of_element_located((By.XPATH, "//div[contains(@class, 'min-h-screen')]"))
            )

            # 星占いボタンをクリック
            astrology_btn = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[.//span[text()='星占い']]"))
            )
            astrology_btn.click()

            # チャットボットに質問を入力
            chat_input = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder*='星座']"))
            )
            chat_input.send_keys("今日の運勢を教えてください")

            # 送信ボタンをクリック
            send_btn = self.driver.find_element(By.CSS_SELECTOR, "button.absolute.right-2")
            send_btn.click()

            # レスポンスが表示されるまで待機
            response = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div.bg-indigo-600\\/50"))
            )
            self.assertTrue(response.is_displayed())
            self.save_screenshot("fortune_telling_success")

        except Exception as e:
            self.save_screenshot("fortune_telling_error")
            raise e

    def test_04_subscription_flow(self):
        """サブスクリプション購入フローのテスト"""
        try:
            # ページ全体の読み込みを待機
            self.wait.until(
                EC.visibility_of_element_located((By.XPATH, "//div[contains(@class, 'min-h-screen')]"))
            )

            # プレミアムプランボタンをクリック
            premium_btn = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'プレミアムプラン')]"))
            )
            premium_btn.click()

            # プラン選択の確認
            confirmation = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//div[contains(text(), 'プレミアム')]"))
            )
            self.assertTrue(confirmation.is_displayed())
            self.save_screenshot("subscription_success")

        except Exception as e:
            self.save_screenshot("subscription_error")
            raise e

    def save_screenshot(self, name):
        """スクリーンショットを保存する"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        screenshot_dir = "test_screenshots"
        if not os.path.exists(screenshot_dir):
            os.makedirs(screenshot_dir)
        self.driver.save_screenshot(f"{screenshot_dir}/{name}_{timestamp}.png")

if __name__ == "__main__":
    unittest.main() 