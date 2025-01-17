import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

class TestSubscription:
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

    def test_plan_selection(self, driver):
        """プラン選択のテスト"""
        driver.get("http://localhost:5173/subscription/plans")
        
        # プランの選択
        plan = driver.find_element(By.ID, "premium-plan")
        plan.click()
        
        # 選択したプランの確認画面へ遷移
        confirm_button = driver.find_element(By.ID, "confirm-plan")
        confirm_button.click()
        
        # 確認画面の表示を確認
        plan_confirmation = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "plan-confirmation"))
        )
        assert "プレミアムプラン" in plan_confirmation.text

    def test_payment_process(self, driver):
        """支払い処理のテスト"""
        driver.get("http://localhost:5173/subscription/payment")
        
        # カード情報の入力
        card_number = driver.find_element(By.ID, "card-number")
        expiry = driver.find_element(By.ID, "card-expiry")
        cvc = driver.find_element(By.ID, "card-cvc")
        
        card_number.send_keys("4242424242424242")
        expiry.send_keys("1225")
        cvc.send_keys("123")
        
        # 支払い実行
        submit = driver.find_element(By.ID, "submit-payment")
        submit.click()
        
        # 支払い完了の確認
        success_message = WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.CLASS_NAME, "payment-success"))
        )
        assert "支払いが完了しました" in success_message.text

    def test_plan_change(self, driver):
        """プラン変更のテスト"""
        driver.get("http://localhost:5173/subscription/manage")
        
        # プラン変更ボタンをクリック
        change_plan = driver.find_element(By.ID, "change-plan")
        change_plan.click()
        
        # 新しいプランを選択
        new_plan = driver.find_element(By.ID, "basic-plan")
        new_plan.click()
        
        # 変更を確定
        confirm = driver.find_element(By.ID, "confirm-change")
        confirm.click()
        
        # 変更完了メッセージを確認
        change_message = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "change-success"))
        )
        assert "プランを変更しました" in change_message.text

    def test_subscription_cancellation(self, driver):
        """サブスクリプション解約のテスト"""
        driver.get("http://localhost:5173/subscription/manage")
        
        # 解約ボタンをクリック
        cancel = driver.find_element(By.ID, "cancel-subscription")
        cancel.click()
        
        # 確認ダイアログの確認ボタンをクリック
        confirm = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "confirm-cancellation"))
        )
        confirm.click()
        
        # 解約完了メッセージを確認
        cancel_message = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "cancellation-success"))
        )
        assert "サブスクリプションを解約しました" in cancel_message.text 