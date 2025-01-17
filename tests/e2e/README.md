# E2Eテスト実行手順

このディレクトリには、Fortune Telling Appの画面遷移を検証するE2Eテストが含まれています。

## 前提条件

1. Python 3.8以上がインストールされていること
2. Google Chromeがインストールされていること
3. アプリケーションが`http://localhost:5173`で起動していること

## セットアップ

1. 仮想環境を作成し、アクティベートします：
```bash
python -m venv venv
source venv/bin/activate  # Linuxの場合
.\venv\Scripts\activate   # Windowsの場合
```

2. 必要なパッケージをインストールします：
```bash
pip install -r requirements.txt
```

## テストの実行

### 全てのテストを実行

```bash
python -m pytest test_navigation.py -v
```

### HTMLレポートを生成して実行

```bash
python -m pytest test_navigation.py --html=report.html
```

### 特定のテストのみ実行

```bash
# 例: 管理者の画面遷移テストのみ実行
python -m pytest test_navigation.py -k test_admin_navigation -v
```

## テストケース

1. `test_guest_navigation`: 未ログインユーザーの画面遷移テスト
2. `test_normal_user_navigation`: 一般ユーザーの画面遷移テスト
3. `test_subscribed_user_navigation`: サブスクライブ済みユーザーの画面遷移テスト
4. `test_test_user_navigation`: テストユーザーの画面遷移テスト
5. `test_admin_navigation`: 管理者の画面遷移テスト
6. `test_subscription_flow`: サブスクリプションフローのテスト
7. `test_personal_info_flow`: 個人情報登録フローのテスト
8. `test_error_handling`: エラーハンドリングのテスト
9. `test_password_reset_flow`: パスワードリセットフローのテスト
10. `test_responsive_design`: レスポンシブデザインのテスト（各画面サイズでの表示確認）

## テスト対象のユーザー種別

1. 未ログインユーザー（ゲスト）
   - アクセス可能: ホームページのみ
   - その他のページは全てログインページにリダイレクト

2. 一般ユーザー（未サブスクライブ）
   - アクセス可能: ホームページ、占い選択ページ
   - 占いページアクセス時はサブスクリプションページにリダイレクト
   - 管理者ページは未認可ページにリダイレクト

3. サブスクライブ済みユーザー
   - アクセス可能: 全ての占いページ、履歴ページ
   - 管理者ページは未認可ページにリダイレクト

4. テストユーザー
   - アクセス可能: 全ての占いページ（サブスクリプション不要）
   - 管理者ページは未認可ページにリダイレクト

5. 管理者
   - アクセス可能: 全てのページ
   - 管理者専用機能（ダッシュボード、ユーザー管理、システム設定）

## 注意事項

1. テスト実行前に、アプリケーションが起動していることを確認してください
2. テストデータ（ユーザーアカウント等）が適切に準備されていることを確認してください
3. テスト実行中はブラウザウィンドウが自動で開閉されます
4. テストが失敗した場合は、スクリーンショットが`screenshots`ディレクトリに保存されます
5. レスポンシブデザインのテストでは、異なる画面サイズ（モバイル、タブレット、デスクトップ）での表示を確認します
6. パスワードリセットのテストでは、メール送信機能が正しく設定されていることを確認してください 