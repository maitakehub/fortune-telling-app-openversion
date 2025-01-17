import argparse
import json
from manual_test_logger import ManualTestLogger

def main():
    parser = argparse.ArgumentParser(description='手動テスト結果を記録')
    parser.add_argument('--feature', '-f', required=True, help='テストした機能名')
    parser.add_argument('--description', '-d', required=True, help='テストの説明')
    parser.add_argument('--result', '-r', required=True, choices=['成功', '失敗', '一部成功'], help='テスト結果')
    parser.add_argument('--notes', '-n', help='追加の備考', default=None)
    parser.add_argument('--checklist', '-c', help='チェックリストのJSONファイルパス')
    parser.add_argument('--screenshot', '-s', action='store_true', help='スクリーンショットを撮影する')
    parser.add_argument('--screenshot-name', help='スクリーンショットの名前')

    args = parser.parse_args()

    logger = ManualTestLogger()

    # チェックリストがある場合は読み込む
    checklist = None
    if args.checklist:
        with open(args.checklist, 'r', encoding='utf-8') as f:
            checklist = json.load(f)
        logger.start_test(args.feature, checklist)

    # スクリーンショットの撮影
    screenshots = []
    if args.screenshot:
        name = args.screenshot_name or 'screenshot'
        screenshot_path = logger.take_screenshot(name)
        screenshots.append(screenshot_path)

    logger.add_test_result(
        feature_name=args.feature,
        test_description=args.description,
        result=args.result,
        notes=args.notes,
        screenshots=screenshots
    )
    print(f"テスト結果を記録しました: {logger.report_file}")

if __name__ == "__main__":
    main() 