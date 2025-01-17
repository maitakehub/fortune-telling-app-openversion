# Fortune Telling App with AI 🔮

AIを活用したタロットカードと星占いの占いアプリケーション。

## ✨ 機能

### AIタロットカード占い
- OpenAI APIを活用したカード解釈
- アニメーション付きのカードドロー
- 詳細な解説とAIによる洞察
- 1日1回の無料占い

### AI星占い
- OpenAI APIを活用したパーソナライズされた占い結果
- 12星座対応
- 対話形式の占い体験
- 複数の運勢カテゴリー（恋愛、仕事、健康など）

### 管理機能
- ダッシュボード（ユーザー統計、収益、アクティビティ）
- ユーザー管理（編集、削除、権限設定）
- システム設定（メンテナンスモード、機能トグル）

### セキュリティ
- パスワードリセット機能
- セッション管理
- 権限ベースのアクセス制御

### UI/UX
- レスポンシブデザイン（モバイル、タブレット、デスクトップ対応）
- ローディングインジケータとオーバーレイ
- アニメーションとトランジション効果
- エラーハンドリングとフィードバック

## 🛠 技術スタック

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide Icons
- OpenAI API

## 🚀 開始方法

```bash
# リポジトリのクローン
git clone https://github.com/t012093/fortune-telling-app.git

# プロジェクトディレクトリに移動
cd fortune-telling-app

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 📝 環境設定

### OpenAI APIキーの取得

1. **OpenAI Platformへのアクセス**
   - [OpenAI Platform](https://platform.openai.com/) にアクセス
   - アカウントを作成またはログイン

2. **APIキーの作成**
   - 左側のメニューから「API keys」を選択
   - 「+ Create new secret key」をクリック
   - 生成されたAPIキーをコピー

3. **環境変数の設定**
   - プロジェクトのルートディレクトリに`.env`ファイルを作成
   - 以下の内容を追加：
     ```env
     VITE_OPENAI_API_KEY=your_api_key_here
     ```
   - `your_api_key_here`を実際のAPIキーに置き換え

### セキュリティ注意事項
- `.env`ファイルは必ず`.gitignore`に追加してください
- APIキーは公開しないよう、適切に管理してください

## 📜 ライセンス

MIT
