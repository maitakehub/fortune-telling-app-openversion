import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

class TestNavigation(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.implicitly_wait(10)
        self.base_url = "http://localhost:5173"
        self.wait = WebDriverWait(self.driver, 10)

    def tearDown(self):
        self.driver.quit()

    def login(self, email, password):
        self.driver.get(f"{self.base_url}/login")
        email_input = self.driver.find_element(By.NAME, "email")
        password_input = self.driver.find_element(By.NAME, "password")
        email_input.send_keys(email)
        password_input.send_keys(password)
        self.driver.find_element(By.XPATH, "//button[contains(text(), 'ログイン')]").click()
        self.wait.until(EC.url_changes(f"{self.base_url}/login"))

    def test_guest_navigation(self):
        """未ログインユーザーの画面遷移テスト"""
        # ホームページアクセス
        self.driver.get(self.base_url)
        self.assertEqual(self.driver.current_url, f"{self.base_url}/")

        # 占い選択ページへのアクセス試行（ログインページにリダイレクト）
        self.driver.get(f"{self.base_url}/fortune")
        self.assertTrue("/login" in self.driver.current_url)

        # 各占いページへのアクセス試行
        fortune_paths = [
            "tarot", "astrology", "numerology", "palm",
            "dream", "animal", "fourpillars"
        ]
        for path in fortune_paths:
            self.driver.get(f"{self.base_url}/fortune/{path}")
            self.assertTrue("/login" in self.driver.current_url)

        # 管理者ページへのアクセス試行
        self.driver.get(f"{self.base_url}/admin")
        self.assertTrue("/login" in self.driver.current_url)

    def test_normal_user_navigation(self):
        """一般ユーザーの画面遷移テスト"""
        # ログイン
        self.login("user@example.com", "password123")

        # 占い選択ページにアクセス可能
        self.driver.get(f"{self.base_url}/fortune")
        self.assertEqual(self.driver.current_url, f"{self.base_url}/fortune")

        # 未サブスクライブ状態での占いページアクセス
        fortune_paths = [
            "tarot", "astrology", "numerology", "palm",
            "dream", "animal", "fourpillars"
        ]
        for path in fortune_paths:
            self.driver.get(f"{self.base_url}/fortune/{path}")
            self.assertTrue("/subscription" in self.driver.current_url)

        # 管理者ページへのアクセス試行
        self.driver.get(f"{self.base_url}/admin")
        self.assertTrue("/unauthorized" in self.driver.current_url)

    def test_subscribed_user_navigation(self):
        """サブスクライブ済みユーザーの画面遷移テスト"""
        # サブスクライブ済みユーザーとしてログイン
        self.login("subscriber@example.com", "password123")

        # 占い選択ページにアクセス可能
        self.driver.get(f"{self.base_url}/fortune")
        self.assertEqual(self.driver.current_url, f"{self.base_url}/fortune")

        # 各占いページにアクセス可能
        fortune_paths = [
            "tarot", "astrology", "numerology", "palm",
            "dream", "animal", "fourpillars"
        ]
        for path in fortune_paths:
            self.driver.get(f"{self.base_url}/fortune/{path}")
            self.assertEqual(self.driver.current_url, f"{self.base_url}/fortune/{path}")

        # 履歴ページにアクセス可能
        self.driver.get(f"{self.base_url}/history")
        self.assertEqual(self.driver.current_url, f"{self.base_url}/history")

    def test_test_user_navigation(self):
        """テストユーザーの画面遷移テスト"""
        # テストユーザーとしてログイン
        self.login("test@example.com", "password123")

        # 占い選択ページにアクセス可能
        self.driver.get(f"{self.base_url}/fortune")
        self.assertEqual(self.driver.current_url, f"{self.base_url}/fortune")

        # 各占いページにアクセス可能（テストユーザーは制限なし）
        fortune_paths = [
            "tarot", "astrology", "numerology", "palm",
            "dream", "animal", "fourpillars"
        ]
        for path in fortune_paths:
            self.driver.get(f"{self.base_url}/fortune/{path}")
            self.assertEqual(self.driver.current_url, f"{self.base_url}/fortune/{path}")

    def test_admin_navigation(self):
        """管理者の画面遷移テスト"""
        # 管理者としてログイン
        self.login("admin@example.com", "password123")

        # 管理者ダッシュボードにアクセス可能
        self.driver.get(f"{self.base_url}/admin")
        self.assertEqual(self.driver.current_url, f"{self.base_url}/admin")

        # ユーザー管理ページにアクセス可能
        self.driver.get(f"{self.base_url}/admin/users")
        self.assertEqual(self.driver.current_url, f"{self.base_url}/admin/users")

        # システム設定ページにアクセス可能
        self.driver.get(f"{self.base_url}/admin/settings")
        self.assertEqual(self.driver.current_url, f"{self.base_url}/admin/settings")

        # 通常の占いページにもアクセス可能
        fortune_paths = [
            "tarot", "astrology", "numerology", "palm",
            "dream", "animal", "fourpillars"
        ]
        for path in fortune_paths:
            self.driver.get(f"{self.base_url}/fortune/{path}")
            self.assertEqual(self.driver.current_url, f"{self.base_url}/fortune/{path}")

    def test_subscription_flow(self):
        """サブスクリプションフローのテスト"""
        # 一般ユーザーとしてログイン
        self.login("user@example.com", "password123")

        # サブスクリプションページにアクセス
        self.driver.get(f"{self.base_url}/subscription")
        self.assertEqual(self.driver.current_url, f"{self.base_url}/subscription")

        # テストプラン選択
        test_plan_button = self.driver.find_element(
            By.XPATH,
            "//button[contains(text(), 'このプランを選択') and ancestor::div[contains(., 'テストプラン')]]"
        )
        test_plan_button.click()

        # 四柱推命ページに直接遷移
        self.wait.until(
            EC.url_to_be(f"{self.base_url}/fortune/fourpillars")
        )

        # 他のプラン選択
        self.driver.get(f"{self.base_url}/subscription")
        premium_plan_button = self.driver.find_element(
            By.XPATH,
            "//button[contains(text(), 'このプランを選択') and ancestor::div[contains(., 'プレミアムプラン')]]"
        )
        premium_plan_button.click()

        # 支払い画面が表示される
        self.wait.until(
            EC.presence_of_element_located((By.ID, "payment-form"))
        )

    def test_personal_info_flow(self):
        """個人情報登録フローのテスト"""
        # 新規ユーザーとしてログイン
        self.login("newuser@example.com", "password123")

        # 個人情報登録ページに遷移
        self.assertTrue("/personal-info" in self.driver.current_url)

        # 個人情報を入力
        self.driver.find_element(By.NAME, "name").send_keys("テストユーザー")
        self.driver.find_element(By.NAME, "birthDate").send_keys("2000-01-01")
        self.driver.find_element(By.NAME, "birthTime").send_keys("12:00")
        self.driver.find_element(By.NAME, "gender").send_keys("その他")
        
        # 登録ボタンをクリック
        self.driver.find_element(
            By.XPATH,
            "//button[contains(text(), '登録')]"
        ).click()

        # 占い選択ページに遷移
        self.wait.until(
            EC.url_to_be(f"{self.base_url}/fortune")
        )

    def test_error_handling(self):
        """エラーハンドリングのテスト"""
        # 未認証でのアクセス
        self.driver.get(f"{self.base_url}/fortune")
        self.assertTrue("/login" in self.driver.current_url)

        # 一般ユーザーとして管理者ページにアクセス
        self.login("user@example.com", "password123")
        self.driver.get(f"{self.base_url}/admin")
        self.assertTrue("/unauthorized" in self.driver.current_url)

        # 未サブスクライブで占いページにアクセス
        self.driver.get(f"{self.base_url}/fortune/tarot")
        self.assertTrue("/subscription" in self.driver.current_url)

if __name__ == '__main__':
    unittest.main() 