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

class TestHistoryFeatures:
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
        screenshot_dir = os.path.join(os.getcwd(), 'test_screenshots', 'history_features')
        if not os.path.exists(screenshot_dir):
            os.makedirs(screenshot_dir)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{name}_{timestamp}.png"
        filepath = os.path.join(screenshot_dir, filename)
        
        driver.save_screenshot(filepath)
        print(f"Screenshot saved: {filepath}")

    def login_and_create_fortunes(self, driver, num_fortunes=3):
        """テスト用アカウントでログインし、指定された数の占い結果を作成"""
        wait = WebDriverWait(driver, 10)
        driver.get(f"{self.BASE_URL}/signup")
        
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
        
        # 指定された数の占いを実行
        questions = [f"テスト質問{i+1}" for i in range(num_fortunes)]
        for question in questions:
            wait.until(EC.url_to_be(f"{self.BASE_URL}/fortune"))
            fortune_type_select = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='fortune-type']")))
            Select(fortune_type_select).select_by_value("horoscope")
            
            question_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='question-input']")))
            question_input.clear()
            question_input.send_keys(question)
            
            submit_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='submit-fortune']")))
            submit_button.click()
            
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='fortune-result']")))
            save_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='save-result']")))
            save_button.click()
            
            if questions.index(question) < len(questions) - 1:
                new_fortune_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='new-fortune']")))
                new_fortune_button.click()

    def test_history_display(self, driver):
        """履歴一覧の表示をテスト"""
        try:
            wait = WebDriverWait(driver, 10)
            self.login_and_create_fortunes(driver, 3)
            
            # 履歴ページに移動
            history_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='history-button']")))
            history_button.click()
            
            # 履歴一覧の表示を確認
            wait.until(EC.url_to_be(f"{self.BASE_URL}/fortune/history"))
            history_list = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='history-list']")))
            history_items = history_list.find_elements(By.CSS_SELECTOR, "[data-testid='history-item']")
            
            assert len(history_items) == 3, "履歴アイテムの数が期待値と一致しません"
            self.save_screenshot(driver, "history_list")
            
        except Exception as e:
            self.save_screenshot(driver, "test_failure")
            raise

    def test_history_sorting(self, driver):
        """履歴の並び順をテスト"""
        try:
            wait = WebDriverWait(driver, 10)
            self.login_and_create_fortunes(driver, 5)
            
            # 履歴ページに移動
            history_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='history-button']")))
            history_button.click()
            
            # 履歴一覧の表示を確認
            wait.until(EC.url_to_be(f"{self.BASE_URL}/fortune/history"))
            history_list = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='history-list']")))
            history_items = history_list.find_elements(By.CSS_SELECTOR, "[data-testid='history-item']")
            
            # 日付の降順で並んでいることを確認
            dates = [item.find_element(By.CSS_SELECTOR, "[data-testid='history-date']").text for item in history_items]
            sorted_dates = sorted(dates, reverse=True)
            assert dates == sorted_dates, "履歴が日付の降順で並んでいません"
            
            self.save_screenshot(driver, "sorted_history")
            
        except Exception as e:
            self.save_screenshot(driver, "test_failure")
            raise

    def test_history_details(self, driver):
        """履歴の詳細表示をテスト"""
        try:
            wait = WebDriverWait(driver, 10)
            self.login_and_create_fortunes(driver, 1)
            
            # 履歴ページに移動
            history_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='history-button']")))
            history_button.click()
            
            # 履歴の詳細を表示
            wait.until(EC.url_to_be(f"{self.BASE_URL}/fortune/history"))
            history_item = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='history-item']")))
            history_item.click()
            
            # 詳細情報の表示を確認
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='history-detail']")))
            self.save_screenshot(driver, "history_detail")
            
            # 各要素の存在を確認
            assert driver.find_element(By.CSS_SELECTOR, "[data-testid='detail-question']"), "質問が表示されていません"
            assert driver.find_element(By.CSS_SELECTOR, "[data-testid='detail-fortune-type']"), "占いの種類が表示されていません"
            assert driver.find_element(By.CSS_SELECTOR, "[data-testid='detail-result']"), "結果が表示されていません"
            assert driver.find_element(By.CSS_SELECTOR, "[data-testid='detail-date']"), "日付が表示されていません"
            
        except Exception as e:
            self.save_screenshot(driver, "test_failure")
            raise 