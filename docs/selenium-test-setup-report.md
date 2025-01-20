# Seleniumテスト環境構築レポート

## 1. 発生した問題

### 1.1 初期の問題
- TypeScriptファイルの拡張子（.ts）が認識されない
```
TypeError: Unknown file extension ".ts" for [...]/auth.test.ts
```

### 1.2 モジュールシステムの問題
- ES ModulesとCommonJSの混在による問題
- `ts-node`の設定とMochaの実行環境の不整合

### 1.3 環境設定の問題
- ChromeDriverの初期化エラー
- テストのタイムアウト問題

## 2. 解決プロセス

### 2.1 TypeScript設定の統一
1. `package.json`の設定を最適化
```json
{
  "scripts": {
    "test:selenium": "cross-env TS_NODE_COMPILER_OPTIONS={\\\"module\\\":\\\"commonjs\\\"} mocha -r ts-node/register tests/selenium/**/*.test.ts --timeout 60000"
  }
}
```

2. `tsconfig.json`の設定を整理
```json
{
  "compilerOptions": {
    "target": "es2017",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "types": ["node", "mocha", "selenium-webdriver", "chai"]
  }
}
```

### 2.2 依存関係の最適化
- 特定のバージョンの依存関係をインストール
```bash
npm install --save-dev ts-node@10.9.2 typescript@4.9.5 @types/node@20.11.16 mocha@10.2.0 @types/mocha@10.0.6 chai@4.3.10 @types/chai@4.3.11 --legacy-peer-deps
```

### 2.3 ChromeDriver設定の改善
```typescript
const options = new chrome.Options();
options.addArguments('--no-sandbox');
options.addArguments('--headless');
options.addArguments('--disable-dev-shm-usage');

driver = await new Builder()
  .forBrowser('chrome')
  .setChromeOptions(options)
  .build();
```

## 3. 主要な解決策

1. モジュールシステムの統一
   - CommonJSに統一することで、TypeScriptのコンパイルとモジュール解決の問題を解決

2. コンパイラオプションの明示的な指定
   - `TS_NODE_COMPILER_OPTIONS`を使用して、実行時のTypeScript設定を制御

3. 適切なタイムアウト設定
   - テストとブラウザの操作に十分な時間を確保

## 4. 得られた教訓

1. モジュールシステムの一貫性
   - TypeScriptプロジェクトでは、モジュールシステム（CommonJS/ESM）を一貫させることが重要

2. 明示的な設定
   - 複数の設定ファイル（package.json, tsconfig.json）間で設定が重複しないようにする
   - コンパイラオプションを明示的に指定する

3. エラーハンドリング
   - ChromeDriverの初期化時のエラーハンドリングを強化
   - テストのタイムアウト設定を適切に管理

## 5. 今後の改善点

1. テスト実行の安定性向上
   - より堅牢なエラーハンドリングの実装
   - テストの並列実行の検討

2. CI/CD対応
   - GitHub Actionsなどでの実行時の設定最適化
   - ヘッドレスモードでのテスト実行の安定化

3. レポーティング
   - テスト結果の詳細なレポート生成
   - スクリーンショットやビデオ記録の追加 