import ChatBot from './ChatBot';

describe('ChatBot Component', () => {
  beforeEach(() => {
    cy.mount(<ChatBot type="astrology" />);
  });

  it('チャットインターフェースが正しく表示される', () => {
    cy.get('.chat-window').should('exist');
    cy.get('.message-list').should('exist');
    cy.get('.input-area').should('exist');
  });

  it('メッセージの送信が機能する', () => {
    const message = 'テストメッセージ';
    
    // メッセージ入力と送信
    cy.get('.message-input').type(message);
    cy.get('.send-button').click();

    // メッセージの表示確認
    cy.get('.message-list').children().last().should('contain', message);
  });

  it('AIの応答が表示される', () => {
    // APIモック
    cy.intercept('POST', '/api/chat', {
      statusCode: 200,
      body: {
        message: 'AIからの応答です',
        type: 'bot'
      }
    }).as('chatResponse');

    // メッセージ送信
    cy.get('.message-input').type('こんにちは');
    cy.get('.send-button').click();

    // 応答の確認
    cy.wait('@chatResponse');
    cy.get('.bot-message').last().should('contain', 'AIからの応答です');
  });

  it('ローディング状態が表示される', () => {
    // 遅延のあるAPIレスポンスをモック
    cy.intercept('POST', '/api/chat', {
      delay: 1000,
      statusCode: 200,
      body: {
        message: '遅延応答',
        type: 'bot'
      }
    }).as('delayedResponse');

    // メッセージ送信
    cy.get('.message-input').type('応答待ち');
    cy.get('.send-button').click();

    // ローディングインジケータの確認
    cy.get('.loading-indicator').should('be.visible');
    cy.wait('@delayedResponse');
    cy.get('.loading-indicator').should('not.exist');
  });

  it('エラー処理が機能する', () => {
    // エラーレスポンスをモック
    cy.intercept('POST', '/api/chat', {
      statusCode: 500,
      body: {
        error: 'サーバーエラー'
      }
    }).as('errorResponse');

    // メッセージ送信
    cy.get('.message-input').type('エラーテスト');
    cy.get('.send-button').click();

    // エラーメッセージの確認
    cy.wait('@errorResponse');
    cy.get('.error-message').should('be.visible');
  });

  it('メッセージ履歴が保持される', () => {
    // 複数のメッセージを送信
    const messages = ['メッセージ1', 'メッセージ2', 'メッセージ3'];
    
    messages.forEach(message => {
      cy.get('.message-input').type(message);
      cy.get('.send-button').click();
      cy.get('.message-list').should('contain', message);
    });

    // メッセージ数の確認
    cy.get('.user-message').should('have.length', messages.length);
  });

  it('入力フィールドのクリアが機能する', () => {
    const message = 'クリアテスト';
    
    // メッセージ入力
    cy.get('.message-input').type(message);
    cy.get('.message-input').should('have.value', message);
    
    // 送信後のクリア確認
    cy.get('.send-button').click();
    cy.get('.message-input').should('have.value', '');
  });

  it('プレースホルダーテキストが表示される', () => {
    cy.get('.message-input').should('have.attr', 'placeholder')
      .and('include', 'メッセージを入力');
  });
}); 