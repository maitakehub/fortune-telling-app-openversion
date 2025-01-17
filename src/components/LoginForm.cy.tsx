import LoginPage from '../pages/LoginPage';

describe('LoginForm Component', () => {
  beforeEach(() => {
    cy.mount(<LoginPage />);
  });

  it('フォームが正しく表示される', () => {
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('バリデーションが機能する', () => {
    // 空のフォーム送信
    cy.get('button[type="submit"]').click();
    cy.get('form').contains('メールアドレスは必須です').should('exist');

    // 無効なメールアドレス
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('button[type="submit"]').click();
    cy.get('form').contains('有効なメールアドレスを入力してください').should('exist');
  });

  it('ログインが成功する', () => {
    // APIモック
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'test-token',
        user: {
          email: 'test@example.com',
          isSubscribed: false
        }
      }
    }).as('loginRequest');

    // フォーム入力と送信
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('Password123');
    cy.get('button[type="submit"]').click();

    // リクエストとリダイレクトの確認
    cy.wait('@loginRequest');
    cy.url().should('include', '/fortune');
  });

  it('ログインが失敗する', () => {
    // APIモック
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: {
        type: 'INVALID_CREDENTIALS',
        message: 'メールアドレスまたはパスワードが正しくありません。'
      }
    }).as('loginRequest');

    // フォーム入力と送信
    cy.get('input[type="email"]').type('wrong@example.com');
    cy.get('input[type="password"]').type('WrongPassword123');
    cy.get('button[type="submit"]').click();

    // エラーメッセージの確認
    cy.wait('@loginRequest');
    cy.get('form').contains('メールアドレスまたはパスワードが正しくありません。').should('exist');
  });
}); 