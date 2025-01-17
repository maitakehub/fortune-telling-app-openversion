import TarotReader from './TarotReader';

describe('TarotReader Component', () => {
  beforeEach(() => {
    cy.mount(<TarotReader />);
  });

  it('初期状態が正しく表示される', () => {
    cy.get('.tarot-cards').should('exist');
    cy.get('.card').should('have.length', 78); // 全タロットカード
    cy.get('.spread-options').should('exist');
  });

  it('スプレッドの選択が機能する', () => {
    cy.get('select[name="spread"]').select('3-card');
    cy.get('.spread-description').should('contain', '3枚のカードで');
  });

  it('カードの選択が機能する', () => {
    // スプレッドの選択
    cy.get('select[name="spread"]').select('3-card');
    
    // カードの選択
    cy.get('.card').first().click();
    cy.get('.selected-cards').children().should('have.length', 1);
    
    cy.get('.card').eq(1).click();
    cy.get('.selected-cards').children().should('have.length', 2);
    
    cy.get('.card').eq(2).click();
    cy.get('.selected-cards').children().should('have.length', 3);
  });

  it('リーディング結果が表示される', () => {
    // APIモック
    cy.intercept('POST', '/api/tarot/reading', {
      statusCode: 200,
      body: {
        reading: 'あなたの未来には...',
        cards: [
          { name: '女帝', position: '過去' },
          { name: '魔術師', position: '現在' },
          { name: '太陽', position: '未来' }
        ]
      }
    }).as('getTarotReading');

    // カードの選択
    cy.get('select[name="spread"]').select('3-card');
    cy.get('.card').first().click();
    cy.get('.card').eq(1).click();
    cy.get('.card').eq(2).click();

    // リーディングの開始
    cy.get('button').contains('リーディングを開始').click();
    cy.wait('@getTarotReading');

    // 結果の確認
    cy.get('.reading-result').should('be.visible');
    cy.get('.card-meaning').should('have.length', 3);
  });

  it('履歴が保存される', () => {
    // APIモック
    cy.intercept('POST', '/api/fortune/history', {
      statusCode: 200,
      body: {
        message: '履歴が保存されました'
      }
    }).as('saveHistory');

    // リーディングの実行
    cy.get('select[name="spread"]').select('3-card');
    cy.get('.card').first().click();
    cy.get('.card').eq(1).click();
    cy.get('.card').eq(2).click();
    cy.get('button').contains('リーディングを開始').click();

    // 履歴の保存を確認
    cy.wait('@saveHistory');
  });

  it('エラー処理が機能する', () => {
    // APIエラーのモック
    cy.intercept('POST', '/api/tarot/reading', {
      statusCode: 500,
      body: {
        error: 'サーバーエラーが発生しました'
      }
    }).as('getTarotReadingError');

    // リーディングの実行
    cy.get('select[name="spread"]').select('3-card');
    cy.get('.card').first().click();
    cy.get('.card').eq(1).click();
    cy.get('.card').eq(2).click();
    cy.get('button').contains('リーディングを開始').click();

    // エラーメッセージの確認
    cy.wait('@getTarotReadingError');
    cy.get('.error-message').should('be.visible');
  });
}); 