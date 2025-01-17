import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.action_chains import ActionChains
import time
import os
from datetime import datetime

class TestEdgeCases:
    BASE_URL = "http://localhost:5175"

    @pytest.fixture
    def driver(self):
        options = webdriver.ChromeOptions()
        options.add_argument('--start-maximized')
        driver = webdriver.Chrome(options=options)
        driver.implicitly_wait(10)
        yield driver
        driver.quit()

    def save_screenshot(self, driver, name):
        screenshot_dir = os.path.join(os.getcwd(), 'test_screenshots', 'edge_cases')
        if not os.path.exists(screenshot_dir):
            os.makedirs(screenshot_dir)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{name}_{timestamp}.png"
        filepath = os.path.join(screenshot_dir, filename)
        
        driver.save_screenshot(filepath)
        print(f"Screenshot saved: {filepath}")

    def test_rapid_fortune_requests(self, driver):
        """短時間での連続リクエストをテスト"""
        try:
            wait = WebDriverWait(driver, 10)
            driver.get(f"{self.BASE_URL}/signup")
            
            # ログイン
            email_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='email-input']")))
            password_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='password-input']")))
            
            test_email = f"test_{int(time.time())}@example.com"
            email_input.send_keys(test_email)
            password_input.send_keys("Password123!")
            
            signup_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='signup-button']")))
            signup_button.click()
            
            # 個人情報の入力をスキップ
            wait.until(EC.url_to_be(f"{self.BASE_URL}/personal-info"))
            submit_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='submit-personal-info']")))
            submit_button.click()
            
            # 短時間で複数回の占いリクエストを実行
            wait.until(EC.url_to_be(f"{self.BASE_URL}/fortune"))
            for i in range(5):
                fortune_type_select = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='fortune-type']")))
                Select(fortune_type_select).select_by_value("horoscope")
                
                question_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='question-input']")))
                question_input.clear()
                question_input.send_keys(f"テスト質問{i+1}")
                
                submit_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='submit-fortune']")))
                submit_button.click()
                
                # レート制限のエラーメッセージを確認
                error_message = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='error-message']")))
                assert "しばらく待ってから" in error_message.text, "レート制限のエラーメッセージが表示されていません"
                self.save_screenshot(driver, f"rate_limit_{i+1}")
                
                time.sleep(1)  # 1秒待機
            
        except Exception as e:
            self.save_screenshot(driver, "test_failure")
            raise

    def test_session_timeout(self, driver):
        """セッションタイムアウトをテスト"""
        try:
            wait = WebDriverWait(driver, 10)
            driver.get(f"{self.BASE_URL}/signup")
            
            # ログイン
            email_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='email-input']")))
            password_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='password-input']")))
            
            test_email = f"test_{int(time.time())}@example.com"
            email_input.send_keys(test_email)
            password_input.send_keys("Password123!")
            
            signup_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='signup-button']")))
            signup_button.click()
            
            # 個人情報の入力をスキップ
            wait.until(EC.url_to_be(f"{self.BASE_URL}/personal-info"))
            submit_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='submit-personal-info']")))
            submit_button.click()
            
            # セッションタイムアウトを待機
            time.sleep(31)  # 30秒のセッションタイムアウト + 1秒
            
            # 占いを実行しようとする
            wait.until(EC.url_to_be(f"{self.BASE_URL}/fortune"))
            fortune_type_select = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='fortune-type']")))
            Select(fortune_type_select).select_by_value("horoscope")
            
            question_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='question-input']")))
            question_input.send_keys("テスト質問")
            
            submit_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='submit-fortune']")))
            submit_button.click()
            
            # セッションタイムアウトのエラーメッセージを確認
            error_message = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='error-message']")))
            assert "セッションが切れました" in error_message.text, "セッションタイムアウトのエラーメッセージが表示されていません"
            self.save_screenshot(driver, "session_timeout")
            
            # ログインページにリダイレクトされることを確認
            wait.until(EC.url_to_be(f"{self.BASE_URL}/login"))
            
        except Exception as e:
            self.save_screenshot(driver, "test_failure")
            raise

    def test_concurrent_requests(self, driver):
        """同時リクエストをテスト"""
        try:
            wait = WebDriverWait(driver, 10)
            driver.get(f"{self.BASE_URL}/signup")
            
            # ログイン
            email_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='email-input']")))
            password_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='password-input']")))
            
            test_email = f"test_{int(time.time())}@example.com"
            email_input.send_keys(test_email)
            password_input.send_keys("Password123!")
            
            signup_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='signup-button']")))
            signup_button.click()
            
            # 個人情報の入力をスキップ
            wait.until(EC.url_to_be(f"{self.BASE_URL}/personal-info"))
            submit_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='submit-personal-info']")))
            submit_button.click()
            
            # 同時に複数のリクエストを実行
            wait.until(EC.url_to_be(f"{self.BASE_URL}/fortune"))
            fortune_type_select = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='fortune-type']")))
            Select(fortune_type_select).select_by_value("horoscope")
            
            question_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='question-input']")))
            question_input.send_keys("テスト質問")
            
            # 複数回素早くクリック
            submit_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='submit-fortune']")))
            for _ in range(3):
                submit_button.click()
            
            # エラーメッセージを確認
            error_message = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='error-message']")))
            assert "リクエストが重複しています" in error_message.text, "重複リクエストのエラーメッセージが表示されていません"
            self.save_screenshot(driver, "concurrent_requests")
            
        except Exception as e:
            self.save_screenshot(driver, "test_failure")
            raise 