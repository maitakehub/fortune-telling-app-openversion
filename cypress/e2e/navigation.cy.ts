/// <reference types="cypress" />

describe('ナビゲーションテスト', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clearLocalStorage();
  });

  it('ログイン後の占い選択画面遷移', () => {
    // ログインAPIのモック
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'mock-token',
        user: {
          id: '3',
          email: 'test@example.com',
          role: 'TEST_USER',
          isSubscribed: true
        }
      }
    }).as('loginRequest');

    // ログイン処理
    cy.login('test@example.com', 'password123');

    // 占い選択画面への遷移を確認
    cy.url().should('include', '/fortune');
    
    // 占い選択画面の要素が表示されるまで待機
    cy.get('h1', { timeout: 10000 }).should('contain', '神秘の占い');
    
    // 占い種類の選択
    cy.get('select#fortune-type', { timeout: 10000 }).should('exist');
    cy.get('select#fortune-type').select('tarot');
    
    // URLの変更を確認
    cy.url().should('include', '/fortune/tarot');
  });
}); 