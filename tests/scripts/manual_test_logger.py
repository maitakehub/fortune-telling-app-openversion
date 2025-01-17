import os
import platform
import sys
import time
from datetime import datetime
import pyautogui
import psutil

class ManualTestLogger:
    def __init__(self):
        self.test_results = []
        self.current_date = datetime.now().strftime("%Y-%m-%d")
        self.report_file = f"tests/manual_test_report_{self.current_date}.md"
        self.screenshot_dir = f"tests/screenshots/{self.current_date}"
        os.makedirs(self.screenshot_dir, exist_ok=True)
        self.start_time = None

    def start_test(self, feature_name, checklist=None):
        """テストを開始"""
        self.start_time = time.time()
        self.current_feature = feature_name
        self.current_checklist = checklist or []
        self.checklist_results = {item: False for item in self.current_checklist}

    def complete_checklist_item(self, item):
        """チェックリストのアイテムを完了としてマーク"""
        if item in self.checklist_results:
            self.checklist_results[item] = True

    def take_screenshot(self, name):
        """スクリーンショットを撮影"""
        timestamp = datetime.now().strftime("%H%M%S")
        filename = f"{self.current_feature}_{name}_{timestamp}.png"
        filepath = os.path.join(self.screenshot_dir, filename)
        screenshot = pyautogui.screenshot()
        screenshot.save(filepath)
        return filepath

    def get_system_info(self):
        """システム情報を取得"""
        return {
            "OS": f"{platform.system()} {platform.release()}",
            "Python": sys.version.split()[0],
            "メモリ使用率": f"{psutil.virtual_memory().percent}%",
            "CPU使用率": f"{psutil.cpu_percent()}%",
            "画面解像度": "x".join(map(str, pyautogui.size()))
        }

    def add_test_result(self, feature_name, test_description, result, notes=None, screenshots=None):
        """テスト結果を追加"""
        end_time = time.time()
        duration = round(end_time - (self.start_time or end_time), 2)
        
        test_result = {
            "feature": feature_name,
            "description": test_description,
            "result": result,
            "notes": notes,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "duration": duration,
            "checklist_results": self.checklist_results if hasattr(self, 'checklist_results') else None,
            "screenshots": screenshots or [],
            "system_info": self.get_system_info()
        }
        self.test_results.append(test_result)
        self._save_report()

    def _save_report(self):
        """MDファイルにレポートを保存"""
        with open(self.report_file, 'w', encoding='utf-8') as f:
            f.write(f"# 手動テスト結果レポート ({self.current_date})\n\n")
            
            # システム情報のセクション
            f.write("## システム情報\n\n")
            system_info = self.get_system_info()
            for key, value in system_info.items():
                f.write(f"- **{key}**: {value}\n")
            f.write("\n---\n\n")
            
            # テスト結果
            for result in self.test_results:
                f.write(f"## {result['feature']}\n")
                f.write(f"- **テスト内容**: {result['description']}\n")
                f.write(f"- **結果**: {result['result']}\n")
                f.write(f"- **実行時刻**: {result['timestamp']}\n")
                f.write(f"- **実行時間**: {result['duration']}秒\n")
                
                if result.get('checklist_results'):
                    f.write("\n### チェックリスト\n")
                    for item, checked in result['checklist_results'].items():
                        status = "✅" if checked else "❌"
                        f.write(f"- {status} {item}\n")
                
                if result['screenshots']:
                    f.write("\n### スクリーンショット\n")
                    for screenshot in result['screenshots']:
                        f.write(f"- ![{screenshot}]({screenshot})\n")
                
                if result['notes']:
                    f.write(f"\n### 備考\n{result['notes']}\n")
                
                f.write("\n---\n\n")

if __name__ == "__main__":
    # 使用例
    logger = ManualTestLogger()
    
    # テスト開始
    checklist = [
        "ログインページにアクセス可能",
        "メールアドレス入力欄が存在",
        "パスワード入力欄が存在",
        "ログインボタンが機能する"
    ]
    logger.start_test("ログイン機能", checklist)
    
    # チェックリストアイテムを完了としてマーク
    logger.complete_checklist_item("ログインページにアクセス可能")
    
    # スクリーンショット撮影
    screenshot_path = logger.take_screenshot("login_page")
    
    # テスト結果を記録
    logger.add_test_result(
        feature_name="ログイン機能",
        test_description="正常なログインフロー",
        result="成功",
        notes="すべての入力フィールドが正常に機能",
        screenshots=[screenshot_path]
    ) 