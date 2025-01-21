# Fortune Telling App

占いアプリケーション - タロット、四柱推命、風水など、多様な占いを提供するWebアプリケーション

## 機能

- 🔮 タロット占い
- 📅 四柱推命
- 🏠 風水診断
- 🌟 アストロロジー
- 💎 石占い
- 📊 占い履歴の管理

## 技術スタック

- React + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- OpenAI API (GPT-4)

## セットアップ手順

1. リポジトリのクローン:
```bash
git clone [リポジトリURL]
cd fortune-telling-app
```

2. 依存関係のインストール:
```bash
npm install
# または
pnpm install
```

3. 環境変数の設定:
`.env`ファイルを作成し、必要な環境変数を設定:
```
VITE_OPENAI_API_KEY=your_api_key_here
```

4. 開発サーバーの起動:
```bash
npm run dev
# または
pnpm dev
```

## 使用方法

1. アプリケーションにアクセス（デフォルト: http://localhost:5173）
2. 希望の占いを選択
3. 必要な情報を入力
4. 結果を確認

## 注意事項

- OpenAI APIキーが必要です
- 画像アップロードの上限は10MBです
- テストプランでは一部機能が制限されます

## ライセンス

MIT License
