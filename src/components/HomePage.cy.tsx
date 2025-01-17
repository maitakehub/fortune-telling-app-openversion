import HomePage from './HomePage';

describe('HomePage Component', () => {
  beforeEach(() => {
    cy.mount(<HomePage />);
  });

  it('メインコンテンツが表示される', () => {
    cy.get('h1').should('contain', '占い師に相談');
    cy.get('button').should('have.length.at.least', 2);
  });

  it('ナビゲーションボタンが機能する', () => {
    // 星占いボタン
    cy.contains('button', '星占い').should('exist').click();
    cy.url().should('include', '/astrology');

    // タロットボタン
    cy.contains('button', 'タロット').should('exist').click();
    cy.url().should('include', '/tarot');
  });

  it('未ログイン時のリダイレクトが機能する', () => {
    // AuthContextのモック
    cy.window().its('localStorage').invoke('removeItem', 'authToken');
    
    // 星占いボタンクリック
    cy.contains('button', '星占い').click();
    cy.url().should('include', '/login');
  });

  it('ログイン時の遷移が正常に機能する', () => {
    // AuthContextのモック
    cy.window().its('localStorage').invoke('setItem', 'authToken', 'test-token');
    
    // 星占いボタンクリック
    cy.contains('button', '星占い').click();
    cy.url().should('include', '/astrology');
  });

  it('レスポンシブデザインが機能する', () => {
    // モバイルビューポート
    cy.viewport('iphone-x');
    cy.get('nav').should('have.css', 'flex-direction', 'column');

    // デスクトップビューポート
    cy.viewport(1280, 720);
    cy.get('nav').should('have.css', 'flex-direction', 'row');
  });
}); 