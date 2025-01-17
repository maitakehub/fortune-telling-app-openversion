import unittest
import sys
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import subprocess
import time
import psutil

def start_app():
    """アプリケーションを起動"""
    try:
        # フロントエンド起動
        frontend = subprocess.Popen(
            ["npm", "run", "dev"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=True
        )
        
        # バックエンド起動
        backend = subprocess.Popen(
            ["npm", "run", "server"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=True
        )
        
        print("アプリケーションを起動中...")
        time.sleep(15)  # 起動待機時間を増やす
        return frontend, backend
    except Exception as e:
        print(f"アプリケーション起動エラー: {str(e)}")
        sys.exit(1)

def stop_app(frontend, backend):
    """アプリケーションを停止"""
    try:
        def kill(proc_pid):
            try:
                process = psutil.Process(proc_pid)
                for proc in process.children(recursive=True):
                    proc.kill()
                process.kill()
            except psutil.NoSuchProcess:
                pass

        if frontend:
            kill(frontend.pid)
        if backend:
            kill(backend.pid)
            
        print("アプリケーションを停止しました")
    except Exception as e:
        print(f"アプリケーション停止エラー: {str(e)}")

def setup_webdriver():
    """WebDriverのセットアップ"""
    try:
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        
        # ChromeDriverのパスを直接指定
        driver_path = "./chromedriver.exe"  # 適切なパスに変更してください
        service = Service(executable_path=driver_path)
        
        return webdriver.Chrome(service=service, options=options)
    except Exception as e:
        print(f"WebDriver設定エラー: {str(e)}")
        return None

def run_tests():
    """全テストを実行"""
    try:
        # テストスイート作成
        loader = unittest.TestLoader()
        suite = unittest.TestSuite()
        
        # テストファイル追加
        test_files = [
            'test_complete_navigation.py',
            'test_fortune_components.py'
        ]
        
        for test_file in test_files:
            try:
                tests = loader.discover('.', pattern=test_file)
                suite.addTests(tests)
            except Exception as e:
                print(f"{test_file}の読み込みエラー: {str(e)}")
        
        # テスト実行
        runner = unittest.TextTestRunner(verbosity=2)
        return runner.run(suite)
    except Exception as e:
        print(f"テスト実行エラー: {str(e)}")
        return None

if __name__ == '__main__':
    frontend = None
    backend = None
    
    try:
        # アプリケーション起動
        frontend, backend = start_app()
        
        # テスト実行
        result = run_tests()
        
        # 終了コード設定
        if result and result.wasSuccessful():
            print("全てのテストが成功しました")
            sys.exit(0)
        else:
            print("テストが失敗しました")
            sys.exit(1)
    
    except KeyboardInterrupt:
        print("\nテストを中断しました")
        sys.exit(1)
    
    except Exception as e:
        print(f"予期せぬエラー: {str(e)}")
        sys.exit(1)
    
    finally:
        # アプリケーション停止
        stop_app(frontend, backend) 