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

class TestFortuneFeatures:
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
        screenshot_dir = os.path.join(os.getcwd(), 'test_screenshots', 'fortune_features')
        if not os.path.exists(screenshot_dir):
            os.makedirs(screenshot_dir)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{name}_{timestamp}.png"
        filepath = os.path.join(screenshot_dir, filename)
        
        driver.save_screenshot(filepath)
        print(f"Screenshot saved: {filepath}")

    def login(self, driver):
        """テスト用アカウントでログイン"""
        wait = WebDriverWait(driver, 10)
        driver.get(f"{self.BASE_URL}/signup")
        
        email_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='email-input']")))
        password_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='password-input']")))
        
        test_email = f"test_{int(time.time())}@example.com"
        email_input.send_keys(test_email)
        password_input.send_keys("Password123!")
        
        signup_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='signup-button']")))
        signup_button.click()

    def test_different_fortune_types(self, driver):
        """異なる種類の占いをテスト"""
        try:
            wait = WebDriverWait(driver, 10)
            self.login(driver)
            
            # 個人情報の入力をスキップ
            wait.until(EC.url_to_be(f"{self.BASE_URL}/personal-info"))
            submit_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='submit-personal-info']")))
            submit_button.click()
            
            # 星占いを実行
            wait.until(EC.url_to_be(f"{self.BASE_URL}/fortune"))
            fortune_type_select = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='fortune-type']")))
            Select(fortune_type_select).select_by_value("horoscope")
            
            question_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='question-input']")))
            question_input.send_keys("今日の運勢は？")
            
            submit_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='submit-fortune']")))
            submit_button.click()
            
            # 結果の表示を確認
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='fortune-result']")))
            self.save_screenshot(driver, "horoscope_result")
            
            # タロット占いを実行
            fortune_type_select = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='fortune-type']")))
            Select(fortune_type_select).select_by_value("tarot")
            
            question_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='question-input']")))
            question_input.clear()
            question_input.send_keys("恋愛運を占ってください")
            
            submit_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='submit-fortune']")))
            submit_button.click()
            
            # 結果の表示を確認
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='fortune-result']")))
            self.save_screenshot(driver, "tarot_result")
            
        except Exception as e:
            self.save_screenshot(driver, "test_failure")
            raise

    def test_long_question(self, driver):
        """長文の質問入力をテスト"""
        try:
            wait = WebDriverWait(driver, 10)
            self.login(driver)
            
            # 個人情報の入力をスキップ
            wait.until(EC.url_to_be(f"{self.BASE_URL}/personal-info"))
            submit_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='submit-personal-info']")))
            submit_button.click()
            
            # 長文の質問を入力
            wait.until(EC.url_to_be(f"{self.BASE_URL}/fortune"))
            fortune_type_select = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='fortune-type']")))
            Select(fortune_type_select).select_by_value("horoscope")
            
            long_question = "私は最近仕事で悩んでいます。新しいプロジェクトの責任者に任命されましたが、"
            long_question += "チームメンバーとの関係がうまくいっていません。このような状況で、どのように"
            long_question += "リーダーシップを発揮すべきでしょうか？また、プロジェクトを成功に導くために"
            long_question += "どのような行動を取るべきでしょうか？"
            
            question_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='question-input']")))
            question_input.send_keys(long_question)
            
            submit_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='submit-fortune']")))
            submit_button.click()
            
            # 結果の表示を確認
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='fortune-result']")))
            self.save_screenshot(driver, "long_question_result")
            
        except Exception as e:
            self.save_screenshot(driver, "test_failure")
            raise

    def test_multiple_fortunes(self, driver):
        """複数回の占い実行をテスト"""
        try:
            wait = WebDriverWait(driver, 10)
            self.login(driver)
            
            # 個人情報の入力をスキップ
            wait.until(EC.url_to_be(f"{self.BASE_URL}/personal-info"))
            submit_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='submit-personal-info']")))
            submit_button.click()
            
            # 3回占いを実行
            questions = ["今日の運勢は？", "仕事運を教えて", "恋愛運を占って"]
            
            for i, question in enumerate(questions):
                wait.until(EC.url_to_be(f"{self.BASE_URL}/fortune"))
                fortune_type_select = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='fortune-type']")))
                Select(fortune_type_select).select_by_value("horoscope")
                
                question_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='question-input']")))
                question_input.clear()
                question_input.send_keys(question)
                
                submit_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='submit-fortune']")))
                submit_button.click()
                
                # 結果の表示を確認
                wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='fortune-result']")))
                self.save_screenshot(driver, f"fortune_result_{i+1}")
                
                # 結果を保存
                save_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='save-result']")))
                save_button.click()
                
                if i < len(questions) - 1:  # 最後の質問以外は新しい占いを開始
                    new_fortune_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='new-fortune']")))
                    new_fortune_button.click()
            
        except Exception as e:
            self.save_screenshot(driver, "test_failure")
            raise 