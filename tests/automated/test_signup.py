import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestSignup:
    @pytest.fixture
    def driver(self):
        driver = webdriver.Chrome()
        driver.implicitly_wait(10)
        yield driver
        driver.quit()

    def test_successful_signup(self, driver):
        """正常な新規登録フローのテスト"""
        driver.get("http://localhost:5176/signup")

        # フォームの入力
        wait = WebDriverWait(driver, 10)
        email = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='email-input']")))
        password = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='password-input']")))
        submit_button = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='signup-button']")))

        email.send_keys("test@example.com")
        password.send_keys("Password123!")
        submit_button.click()

        # 成功メッセージの確認
        alert = wait.until(EC.alert_is_present())
        assert "Signup successful!" in alert.text
        alert.accept()

    def test_duplicate_email(self, driver):
        """既存のメールアドレスでの登録試行テスト"""
        driver.get("http://localhost:5176/signup")

        # フォームの入力
        wait = WebDriverWait(driver, 10)
        email = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='email-input']")))
        password = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='password-input']")))
        submit_button = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='signup-button']")))

        email.send_keys("existing@example.com")
        password.send_keys("Password123!")
        submit_button.click()

        # エラーメッセージの確認
        error_message = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='error-message']")))
        assert "新規登録に失敗しました。" in error_message.text

    def test_password_validation(self, driver):
        """パスワードバリデーションのテスト"""
        driver.get("http://localhost:5176/signup")

        # フォームの入力
        wait = WebDriverWait(driver, 10)
        email = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='email-input']")))
        password = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='password-input']")))
        submit_button = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='signup-button']")))

        email.send_keys("test@example.com")
        password.send_keys("weak")
        submit_button.click()

        # エラーメッセージの確認
        error_message = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='error-message']")))
        assert "新規登録に失敗しました。" in error_message.text 