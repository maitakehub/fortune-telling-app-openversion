import AstrologyChatBot from './AstrologyChatBot';

describe('AstrologyChatBot Component', () => {
  beforeEach(() => {
    cy.mount(<AstrologyChatBot />);
  });

  it('チャットインターフェースが正しく表示される', () => {
    cy.get('.chat-container').should('exist');
    cy.get('.message-input').should('exist');
    cy.get('button').contains('送信').should('exist');
  });

  it('メッセージの送信が機能する', () => {
    const message = 'これからの運勢を教えてください';
    
    // メッセージ入力と送信
    cy.get('.message-input').type(message);
    cy.get('button').contains('送信').click();

    // 送信メッセージの表示確認
    cy.get('.user-message').last().should('contain', message);
  });

  it('AIの応答が表示される', () => {
    // APIモック
    cy.intercept('POST', '/api/astrology/chat', {
      statusCode: 200,
      body: {
        message: 'あなたの星座は...',
        horoscope: {
          sign: '牡羊座',
          prediction: '良い機会に恵まれる時期です'
        }
      }
    }).as('getAstrologyResponse');

    // メッセージ送信
    cy.get('.message-input').type('今日の運勢を教えて');
    cy.get('button').contains('送信').click();

    // AI応答の確認
    cy.wait('@getAstrologyResponse');
    cy.get('.bot-message').last().should('contain', '牡羊座');
  });

  it('ホロスコープ情報が表示される', () => {
    // APIモック
    cy.intercept('GET', '/api/astrology/horoscope', {
      statusCode: 200,
      body: {
        planets: [
          { name: '太陽', sign: '牡羊座', house: 1 },
          { name: '月', sign: '蟹座', house: 4 }
        ],
        aspects: [
          { planet1: '太陽', planet2: '月', type: 'トライン' }
        ]
      }
    }).as('getHoroscope');

    // ホロスコープ表示ボタンクリック
    cy.get('button').contains('ホロスコープを表示').click();

    // 情報の確認
    cy.wait('@getHoroscope');
    cy.get('.horoscope-info').should('be.visible');
    cy.get('.planet-position').should('have.length.at.least', 2);
  });

  it('エラー処理が機能する', () => {
    // APIエラーのモック
    cy.intercept('POST', '/api/astrology/chat', {
      statusCode: 500,
      body: {
        error: 'サーバーエラーが発生しました'
      }
    }).as('getChatError');

    // メッセージ送信
    cy.get('.message-input').type('今日の運勢を教えて');
    cy.get('button').contains('送信').click();

    // エラーメッセージの確認
    cy.wait('@getChatError');
    cy.get('.error-message').should('be.visible');
  });

  it('チャット履歴が保存される', () => {
    // APIモック
    cy.intercept('POST', '/api/fortune/history', {
      statusCode: 200,
      body: {
        message: '履歴が保存されました'
      }
    }).as('saveHistory');

    // メッセージのやり取り
    cy.get('.message-input').type('今日の運勢を教えて');
    cy.get('button').contains('送信').click();

    // 履歴の保存を確認
    cy.wait('@saveHistory');
  });

  it('入力バリデーションが機能する', () => {
    // 空メッセージの送信
    cy.get('button').contains('送信').click();
    cy.get('.error-message').should('contain', 'メッセージを入力してください');

    // 長すぎるメッセージ
    const longMessage = 'a'.repeat(1001);
    cy.get('.message-input').type(longMessage);
    cy.get('.error-message').should('contain', 'メッセージは1000文字以内で入力してください');
  });
}); 