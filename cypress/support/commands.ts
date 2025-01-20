/// <reference types="cypress" />

// カスタムコマンドの型定義を拡張
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * ローカルストレージをクリアするカスタムコマンド
       * @example cy.clearLocalStorage()
       */
      clearLocalStorage(): Chainable<void>;

      /**
       * ログインするカスタムコマンド
       * @example cy.login('test@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>;
    }
  }
}

// カスタムコマンドの実装をここに追加
// 例: Cypress.Commands.add('login', (email, password) => { ... })

// ローカルストレージクリアコマンド
Cypress.Commands.add('clearLocalStorage', () => {
  cy.window().then((win: Window) => {
    win.localStorage.clear();
  });
});

// ログインコマンド
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.intercept('POST', '/api/auth/login').as('loginRequest');
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.wait('@loginRequest');
});

export {}; 