import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

class TestFortune:
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

    def test_fortune_selection(self, driver):
        """占いの種類選択テスト"""
        driver.get("http://localhost:5173/fortune")
        
        # 占いの種類を選択
        fortune_type = Select(driver.find_element(By.ID, "fortune-type"))
        fortune_type.select_by_value("horoscope")
        
        # 選択が反映されていることを確認
        assert fortune_type.first_selected_option.text == "星占い"

    def test_question_input(self, driver):
        """質問入力と送信テスト"""
        driver.get("http://localhost:5173/fortune")
        
        # 質問を入力
        question = driver.find_element(By.ID, "question")
        question.send_keys("今日の運勢を教えてください")
        
        # 送信
        submit = driver.find_element(By.ID, "submit-fortune")
        submit.click()
        
        # 結果の表示を待機
        result = WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.ID, "fortune-result"))
        )
        assert result.is_displayed()

    def test_result_saving(self, driver):
        """占い結果の保存テスト"""
        driver.get("http://localhost:5173/fortune")
        
        # 占いを実行
        question = driver.find_element(By.ID, "question")
        question.send_keys("今日の運勢を教えてください")
        submit = driver.find_element(By.ID, "submit-fortune")
        submit.click()
        
        # 結果の保存ボタンをクリック
        save_button = WebDriverWait(driver, 20).until(
            EC.element_to_be_clickable((By.ID, "save-result"))
        )
        save_button.click()
        
        # 保存完了メッセージを確認
        success_message = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "success-message"))
        )
        assert "結果を保存しました" in success_message.text

    def test_history_display(self, driver):
        """占い履歴の表示テスト"""
        driver.get("http://localhost:5173/fortune/history")
        
        # 履歴リストの存在を確認
        history_list = driver.find_element(By.ID, "fortune-history")
        history_items = history_list.find_elements(By.CLASS_NAME, "history-item")
        
        assert len(history_items) > 0 