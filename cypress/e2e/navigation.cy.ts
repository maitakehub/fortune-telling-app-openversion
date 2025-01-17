describe('Fortune Telling App Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('Guest navigation', () => {
    cy.get('a[href="/login"]').click();
    cy.url().should('include', '/login');
    cy.go('back');
    cy.get('a[href="/signup"]').click();
    cy.url().should('include', '/signup');
  });

  it('Normal user navigation', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'mock-token',
        user: {
          email: 'normal@test.com',
          role: 'USER',
          isSubscribed: false
        }
      }
    }).as('loginRequest');

    cy.get('a[href="/login"]').click();
    cy.get('input[type="email"]').type(Cypress.env('NORMAL_USER_EMAIL'));
    cy.get('input[type="password"]').type(Cypress.env('NORMAL_USER_PASSWORD'));
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');
    cy.url().should('include', '/fortune');
  });

  it('Subscribed user navigation', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'mock-token',
        user: {
          email: 'premium@test.com',
          role: 'USER',
          isSubscribed: true
        }
      }
    }).as('loginRequest');

    cy.get('a[href="/login"]').click();
    cy.get('input[type="email"]').type(Cypress.env('SUBSCRIBED_USER_EMAIL'));
    cy.get('input[type="password"]').type(Cypress.env('SUBSCRIBED_USER_PASSWORD'));
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');
    cy.url().should('include', '/fortune');
  });

  it('Test user navigation', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'mock-token',
        user: {
          email: 'tester@test.com',
          role: 'TEST_USER',
          isSubscribed: false
        }
      }
    }).as('loginRequest');

    cy.get('a[href="/login"]').click();
    cy.get('input[type="email"]').type(Cypress.env('TEST_USER_EMAIL'));
    cy.get('input[type="password"]').type(Cypress.env('TEST_USER_PASSWORD'));
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');
    cy.url().should('include', '/fortune');
  });

  it('Admin navigation', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'mock-token',
        user: {
          email: 'admin@test.com',
          role: 'ADMIN',
          isSubscribed: true
        }
      }
    }).as('loginRequest');

    cy.get('a[href="/login"]').click();
    cy.get('input[type="email"]').type(Cypress.env('ADMIN_USER_EMAIL'));
    cy.get('input[type="password"]').type(Cypress.env('ADMIN_USER_PASSWORD'));
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');
    cy.url().should('include', '/fortune');
  });

  describe('New user registration flow', () => {
    it('新規登録から個人情報入力、フォーチュンページまでの遷移が正しく動作する', () => {
      // サインアップAPIのモック
      cy.intercept('POST', '/api/auth/signup', {
        statusCode: 200,
        body: {
          token: 'mock-token',
          user: {
            id: 1,
            email: 'test@example.com',
            role: 'USER',
            isSubscribed: false,
            hasCompletedOnboarding: false
          }
        }
      }).as('signupRequest');

      // getCurrentUserのモック
      cy.intercept('GET', '/api/user/me', {
        statusCode: 200,
        body: {
          id: 1,
          email: 'test@example.com',
          role: 'USER',
          isSubscribed: false,
          hasCompletedOnboarding: false
        }
      }).as('getCurrentUser');

      // 個人情報保存APIのモック
      cy.intercept('POST', '/api/user/personal-info', {
        statusCode: 200,
        body: {
          message: '個人情報が保存されました',
          user: {
            id: 1,
            email: 'test@example.com',
            role: 'USER',
            isSubscribed: false,
            hasCompletedOnboarding: true
          }
        }
      }).as('personalInfoRequest');

      // サインアップページにアクセス
      cy.visit('/signup');
      cy.log('サインアップページにアクセスしました');

      // メールアドレスとパスワードを入力
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      // サインアップリクエストの完了を待つ
      cy.wait('@signupRequest');
      cy.log('サインアップが完了しました');

      // 個人情報入力ページに遷移したことを確認
      cy.url().should('include', '/personal-info');
      cy.log('個人情報入力ページに遷移しました');

      // フォームが表示されていることを確認
      cy.get('[data-testid="personal-info-form"]').should('be.visible');
      cy.log('個人情報入力フォームが表示されています');

      // ステップ1: 名前を入力
      cy.get('[data-testid="name-input"]').should('be.visible').type('テスト太郎');
      cy.get('[data-testid="personal-info-form"]').submit();
      cy.log('名前を入力し、フォームを送信しました');

      // ステップ2: 生年月日と時間を入力
      cy.get('[data-testid="birth-date-input"]', { timeout: 10000 }).should('be.visible').type('1990-01-01');
      cy.get('[data-testid="birth-time-input"]', { timeout: 10000 }).should('be.visible').type('12:00');
      cy.get('[data-testid="personal-info-form"]').submit();
      cy.log('生年月日と時間を入力し、フォームを送信しました');

      // ステップ3: 性別と星座を選択して送信
      cy.get('[data-testid="zodiac-sign-select"]').should('be.visible').select('aries');
      cy.get('[data-testid="personal-info-form"]').submit();
      cy.log('性別と星座を選択し、フォームを送信しました');

      // 個人情報保存リクエストの完了を待つ
      cy.wait('@personalInfoRequest');
      cy.log('個人情報の保存が完了しました');

      // フォーチュンページへの遷移を確認
      cy.url().should('include', '/fortune');
      cy.log('フォーチュンページに遷移しました');
    });
  });
}); 