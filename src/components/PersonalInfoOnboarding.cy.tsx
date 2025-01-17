import PersonalInfoOnboarding from './PersonalInfoOnboarding';

describe('PersonalInfoOnboarding Component', () => {
  beforeEach(() => {
    cy.mount(<PersonalInfoOnboarding />);
  });

  it('フォームが正しく表示される', () => {
    cy.get('input[name="birthDate"]').should('exist');
    cy.get('select[name="birthTime"]').should('exist');
    cy.get('input[name="birthPlace"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('バリデーションが機能する', () => {
    // 空のフォーム送信
    cy.get('button[type="submit"]').click();
    cy.contains('生年月日は必須です').should('exist');
    cy.contains('出生時刻は必須です').should('exist');
    cy.contains('出生地は必須です').should('exist');

    // 無効な生年月日
    cy.get('input[name="birthDate"]').type('2025-01-01');
    cy.get('button[type="submit"]').click();
    cy.contains('未来の日付は選択できません').should('exist');
  });

  it('フォーム送信が成功する', () => {
    // APIモック
    cy.intercept('POST', '/api/user/personal-info', {
      statusCode: 200,
      body: {
        message: '個人情報が保存されました',
        user: {
          birthDate: '1990-01-01',
          birthTime: '12:00',
          birthPlace: '東京都'
        }
      }
    }).as('savePersonalInfo');

    // フォーム入力
    cy.get('input[name="birthDate"]').type('1990-01-01');
    cy.get('select[name="birthTime"]').select('12:00');
    cy.get('input[name="birthPlace"]').type('東京都');
    
    // フォーム送信
    cy.get('button[type="submit"]').click();

    // リクエストと遷移の確認
    cy.wait('@savePersonalInfo');
    cy.url().should('include', '/fortune');
  });

  it('場所の自動補完が機能する', () => {
    cy.get('input[name="birthPlace"]').type('東京');
    cy.get('.suggestions').should('be.visible');
    cy.contains('.suggestion-item', '東京都').click();
    cy.get('input[name="birthPlace"]').should('have.value', '東京都');
  });

  it('時刻選択が正しく機能する', () => {
    cy.get('select[name="birthTime"]').select('12:00');
    cy.get('select[name="birthTime"]').should('have.value', '12:00');
  });
}); 