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
import logging
from selenium.webdriver.common.keys import Keys

# ロギングの設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TestIntegration:
    BASE_URL = "http://localhost:5174"

    @pytest.fixture(autouse=True)
    def setup_method(self):
        """各テストメソッドの前に実行される前準備"""
        logger.info("Setting up test method...")
        self.wait = None
        yield
        logger.info("Cleaning up test method...")

    @pytest.fixture
    def driver(self):
        """WebDriverの初期化とクリーンアップを行うフィクスチャ"""
        logger.info("Setting up WebDriver...")
        try:
            options = webdriver.ChromeOptions()
            options.add_argument('--start-maximized')
            options.add_argument('--disable-gpu')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--log-level=3')  # エラーログのみ表示
            options.add_experimental_option('excludeSwitches', ['enable-logging'])
            
            driver = webdriver.Chrome(options=options)
            logger.info("WebDriver initialized successfully")
            driver.implicitly_wait(10)
            self.wait = WebDriverWait(driver, 10)
            logger.info("WebDriver setup completed")
            yield driver
        except Exception as e:
            logger.error(f"Failed to initialize WebDriver: {e}")
            raise
        finally:
            if driver:
                driver.quit()
                logger.info("WebDriver cleaned up")

    def save_screenshot(self, driver, name):
        try:
            screenshot_dir = os.path.join(os.getcwd(), 'test_screenshots', 'integration')
            if not os.path.exists(screenshot_dir):
                os.makedirs(screenshot_dir)
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{name}_{timestamp}.png"
            filepath = os.path.join(screenshot_dir, filename)
            
            driver.save_screenshot(filepath)
            logger.info(f"Screenshot saved: {filepath}")
        except Exception as e:
            logger.error(f"Failed to save screenshot: {str(e)}")

    def wait_and_click(self, driver, selector, timeout=20):
        """要素が表示されるまで待機してクリック"""
        try:
            element = WebDriverWait(driver, timeout).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
            )
            time.sleep(0.5)  # クリックの安定性のために短い待機を追加
            element.click()
            return element
        except Exception as e:
            logger.error(f"Failed to click element {selector}: {str(e)}")
            self.save_screenshot(driver, f"click_failure_{selector.replace('[', '').replace(']', '')}")
            raise

    def wait_and_send_keys(self, driver, selector, keys, timeout=20):
        """要素が表示されるまで待機してテキストを入力"""
        try:
            element = WebDriverWait(driver, timeout).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
            )
            time.sleep(0.5)  # 入力の安定性のために短い待機を追加
            element.clear()
            element.send_keys(keys)
            return element
        except Exception as e:
            logger.error(f"Failed to send keys to element {selector}: {str(e)}")
            self.save_screenshot(driver, f"input_failure_{selector.replace('[', '').replace(']', '')}")
            raise

    def wait_for_url(self, driver, url, timeout=30):
        """指定されたURLに遷移するまで待機"""
        try:
            WebDriverWait(driver, timeout).until(EC.url_to_be(url))
            time.sleep(1)  # ページ遷移の安定性のために待機を追加
            logger.info(f"Successfully navigated to {url}")
            return True
        except Exception as e:
            logger.error(f"Failed to navigate to {url}: {str(e)}")
            self.save_screenshot(driver, f"navigation_failure_{url.replace('/', '_')}")
            return False

    def wait_for_element(self, driver, selector, timeout=30):
        """要素が表示されるまで待機"""
        try:
            element = WebDriverWait(driver, timeout).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, selector))
            )
            time.sleep(0.5)  # 要素の安定性のために短い待機を追加
            logger.info(f"Element {selector} found")
            return element
        except Exception as e:
            logger.error(f"Element {selector} not found: {str(e)}")
            self.save_screenshot(driver, f"element_not_found_{selector.replace('[', '').replace(']', '')}")
            return None

    def input_birth_date(self, driver, selector):
        """生年月日と時間の入力処理"""
        try:
            birth_date = self.wait_for_element(driver, selector, timeout=30)
            if birth_date:
                # フォーカスを設定
                birth_date.click()
                time.sleep(1)

                # 年を入力
                active_element = driver.switch_to.active_element
                active_element.send_keys("1990")
                time.sleep(0.5)
                active_element.send_keys(Keys.TAB)
                time.sleep(0.5)

                # 月を入力（2桁入力で自動的に日付フィールドに移動）
                active_element = driver.switch_to.active_element
                active_element.send_keys("01")
                time.sleep(0.5)

                # 日を入力（月の2桁入力で自動的にフォーカスが移動している）
                active_element = driver.switch_to.active_element
                active_element.send_keys("01")
                time.sleep(0.5)

                # 時間入力フィールドを直接取得
                time_input = self.wait_for_element(driver, "[data-testid='birth-time-input']")
                if time_input:
                    time_input.click()
                    time.sleep(0.5)
                    time_input.send_keys("12")
                    time.sleep(0.5)
                    time_input.send_keys("00")
                    time.sleep(0.5)

                # 性別を選択
                gender_select = self.wait_for_element(driver, "[data-testid='gender-select']")
                if gender_select:
                    Select(gender_select).select_by_value("male")
                    time.sleep(0.5)

                logger.info("Birth date, time and gender input completed")
                return True
        except Exception as e:
            logger.error(f"Failed to input birth date, time and gender: {str(e)}")
            return False

    def test_complete_user_journey(self, driver):
        """ユーザーの一連の行動を統合テスト"""
        try:
            logger.info("Starting complete user journey test")
            driver.get(f"{self.BASE_URL}/signup")
            time.sleep(2)

            # サインアップフォームの表示を待機
            signup_form = self.wait_for_element(driver, "[data-testid='signup-form']")
            assert signup_form, "サインアップフォームが表示されません"

            # サインアップ
            logger.info("Performing signup")
            test_email = f"test_{int(time.time())}@example.com"
            self.wait_and_send_keys(driver, "[data-testid='email-input']", test_email)
            self.wait_and_send_keys(driver, "[data-testid='password-input']", "Password123!")
            self.wait_and_click(driver, "[data-testid='signup-button']")

            # 個人情報ページへの遷移を確認
            assert self.wait_for_url(driver, f"{self.BASE_URL}/personal-info"), "個人情報ページに遷移できません"

            # 個人情報の入力をスキップ（スキップボタンがない場合は直接占いページに遷移）
            logger.info("Proceeding to fortune page")
            driver.get(f"{self.BASE_URL}/fortune")
            time.sleep(5)  # 待機時間を増やす

            # 占いページへの遷移を確認
            assert self.wait_for_url(driver, f"{self.BASE_URL}/fortune"), "占いページに遷移できません"

            # 占いフォームの表示を待機
            fortune_form = self.wait_for_element(driver, "[data-testid='fortune-form']")
            assert fortune_form, "占いフォームが表示されません"

            # 占いを実行
            logger.info("Performing fortune telling")
            fortune_type_select = self.wait_for_element(driver, "[data-testid='fortune-type']")
            Select(fortune_type_select).select_by_value("horoscope")

            self.wait_and_send_keys(driver, "[data-testid='question-input']", "今日の運勢を教えてください")
            self.wait_and_click(driver, "[data-testid='submit-fortune']")

            # 結果の表示を待機（タイムアウトを30秒に設定）
            fortune_result = self.wait_for_element(driver, "[data-testid='fortune-result']", timeout=30)
            assert fortune_result, "占い結果が表示されません"
            assert fortune_result.text.strip(), "占い結果が空です"

            # 保存ボタンをクリックする前に待機を追加
            time.sleep(2)
            save_button = self.wait_for_element(driver, "[data-testid='save-result']")
            assert save_button, "保存ボタンが表示されていません"
            save_button.click()
            time.sleep(2)  # 保存処理の完了を待機

            # 履歴ページに遷移
            logger.info("Checking fortune history")
            history_button = self.wait_for_element(driver, "[data-testid='history-button']")
            assert history_button, "履歴ボタンが表示されていません"
            history_button.click()
            time.sleep(2)  # 遷移の完了を待機

            # 履歴ページへの遷移を確認（URLを修正）
            current_url = driver.current_url
            logger.info(f"Current URL: {current_url}")
            assert "/fortune/history" in current_url or "/history" in current_url, "履歴ページに遷移できません"

            # 履歴リストの表示を待機
            history_list = self.wait_for_element(driver, "[data-testid='history-list']", timeout=40)
            assert history_list, "履歴リストが表示されていません"

            # 履歴アイテムの存在を確認
            history_items = history_list.find_elements(By.TAG_NAME, "li")
            if len(history_items) == 0:
                logger.error(f"履歴が見つかりません。現在のURL: {current_url}")
                logger.error(f"ページソース: {driver.page_source}")
                self.save_screenshot(driver, "empty_history")
            assert len(history_items) > 0, "履歴が保存されていません"

            # 履歴の内容を確認
            first_history = history_items[0]
            assert "horoscope" in first_history.text, "占いタイプが履歴に表示されていません"
            assert "今日の運勢を教えてください" in first_history.text, "質問が履歴に表示されていません"

        except Exception as e:
            logger.error(f"Test failed: {str(e)}")
            if driver:
                self.save_screenshot(driver, "test_complete_user_journey_error")
            raise

    def test_fortune_and_history_interaction(self, driver):
        """占いと履歴の相互作用をテスト"""
        try:
            logger.info("Starting fortune and history interaction test")
            driver.get(f"{self.BASE_URL}/signup")
            time.sleep(2)

            # サインアップフォームの表示を待機
            signup_form = self.wait_for_element(driver, "[data-testid='signup-form']")
            assert signup_form, "サインアップフォームが表示されません"

            # サインアップ
            logger.info("Performing signup")
            test_email = f"test_{int(time.time())}@example.com"
            self.wait_and_send_keys(driver, "[data-testid='email-input']", test_email)
            self.wait_and_send_keys(driver, "[data-testid='password-input']", "Password123!")
            self.wait_and_click(driver, "[data-testid='signup-button']")

            # 個人情報ページへの遷移を確認
            assert self.wait_for_url(driver, f"{self.BASE_URL}/personal-info"), "個人情報ページに遷移できません"

            # 個人情報の入力をスキップ（スキップボタンがない場合は直接占いページに遷移）
            logger.info("Proceeding to fortune page")
            driver.get(f"{self.BASE_URL}/fortune")
            time.sleep(5)  # 待機時間を増やす

            # 占いページへの遷移を確認
            assert self.wait_for_url(driver, f"{self.BASE_URL}/fortune"), "占いページに遷移できません"

            # 複数の占いを実行
            logger.info("Performing multiple fortune tellings")
            fortune_types = ["horoscope", "numerology", "dream"]
            questions = ["今日の運勢は？", "私の運命数は？", "昨日見た夢の意味は？"]
            saved_results = []  # 保存した結果を追跡

            for i, (fortune_type, question) in enumerate(zip(fortune_types, questions)):
                logger.info(f"Performing fortune {i+1} of {len(fortune_types)}")

                # 占いフォームの表示を待機
                fortune_form = self.wait_for_element(driver, "[data-testid='fortune-form']")
                assert fortune_form, "占いフォームが表示されません"

                fortune_type_select = self.wait_for_element(driver, "[data-testid='fortune-type']")
                Select(fortune_type_select).select_by_value(fortune_type)

                self.wait_and_send_keys(driver, "[data-testid='question-input']", question)
                self.wait_and_click(driver, "[data-testid='submit-fortune']")

                # 結果の表示を待機（タイムアウトを30秒に設定）
                fortune_result = self.wait_for_element(driver, "[data-testid='fortune-result']", timeout=30)
                assert fortune_result, "占い結果が表示されません"
                assert fortune_result.text.strip(), "占い結果が空です"

                # 結果を保存
                saved_results.append(fortune_result.text)
                time.sleep(2)  # 結果の保存を待機

            # 最終的な履歴の確認
            logger.info("Checking final fortune history")
            if not "/history" in driver.current_url:
                history_button = self.wait_for_element(driver, "[data-testid='history-button']")
                assert history_button, "履歴ボタンが表示されていません"
                history_button.click()
                time.sleep(2)

            # 履歴の内容を確認
            for saved_result in saved_results:
                found = False
                for item in history_items:
                    if (saved_result['type'] in item.text and 
                        saved_result['question'] in item.text):
                        found = True
                        logger.info(f"Found history item for {saved_result['type']} with question '{saved_result['question']}'")
                        break
                assert found, f"占いタイプ {saved_result['type']} と質問 '{saved_result['question']}' の履歴が見つかりません"

        except Exception as e:
            logger.error(f"Test failed: {str(e)}")
            if driver:
                self.save_screenshot(driver, "test_fortune_and_history_interaction_error")
            raise

    def test_user_preferences_and_fortune(self, driver):
        """ユーザー設定と占いの連携をテスト"""
        try:
            logger.info("Starting user preferences and fortune test")
            driver.get(f"{self.BASE_URL}/signup")
            time.sleep(2)

            # サインアップフォームの表示を待機
            signup_form = self.wait_for_element(driver, "[data-testid='signup-form']")
            assert signup_form, "サインアップフォームが表示されません"

            # サインアップ
            logger.info("Performing signup")
            test_email = f"test_{int(time.time())}@example.com"
            self.wait_and_send_keys(driver, "[data-testid='email-input']", test_email)
            self.wait_and_send_keys(driver, "[data-testid='password-input']", "Password123!")
            self.wait_and_click(driver, "[data-testid='signup-button']")

            # 個人情報ページへの遷移を確認
            assert self.wait_for_url(driver, f"{self.BASE_URL}/personal-info"), "個人情報ページに遷移できません"
            time.sleep(5)  # 個人情報ページの読み込みを待機

            # 個人情報フォームの表示を待機
            personal_info_form = self.wait_for_element(driver, "[data-testid='personal-info-form']", timeout=30)
            assert personal_info_form, "個人情報フォームが表示されません"

            # 個人情報の詳細入力
            logger.info("Entering detailed personal information")
            self.wait_and_send_keys(driver, "[data-testid='name-input']", "テストユーザー")
            self.wait_and_send_keys(driver, "[data-testid='birth-date-input']", "1990-01-01")

            # 生年月日入力
            birth_date_input = self.wait_for_element(driver, "[data-testid='birth-date-input']", timeout=10)
            if birth_date_input:
                birth_date_input.send_keys("1990-01-01")
            else:
                logger.warning("生年月日入力フィールドが見つかりません")

            # 個人情報の送信
            submit_button = self.wait_for_element(driver, "[data-testid='submit-personal-info']", timeout=10)
            if submit_button:
                submit_button.click()
                time.sleep(5)  # 送信後の処理を待機
            else:
                logger.warning("個人情報送信ボタンが見つかりません")

            # 占いページへの遷移を確認
            driver.get(f"{self.BASE_URL}/fortune")
            time.sleep(5)  # 占いページの読み込みを待機
            assert self.wait_for_url(driver, f"{self.BASE_URL}/fortune"), "占いページに遷移できません"

            # 占いフォームの表示を待機
            fortune_form = self.wait_for_element(driver, "[data-testid='fortune-form']", timeout=30)
            assert fortune_form, "占いフォームが表示されません"

            # 占いを実行
            logger.info("Performing fortune telling")
            fortune_type_select = self.wait_for_element(driver, "[data-testid='fortune-type']")
            Select(fortune_type_select).select_by_value("horoscope")

            self.wait_and_send_keys(driver, "[data-testid='question-input']", "今日の運勢を教えてください")
            self.wait_and_click(driver, "[data-testid='submit-fortune']")

            # 結果の表示を待機（タイムアウトを30秒に設定）
            fortune_result = self.wait_for_element(driver, "[data-testid='fortune-result']", timeout=30)
            assert fortune_result, "占い結果が表示されません"
            assert fortune_result.text.strip(), "占い結果が空です"

            self.save_screenshot(driver, "user_preferences_fortune")
            logger.info("User preferences and fortune test completed successfully")

        except Exception as e:
            logger.error(f"Test failed: {str(e)}")
            self.save_screenshot(driver, "test_failure")
            raise 