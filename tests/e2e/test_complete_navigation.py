import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
import time

class TestCompleteNavigation(unittest.TestCase):
    def setUp(self):
        try:
            options = webdriver.ChromeOptions()
            options.add_argument('--headless')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            
            self.driver = webdriver.Chrome(options=options)
            self.driver.implicitly_wait(10)
            self.base_url = "http://localhost:5173"
            self.wait = WebDriverWait(self.driver, 10)
            self.driver.set_window_size(1920, 1080)
            self.driver.get("http://localhost:5173/login")
            email_input = self.wait_for_element(By.CSS_SELECTOR, "input[type='email']")
            password_input = self.wait_for_element(By.CSS_SELECTOR, "input[type='password']")
            email_input.send_keys("test@example.com")
            password_input.send_keys("password123")
            submit_button = self.wait_for_element(By.CSS_SELECTOR, "button[type='submit']")
            submit_button.click()
            time.sleep(2)  # ログイン処理の完了を待つ

            # パーソナル占い設定画面をスキップ
            skip_button = self.wait_for_element(By.XPATH, "//button[contains(text(), 'スキップ')]")
            skip_button.click()
            time.sleep(2)  # スキップ処理の完了を待つ
        except WebDriverException as e:
            print(f"WebDriverの初期化エラー: {str(e)}")
            raise

    def tearDown(self):
        if hasattr(self, 'driver'):
            self.driver.quit()

    def wait_for_element(self, by, value, timeout=20):
        """要素が表示されるまで待機"""
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, value))
            )
            # 要素が表示されるまで少し待機
            time.sleep(1)
            return element
        except TimeoutException:
            print(f"要素が見つかりませんでした: {value}")
            return None

    def wait_for_page_load(self):
        """ページが完全に読み込まれるまで待機"""
        self.wait.until(
            lambda driver: driver.execute_script("return document.readyState") == "complete"
        )
        # React アプリケーションの初期化を待機
        time.sleep(3)

    def login(self, email, password):
        """ログイン処理"""
        try:
            self.driver.get(f"{self.base_url}/login")
            self.wait_for_page_load()
            
            # メールアドレス入力
            email_input = self.wait_for_element(
                By.CSS_SELECTOR,
                "input[type='email']"
            )
            if not email_input:
                raise Exception("メールアドレス入力フィールドが見つかりません")
            email_input.clear()
            email_input.send_keys(email)
            
            # パスワード入力
            password_input = self.wait_for_element(
                By.CSS_SELECTOR,
                "input[type='password']"
            )
            if not password_input:
                raise Exception("パスワード入力フィールドが見つかりません")
            password_input.clear()
            password_input.send_keys(password)
            
            # ログインボタンクリック
            login_button = self.wait_for_element(
                By.CSS_SELECTOR,
                "button[type='submit']"
            )
            if not login_button:
                raise Exception("ログインボタンが見つかりません")
            
            login_button.click()
            time.sleep(3)  # ログイン処理待機
            
        except Exception as e:
            print(f"ログインエラー: {str(e)}")
            raise

    def test_header_navigation(self):
        """ヘッダーナビゲーションの完全テスト"""
        try:
            # 未ログイン状態でのヘッダーテスト
            self.driver.get(self.base_url)
            time.sleep(2)  # ページ読み込み待機
            
            # ロゴクリック
            logo = self.wait_for_element(
                By.CSS_SELECTOR,
                "a.text-2xl"
            )
            if logo:
                logo.click()
                time.sleep(1)
                self.assertEqual(self.driver.current_url, f"{self.base_url}/")
            
            # ログインリンク
            login_link = self.wait_for_element(
                By.CSS_SELECTOR,
                "a[href='/login']"
            )
            if login_link:
                login_link.click()
                time.sleep(1)
                self.assertTrue("/login" in self.driver.current_url)
            
            # 新規登録リンク
            self.driver.get(self.base_url)
            time.sleep(1)
            signup_link = self.wait_for_element(
                By.CSS_SELECTOR,
                "a[href='/signup']"
            )
            if signup_link:
                signup_link.click()
                time.sleep(1)
                self.assertTrue("/signup" in self.driver.current_url)
            
            # ログイン状態でのヘッダーテスト
            self.login("user@example.com", "password123")
            time.sleep(2)
            
            # ログアウトボタン
            logout_button = self.wait_for_element(
                By.CSS_SELECTOR,
                "button.text-purple-100"
            )
            if logout_button:
                logout_button.click()
                time.sleep(1)
                self.assertTrue("/login" in self.driver.current_url)
        
        except Exception as e:
            print(f"ヘッダーナビゲーションテストエラー: {str(e)}")
            raise

    def test_error_handling(self):
        """エラーハンドリングテスト"""
        try:
            self.login("user@example.com", "password123")
            self.wait_for_page_load()
            
            # 不正なURLアクセス（ホームページにリダイレクト）
            self.driver.get(f"{self.base_url}/invalid-page")
            self.wait_for_page_load()
            
            # ホームページへのリダイレクトを確認
            self.assertEqual(self.driver.current_url, f"{self.base_url}/")
            
            # セッション切れ
            self.driver.delete_all_cookies()
            self.driver.get(f"{self.base_url}/fortune")
            self.wait_for_page_load()
            self.assertTrue("/login" in self.driver.current_url)
        
        except Exception as e:
            print(f"エラーハンドリングテストエラー: {str(e)}")
            raise

    def test_keyboard_navigation(self):
        """キーボードナビゲーションテスト"""
        try:
            self.driver.get(self.base_url)
            time.sleep(2)
            
            # フォーカス可能な要素を取得
            focusable_elements = self.driver.find_elements(
                By.CSS_SELECTOR,
                "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
            )
            
            if not focusable_elements:
                raise Exception("フォーカス可能な要素が見つかりません")
            
            # 最初の要素にフォーカス
            actions = ActionChains(self.driver)
            actions.move_to_element(focusable_elements[0]).click().perform()
            
            # Tabキーでのナビゲーション
            for _ in range(len(focusable_elements)):
                actions.send_keys(Keys.TAB).perform()
                time.sleep(0.5)
            
            # Enterキーで選択
            actions.send_keys(Keys.RETURN).perform()
            time.sleep(1)
            
            # 何らかのナビゲーションが行われたことを確認
            self.assertNotEqual(
                self.driver.current_url,
                self.base_url,
                "キーボードナビゲーションが機能していません"
            )
        
        except Exception as e:
            print(f"キーボードナビゲーションテストエラー: {str(e)}")
            raise

    def wait_for_element_with_retry(self, by, value, timeout=10, retries=3):
        """要素を見つけるまで複数回試行する"""
        for _ in range(retries):
            element = self.wait_for_element(by, value, timeout)
            if element:
                return element
            time.sleep(2)  # 次の試行までの待機時間
        return None

    def wait_for_react_load(self):
        """Reactアプリケーションの読み込みを待機"""
        try:
            self.driver.execute_script("""
                return new Promise((resolve) => {
                    const checkReady = () => {
                        const root = document.getElementById('root');
                        if (root && root.children.length > 0) {
                            resolve(true);
                        } else {
                            setTimeout(checkReady, 100);
                        }
                    };
                    checkReady();
                });
            """)
            time.sleep(2)  # 追加の待機時間
            return True
        except Exception:
            return False

    def wait_for_element_with_js(self, script, timeout=10):
        """JavaScriptを使用して要素を待機"""
        try:
            return self.driver.execute_async_script(f"""
                const done = arguments[arguments.length - 1];
                const startTime = Date.now();
                
                const checkElement = () => {{
                    try {{
                        {script}
                    }} catch (e) {{
                        console.error('Error in checkElement:', e);
                    }}
                    
                    if (Date.now() - startTime > {timeout * 1000}) {{
                        done(null);
                        return;
                    }}
                    
                    setTimeout(checkElement, 100);
                }};
                
                checkElement();
            """)
        except Exception as e:
            print(f"JavaScriptエラー: {str(e)}")
            return None

    def wait_for_route_change(self, expected_path):
        """ルーティングの変更を待機"""
        try:
            self.driver.execute_async_script(f"""
                const done = arguments[arguments.length - 1];
                const startTime = Date.now();
                
                const checkRoute = () => {{
                    const currentPath = window.location.pathname;
                    if (currentPath === '{expected_path}') {{
                        done(true);
                        return;
                    }}
                    
                    if (Date.now() - startTime > 10000) {{
                        done(false);
                        return;
                    }}
                    
                    setTimeout(checkRoute, 100);
                }};
                
                checkRoute();
            """)
            return True
        except Exception:
            return False

    def test_performance(self):
        """パフォーマンステスト"""
        try:
            # ページロード時間計測
            start_time = time.time()
            self.driver.get(self.base_url)
            self.wait_for_page_load()
            self.wait_for_react_load()
            
            load_time = time.time() - start_time
            self.assertLess(load_time, 10, "ページロードに10秒以上かかっています")
            
            # アニメーションのスムーズさ確認
            self.login("subscriber@example.com", "password123")
            self.wait_for_page_load()
            self.wait_for_react_load()
            
            # タロットページに移動
            self.driver.get(f"{self.base_url}/fortune/tarot")
            self.wait_for_page_load()
            self.wait_for_react_load()
            self.wait_for_route_change("/fortune/tarot")
            time.sleep(5)  # アプリケーションの初期化を待機
            
            # タロットカードの要素を探す
            card = None
            selectors = [
                "div.aspect-\\[2\\/3\\]",  # カードのコンテナ
                "div.cursor-pointer",      # クリック可能な領域
                "img[alt='Tarot Card Back']",  # カードの画像
                "div.relative.cursor-pointer"  # motion.divの代替
            ]
            
            for selector in selectors:
                card = self.wait_for_element(By.CSS_SELECTOR, selector)
                if card:
                    break
            
            if not card:
                # 要素が見つからない場合、ページの状態を確認
                page_state = self.driver.execute_script("""
                    return {
                        url: window.location.href,
                        path: window.location.pathname,
                        root: document.getElementById('root').innerHTML,
                        images: Array.from(document.getElementsByTagName('img')).map(img => ({
                            alt: img.alt,
                            src: img.src,
                            classes: img.className,
                            parentClasses: img.parentElement ? img.parentElement.className : null
                        })),
                        divs: Array.from(document.getElementsByTagName('div')).map(div => ({
                            classes: div.className,
                            hasImage: !!div.querySelector('img'),
                            innerHTML: div.innerHTML
                        }))
                    };
                """)
                print("ページの状態:", page_state)
                raise Exception("タロットカードが見つかりません")
            
            # アニメーション時間計測
            start_time = time.time()
            card.click()
            
            # アニメーション完了を待機
            time.sleep(5)
            
            # 結果の表示を確認
            result = self.wait_for_element(
                By.CSS_SELECTOR,
                "p.text-purple-100.text-lg.leading-relaxed"
            )
            
            if not result:
                # 要素が見つからない場合、ページの状態を確認
                page_state = self.driver.execute_script("""
                    return {
                        url: window.location.href,
                        path: window.location.pathname,
                        root: document.getElementById('root').innerHTML,
                        paragraphs: Array.from(document.getElementsByTagName('p')).map(p => ({
                            text: p.textContent,
                            classes: p.className
                        }))
                    };
                """)
                print("結果表示時のページの状態:", page_state)
                raise Exception("タロットの結果が表示されていません")
            
            animation_time = time.time() - start_time
            self.assertLess(
                animation_time, 5,
                "アニメーションの実行に5秒以上かかっています"
            )
        
        except Exception as e:
            print(f"パフォーマンステストエラー: {str(e)}")
            raise

if __name__ == '__main__':
    unittest.main() 