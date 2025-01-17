import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestUserSettings:
    @pytest.fixture(scope="function")
    def driver(self):
        driver = webdriver.Chrome()
        driver.implicitly_wait(10)
        # ログイン処理
        driver.get("http://localhost:5173/login")
        email = driver.find_element(By.ID, "email")
        password = driver.find_element(By.ID, "password")
        email.send_keys("test@example.com")
        password.send_keys("password123")
        driver.find_element(By.ID, "login-button").click()
        yield driver
        driver.quit()

    def test_profile_update(self, driver):
        """プロフィール更新のテスト"""
        driver.get("http://localhost:5173/settings/profile")
        
        # ユーザー名の変更
        username = driver.find_element(By.ID, "username")
        username.clear()
        username.send_keys("新しいユーザー名")
        
        # 保存ボタンをクリック
        save = driver.find_element(By.ID, "save-profile")
        save.click()
        
        # 更新完了メッセージを確認
        success_message = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "success-message"))
        )
        assert "プロフィールを更新しました" in success_message.text

    def test_email_change(self, driver):
        """メールアドレス変更のテスト"""
        driver.get("http://localhost:5173/settings/email")
        
        # 新しいメールアドレスの入力
        new_email = driver.find_element(By.ID, "new-email")
        password = driver.find_element(By.ID, "current-password")
        
        new_email.send_keys("newemail@example.com")
        password.send_keys("password123")
        
        # 変更を実行
        submit = driver.find_element(By.ID, "change-email")
        submit.click()
        
        # 確認メッセージを確認
        confirmation = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "confirmation-message"))
        )
        assert "確認メールを送信しました" in confirmation.text

    def test_password_change(self, driver):
        """パスワード変更のテスト"""
        driver.get("http://localhost:5173/settings/password")
        
        # パスワード変更フォームの入力
        current = driver.find_element(By.ID, "current-password")
        new_pass = driver.find_element(By.ID, "new-password")
        confirm = driver.find_element(By.ID, "confirm-password")
        
        current.send_keys("password123")
        new_pass.send_keys("newpassword123")
        confirm.send_keys("newpassword123")
        
        # 変更を実行
        submit = driver.find_element(By.ID, "change-password")
        submit.click()
        
        # 成功メッセージを確認
        success = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "success-message"))
        )
        assert "パスワードを変更しました" in success.text

    def test_notification_settings(self, driver):
        """通知設定のテスト"""
        driver.get("http://localhost:5173/settings/notifications")
        
        # 通知設定の変更
        email_notify = driver.find_element(By.ID, "email-notifications")
        push_notify = driver.find_element(By.ID, "push-notifications")
        
        if not email_notify.is_selected():
            email_notify.click()
        if push_notify.is_selected():
            push_notify.click()
        
        # 保存
        save = driver.find_element(By.ID, "save-notifications")
        save.click()
        
        # 設定が保存されたことを確認
        success = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "success-message"))
        )
        assert "通知設定を更新しました" in success.text

    def test_account_deletion(self, driver):
        """アカウント削除のテスト"""
        driver.get("http://localhost:5173/settings/account")
        
        # 削除ボタンをクリック
        delete = driver.find_element(By.ID, "delete-account")
        delete.click()
        
        # 確認パスワードを入力
        password = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "confirm-password"))
        )
        password.send_keys("password123")
        
        # 確認ボタンをクリック
        confirm = driver.find_element(By.ID, "confirm-deletion")
        confirm.click()
        
        # ログインページにリダイレクトされることを確認
        WebDriverWait(driver, 10).until(
            EC.url_to_be("http://localhost:5173/login")
        )
        assert driver.current_url == "http://localhost:5173/login" 