import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestLogin:
    @pytest.fixture(scope="function")
    def driver(self):
        driver = webdriver.Chrome()
        driver.implicitly_wait(10)
        yield driver
        driver.quit()

    def test_successful_login(self, driver):
        """正常なログインフローのテスト"""
        driver.get("http://localhost:5173/login")
        
        # ログインフォームの入力
        email = driver.find_element(By.ID, "email")
        password = driver.find_element(By.ID, "password")
        submit = driver.find_element(By.ID, "login-button")
        
        email.send_keys("test@example.com")
        password.send_keys("password123")
        submit.click()
        
        # ダッシュボードへのリダイレクト確認
        WebDriverWait(driver, 10).until(
            EC.url_to_be("http://localhost:5173/dashboard")
        )
        assert driver.current_url == "http://localhost:5173/dashboard"

    def test_invalid_credentials(self, driver):
        """無効な認証情報でのログイン試行テスト"""
        driver.get("http://localhost:5173/login")
        
        email = driver.find_element(By.ID, "email")
        password = driver.find_element(By.ID, "password")
        submit = driver.find_element(By.ID, "login-button")
        
        email.send_keys("invalid@example.com")
        password.send_keys("wrongpassword")
        submit.click()
        
        # エラーメッセージの確認
        error_message = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "error-message"))
        )
        assert "メールアドレスまたはパスワードが正しくありません" in error_message.text

    def test_empty_fields(self, driver):
        """空のフィールドでのログイン試行テスト"""
        driver.get("http://localhost:5173/login")
        
        submit = driver.find_element(By.ID, "login-button")
        submit.click()
        
        # バリデーションメッセージの確認
        email_error = driver.find_element(By.ID, "email-error")
        password_error = driver.find_element(By.ID, "password-error")
        
        assert "メールアドレスを入力してください" in email_error.text
        assert "パスワードを入力してください" in password_error.text 