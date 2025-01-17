/// <reference types="cypress" />

// カスタムコマンドの型定義を拡張
declare global {
  namespace Cypress {
    interface Chainable {
      // 必要に応じてカスタムコマンドの型定義を追加
    }
  }
}

// カスタムコマンドの実装をここに追加
// 例: Cypress.Commands.add('login', (email, password) => { ... })

export {}; 