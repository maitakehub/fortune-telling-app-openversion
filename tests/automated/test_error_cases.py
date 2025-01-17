import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
import time
import os
from datetime import datetime

class TestErrorCases:
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
        screenshot_dir = os.path.join(os.getcwd(), 'test_screenshots', 'error_cases')
        if not os.path.exists(screenshot_dir):
            os.makedirs(screenshot_dir)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{name}_{timestamp}.png"
        filepath = os.path.join(screenshot_dir, filename)
        
        driver.save_screenshot(filepath)
        print(f"Screenshot saved: {filepath}")

    def test_invalid_email_signup(self, driver):
        """無効なメールアドレスでのサインアップをテスト"""
        try:
            wait = WebDriverWait(driver, 10)
            driver.get(f"{self.BASE_URL}/signup")
            
            email_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='email-input']")))
            password_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='password-input']")))
            
            # 無効なメールアドレスを入力
            email_input.send_keys("invalid-email")
            password_input.send_keys("Password123!")
            
            signup_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='signup-button']")))
            signup_button.click()
            
            # エラーメッセージの表示を確認
            error_message = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='error-message']")))
            assert "有効なメールアドレスを入力してください" in error_message.text
            
            self.save_screenshot(driver, "invalid_email")
            
        except Exception as e:
            self.save_screenshot(driver, "test_failure")
            raise

    def test_weak_password(self, driver):
        """弱いパスワードでのサインアップをテスト"""
        try:
            wait = WebDriverWait(driver, 10)
            driver.get(f"{self.BASE_URL}/signup")
            
            email_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='email-input']")))
            password_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='password-input']")))
            
            email_input.send_keys("test@example.com")
            # 弱いパスワードを入力
            password_input.send_keys("weak")
            
            signup_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='signup-button']")))
            signup_button.click()
            
            # エラーメッセージの表示を確認
            error_message = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='error-message']")))
            assert "パスワードは8文字以上で、大文字、小文字、数字を含める必要があります" in error_message.text
            
            self.save_screenshot(driver, "weak_password")
            
        except Exception as e:
            self.save_screenshot(driver, "test_failure")
            raise

    def test_empty_fields(self, driver):
        """空のフィールドでのサインアップをテスト"""
        try:
            wait = WebDriverWait(driver, 10)
            driver.get(f"{self.BASE_URL}/signup")
            
            signup_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='signup-button']")))
            signup_button.click()
            
            # エラーメッセージの表示を確認
            error_message = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='error-message']")))
            assert "すべての必須フィールドを入力してください" in error_message.text
            
            self.save_screenshot(driver, "empty_fields")
            
        except Exception as e:
            self.save_screenshot(driver, "test_failure")
            raise 