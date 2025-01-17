import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import time

class TestFortuneComponents(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.implicitly_wait(10)
        self.base_url = "http://localhost:5173"
        self.wait = WebDriverWait(self.driver, 10)
        self.login("subscriber@example.com", "password123")

    def tearDown(self):
        if self.driver:
            self.driver.quit()

    def login(self, email, password):
        self.driver.get(f"{self.base_url}/login")
        email_input = self.driver.find_element(By.NAME, "email")
        password_input = self.driver.find_element(By.NAME, "password")
        email_input.send_keys(email)
        password_input.send_keys(password)
        self.driver.find_element(By.XPATH, "//button[contains(text(), 'ログイン')]").click()
        self.wait.until(EC.url_changes(f"{self.base_url}/login"))

    def test_tarot_reader(self):
        """タロット占いの詳細テスト"""
        self.driver.get(f"{self.base_url}/fortune/tarot")
        
        # 初期状態の確認
        self.assertTrue(self.driver.find_element(By.XPATH, "//h2[contains(text(), 'Daily Tarot Reading')]"))
        
        # カード選択
        card = self.driver.find_element(By.XPATH, "//div[contains(@class, 'cursor-pointer')]")
        card.click()
        
        # アニメーション中の状態確認
        time.sleep(1)
        self.assertTrue(self.driver.find_element(By.XPATH, "//div[contains(@class, 'transform-gpu')]"))
        
        # 結果表示の確認
        time.sleep(2)
        reading_text = self.driver.find_element(By.XPATH, "//p[contains(@class, 'text-purple-100')]")
        self.assertTrue(len(reading_text.text) > 0)
        
        # 履歴への記録確認
        self.driver.get(f"{self.base_url}/history")
        self.assertTrue(self.driver.find_element(By.XPATH, "//div[contains(text(), 'タロット')]"))

    def test_astrology_chat_bot(self):
        """占星術チャットボットの詳細テスト"""
        self.driver.get(f"{self.base_url}/fortune/astrology")
        
        # チャット入力
        chat_input = self.driver.find_element(By.XPATH, "//input[@type='text']")
        chat_input.send_keys("今日の運勢を教えて")
        chat_input.submit()
        
        # レスポンス待機
        time.sleep(2)
        
        # 応答確認
        response = self.driver.find_element(By.XPATH, "//div[contains(@class, 'chat-message')]")
        self.assertTrue(len(response.text) > 0)
        
        # 会話の継続性確認
        chat_input = self.driver.find_element(By.XPATH, "//input[@type='text']")
        chat_input.send_keys("もっと詳しく")
        chat_input.submit()
        
        time.sleep(2)
        responses = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'chat-message')]")
        self.assertTrue(len(responses) >= 2)

    def test_numerology_reader(self):
        """数秘術の詳細テスト"""
        self.driver.get(f"{self.base_url}/fortune/numerology")
        
        # 生年月日入力
        date_input = self.driver.find_element(By.NAME, "birthDate")
        date_input.send_keys("1990-01-01")
        
        # 計算実行
        calculate_button = self.driver.find_element(By.XPATH, "//button[contains(text(), '計算')]")
        calculate_button.click()
        
        # 結果表示確認
        time.sleep(1)
        result = self.driver.find_element(By.XPATH, "//div[contains(@class, 'result')]")
        self.assertTrue(len(result.text) > 0)
        
        # 詳細説明の表示確認
        detail_button = self.driver.find_element(By.XPATH, "//button[contains(text(), '詳細')]")
        detail_button.click()
        
        time.sleep(1)
        details = self.driver.find_element(By.XPATH, "//div[contains(@class, 'details')]")
        self.assertTrue(len(details.text) > 0)

    def test_palm_reader(self):
        """手相占いの詳細テスト"""
        self.driver.get(f"{self.base_url}/fortune/palm")
        
        # 画像アップロード
        file_input = self.driver.find_element(By.XPATH, "//input[@type='file']")
        file_input.send_keys("/path/to/test/palm.jpg")
        
        # 解析待機
        time.sleep(3)
        
        # 結果表示確認
        result = self.driver.find_element(By.XPATH, "//div[contains(@class, 'analysis')]")
        self.assertTrue(len(result.text) > 0)
        
        # 各相線の詳細表示
        lines = ["感情線", "生命線", "頭脳線"]
        for line in lines:
            detail_button = self.driver.find_element(By.XPATH, f"//button[contains(text(), '{line}')]")
            detail_button.click()
            time.sleep(1)
            detail = self.driver.find_element(By.XPATH, f"//div[contains(@class, '{line}-detail')]")
            self.assertTrue(len(detail.text) > 0)

    def test_dream_reader(self):
        """夢占いの詳細テスト"""
        self.driver.get(f"{self.base_url}/fortune/dream")
        
        # キーワード入力
        keyword_input = self.driver.find_element(By.NAME, "keyword")
        keyword_input.send_keys("飛行")
        
        # 検索実行
        search_button = self.driver.find_element(By.XPATH, "//button[contains(text(), '解析')]")
        search_button.click()
        
        # 結果表示確認
        time.sleep(2)
        interpretation = self.driver.find_element(By.XPATH, "//div[contains(@class, 'interpretation')]")
        self.assertTrue(len(interpretation.text) > 0)
        
        # 関連キーワード確認
        related = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'related-keyword')]")
        self.assertTrue(len(related) > 0)

    def test_animal_reader(self):
        """動物占いの詳細テスト"""
        self.driver.get(f"{self.base_url}/fortune/animal")
        
        # 生年月日入力
        date_input = self.driver.find_element(By.NAME, "birthDate")
        date_input.send_keys("1990-01-01")
        
        time_input = self.driver.find_element(By.NAME, "birthTime")
        time_input.send_keys("12:00")
        
        # 判定実行
        analyze_button = self.driver.find_element(By.XPATH, "//button[contains(text(), '判定')]")
        analyze_button.click()
        
        # 結果表示確認
        time.sleep(2)
        animal = self.driver.find_element(By.XPATH, "//div[contains(@class, 'animal-type')]")
        self.assertTrue(len(animal.text) > 0)
        
        # 性格診断確認
        personality = self.driver.find_element(By.XPATH, "//div[contains(@class, 'personality')]")
        self.assertTrue(len(personality.text) > 0)
        
        # 相性診断確認
        compatibility_button = self.driver.find_element(By.XPATH, "//button[contains(text(), '相性')]")
        compatibility_button.click()
        
        time.sleep(1)
        compatibility = self.driver.find_element(By.XPATH, "//div[contains(@class, 'compatibility')]")
        self.assertTrue(len(compatibility.text) > 0)

    def test_four_pillars_reader(self):
        """四柱推命の詳細テスト"""
        self.driver.get(f"{self.base_url}/fortune/fourpillars")
        
        # 生年月日時入力
        date_input = self.driver.find_element(By.NAME, "birthDate")
        date_input.send_keys("1990-01-01")
        
        time_input = self.driver.find_element(By.NAME, "birthTime")
        time_input.send_keys("12:00")
        
        # 算出実行
        calculate_button = self.driver.find_element(By.XPATH, "//button[contains(text(), '算出')]")
        calculate_button.click()
        
        # 命式表示確認
        time.sleep(2)
        chart = self.driver.find_element(By.XPATH, "//div[contains(@class, 'chart')]")
        self.assertTrue(len(chart.text) > 0)
        
        # 各柱の詳細確認
        pillars = ["年柱", "月柱", "日柱", "時柱"]
        for pillar in pillars:
            detail_button = self.driver.find_element(By.XPATH, f"//button[contains(text(), '{pillar}')]")
            detail_button.click()
            time.sleep(1)
            detail = self.driver.find_element(By.XPATH, f"//div[contains(@class, '{pillar}-detail')]")
            self.assertTrue(len(detail.text) > 0)
        
        # 運勢グラフ確認
        graph_button = self.driver.find_element(By.XPATH, "//button[contains(text(), '運勢グラフ')]")
        graph_button.click()
        
        time.sleep(1)
        graph = self.driver.find_element(By.XPATH, "//div[contains(@class, 'fortune-graph')]")
        self.assertTrue(graph.is_displayed())

if __name__ == '__main__':
    unittest.main() 