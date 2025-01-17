# Fortune Telling App サイトマップ

## 1. 共通コンポーネント

### ヘッダー (`src/components/Header.tsx`)
- ロゴ: クリックでホームページ(`/`)に遷移
- 未ログイン時:
  - ログインボタン: `/login`に遷移
  - 新規登録ボタン: `/signup`に遷移
- ログイン時:
  - 管理者の場合: 管理画面ボタン(`/admin`に遷移)を表示
  - ログアウトボタン: ログアウト後、`/login`に遷移

## 2. 認証関連

### ログインページ (`src/pages/LoginPage.tsx`)
- パス: `/login`
- 機能:
  - メールアドレス・パスワードでログイン
  - ログイン成功時: 前のページまたは`/fortune`に遷移
  - 新規登録リンク: `/signup`に遷移

### 新規登録ページ (`src/pages/SignupPage.tsx`)
- パス: `/signup`
- 機能:
  - メールアドレス・パスワードで新規登録
  - 登録成功時: `/personal-info`に遷移
  - ログインリンク: `/login`に遷移

## 3. メインコンテンツ

### ホームページ (`src/components/HomePage.tsx`)
- パス: `/`
- 機能:
  - サービス紹介
  - 占いの種類一覧
  - サブスクリプションプラン表示
  - 各プランの「このプランを選択」ボタン:
    - 未ログイン時: `/login`に遷移
    - ログイン時: `/subscription`に遷移
    - テストプラン選択時: 直接`/fortune/fourpillars`に遷移

### 個人情報登録ページ (`src/pages/PersonalInfoPage.tsx`)
- パス: `/personal-info`
- 機能:
  - 名前、生年月日、時間、性別などの入力
  - 登録完了時: `/fortune`に遷移
  - スキップ可能: ゲストとして利用

### 占い選択ページ (`src/pages/FortunePage.tsx`)
- パス: `/fortune`
- 機能:
  - 各種占いの選択肢を表示
  - 選択時の遷移先:
    - タロット占い: `/fortune/tarot`
    - 星占い: `/fortune/astrology`
    - 数秘術: `/fortune/numerology`
    - 手相占い: `/fortune/palm`
    - 夢占い: `/fortune/dream`
    - 動物占い: `/fortune/animal`
    - 四柱推命: `/fortune/fourpillars`

### 履歴ページ (`src/pages/HistoryPage.tsx`)
- パス: `/history`
- 機能:
  - 過去の占い結果一覧表示
  - 各結果の詳細表示

### サブスクリプションページ (`src/pages/SubscriptionPage.tsx`)
- パス: `/subscription`
- 機能:
  - プラン選択と支払い
  - プラン選択後:
    - テストプラン: 直接`/fortune/fourpillars`に遷移
    - その他のプラン: 支払い画面を表示

## 4. 占いコンポーネント

### タロット占い (`src/components/TarotReader.tsx`)
- パス: `/fortune/tarot`
- 機能:
  - カード選択
  - 結果表示
  - 未サブスクライブ時: `/subscription`に遷移

### 星占い (`src/components/AstrologyChatBot.tsx`)
- パス: `/fortune/astrology`
- 機能:
  - チャット形式での占い
  - 未サブスクライブ時: `/subscription`に遷移

### 数秘術 (`src/components/NumerologyReader.tsx`)
- パス: `/fortune/numerology`
- 機能:
  - 数値入力による占い
  - 未サブスクライブ時: `/subscription`に遷移

### 手相占い (`src/components/PalmReader.tsx`)
- パス: `/fortune/palm`
- 機能:
  - 手相画像のアップロード
  - 結果表示
  - 未サブスクライブ時: `/subscription`に遷移

### 夢占い (`src/components/DreamReader.tsx`)
- パス: `/fortune/dream`
- 機能:
  - 夢の内容入力
  - 結果表示
  - 未サブスクライブ時: `/subscription`に遷移

### 動物占い (`src/components/AnimalReader.tsx`)
- パス: `/fortune/animal`
- 機能:
  - 質問に回答
  - 動物タイプ判定
  - 未サブスクライブ時: `/subscription`に遷移

### 四柱推命 (`src/components/FourPillarsReader.tsx`)
- パス: `/fortune/fourpillars`
- 機能:
  - 生年月日時による運勢判断
  - 未サブスクライブ時: `/subscription`に遷移

## 5. 管理者機能

### 管理者ダッシュボード (`src/pages/AdminDashboard.tsx`)
- パス: `/admin`
- アクセス制限: 管理者のみ
- 機能:
  - ユーザー統計表示
  - 収益情報表示
  - アクティビティ情報表示
  - ナビゲーション:
    - ユーザー管理: `/admin/users`に遷移
    - システム設定: `/admin/settings`に遷移

### ユーザー管理ページ (`src/pages/AdminUserManagement.tsx`)
- パス: `/admin/users`
- アクセス制限: 管理者のみ
- 機能:
  - ユーザー一覧表示
  - ユーザー情報編集
  - ユーザー削除
  - サブスクリプション状態の変更

### システム設定ページ (`src/pages/AdminSettings.tsx`)
- パス: `/admin/settings`
- アクセス制限: 管理者のみ
- 機能:
  - メンテナンスモード設定
  - 機能の有効/無効設定
  - サブスクリプション設定
  - 通知設定

## 6. エラーページ

### 未認可ページ (`src/pages/UnauthorizedPage.tsx`)
- パス: `/unauthorized`
- 表示条件:
  - 必要な権限がない場合
  - サブスクリプションが必要な機能にアクセスした場合
- 機能:
  - エラーメッセージ表示
  - ホームページへの遷移ボタン
  - サブスクリプションページへの遷移ボタン

## 7. アクセス制御

### 保護されたルート (`src/components/ProtectedRoute.tsx`)
- 機能:
  - 認証チェック
  - ロールベースのアクセス制御
  - サブスクリプション状態チェック
- リダイレクト:
  - 未認証時: `/login`
  - 権限不足時: `/unauthorized`
  - サブスクリプション未加入時: `/subscription` 