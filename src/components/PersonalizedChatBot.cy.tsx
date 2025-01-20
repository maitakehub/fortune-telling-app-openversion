import React from 'react';
import { mount } from 'cypress/react';
import PersonalizedChatBot from './PersonalizedChatBot';
import { ChatContext } from '../types/chat';
import { FortuneType } from '../types';
import { User, UserRole, ReadingDepth, ReadingFocus } from '../types/user';
import { AuthContext } from '../auth/AuthContext';

describe('PersonalizedChatBot', () => {
  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'テストユーザー',
    displayName: 'テストさん',
    role: UserRole.USER,
    isSubscribed: true,
    personalInfo: {
      name: 'テストユーザー',
      birthDate: '1990-01-01',
      birthTime: '12:00',
      zodiacSign: 'capricorn'
    },
    preferences: {
      favoriteTypes: ['tarot', 'numerology'],
      interestedAspects: ['love', 'work'],
      culturalContext: 'japanese',
      notificationSettings: {
        daily: true,
        weekly: true,
        monthly: true,
        fortuneTypes: ['tarot', 'numerology'],
        channels: {
          email: true,
          browser: true,
          mobile: false
        }
      },
      displaySettings: {
        theme: 'dark',
        fontSize: 'medium',
        language: 'ja',
        showImages: true,
        compactView: false
      },
      privacySettings: {
        shareHistory: true,
        allowAnalytics: true,
        storeDuration: 30
      },
      fortuneSettings: {
        defaultTypes: ['tarot', 'numerology'],
        favoriteSymbols: [],
        excludedSymbols: [],
        customKeywords: [],
        readingPreferences: {
          numerology: {
            depth: 'basic' as ReadingDepth,
            focus: ['practical' as ReadingFocus],
            autoSave: true
          },
          tarot: {
            depth: 'basic' as ReadingDepth,
            focus: ['practical' as ReadingFocus],
            autoSave: true
          },
          palm: {
            depth: 'basic' as ReadingDepth,
            focus: ['practical' as ReadingFocus],
            autoSave: true
          },
          dream: {
            depth: 'basic' as ReadingDepth,
            focus: ['practical' as ReadingFocus],
            autoSave: true
          },
          compatibility: {
            depth: 'basic' as ReadingDepth,
            focus: ['practical' as ReadingFocus],
            autoSave: true
          },
          fortune: {
            depth: 'basic' as ReadingDepth,
            focus: ['practical' as ReadingFocus],
            autoSave: true
          },
          general: {
            depth: 'basic' as ReadingDepth,
            focus: ['practical' as ReadingFocus],
            autoSave: true
          }
        }
      }
    },
    lastLoginDate: '2024-03-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z'
  };

  const mockContext: Partial<ChatContext> = {
    fortuneHistory: [
      {
        type: 'tarot' as FortuneType,
        result: '過去の占い結果です',
        timestamp: '2024-03-01T00:00:00Z'
      }
    ],
    preferences: {
      favoriteTypes: ['tarot', 'numerology'] as FortuneType[],
      interestedAspects: ['love', 'work'],
      language: 'ja'
    }
  };

  const mockAuthValue = {
    user: mockUser,
    isAuthenticated: true,
    loading: false,
    error: null,
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    signup: () => Promise.resolve(),
    resetPassword: () => Promise.resolve(),
    updateProfile: () => Promise.resolve(),
    refreshSession: () => Promise.resolve()
  };

  beforeEach(() => {
    cy.stub(window, 'crypto').callsFake(() => ({
      randomUUID: () => 'test-session-id'
    }));

    const onContextUpdateStub = (context: ChatContext) => {};
    cy.stub(onContextUpdateStub).as('onContextUpdate');

    cy.mount(
      <AuthContext.Provider value={mockAuthValue}>
        <PersonalizedChatBot
          initialContext={mockContext}
          fortuneType="tarot"
          onContextUpdate={onContextUpdateStub}
        />
      </AuthContext.Provider>
    );
  });

  it('初期メッセージが表示される', () => {
    cy.contains(`こんにちは、${mockUser.displayName}さん！`).should('be.visible');
    cy.get('button').contains('今日の運勢を教えて').should('be.visible');
  });

  it('メッセージの送信と応答の表示', () => {
    const message = '今日の運勢を教えてください';
    
    cy.intercept('POST', '/api/chat', {
      statusCode: 200,
      body: {
        content: 'AIからの応答です',
        error: null
      }
    }).as('chatResponse');

    cy.get('input[type="text"]').type(message);
    cy.get('button').contains('送信').click();

    cy.wait('@chatResponse');
    cy.contains('AIからの応答です').should('be.visible');
    cy.get('@onContextUpdate').should('have.been.called');
  });

  it('コンテキストの更新が正しく行われる', () => {
    const message = '仕事運について教えて';
    
    cy.intercept('POST', '/api/chat', {
      statusCode: 200,
      body: {
        content: '仕事運の占い結果です',
        error: null
      }
    }).as('chatResponse');

    cy.get('input[type="text"]').type(message);
    cy.get('button').contains('送信').click();

    cy.wait('@chatResponse');
    cy.get('@onContextUpdate').should('have.been.calledWith', 
      Cypress.sinon.match.has('fortuneHistory', 
        Cypress.sinon.match.array.contains([
          Cypress.sinon.match.has('type', 'tarot')
        ])
      )
    );
  });

  it('エラー時の表示', () => {
    cy.intercept('POST', '/api/chat', {
      statusCode: 500,
      body: {
        error: 'エラーが発生しました'
      }
    }).as('chatError');

    cy.get('input[type="text"]').type('テストメッセージ');
    cy.get('button').contains('送信').click();

    cy.wait('@chatError');
    cy.contains('エラーが発生しました').should('be.visible');
  });

  it('サジェスチョンのクリックで入力欄に反映される', () => {
    cy.get('button').contains('今日の運勢を教えて').click();
    cy.get('input[type="text"]').should('have.value', '今日の運勢を教えて');
  });

  it('ローディング状態の表示', () => {
    cy.intercept('POST', '/api/chat', {
      delay: 1000,
      statusCode: 200,
      body: {
        content: '遅延レスポンス',
        error: null
      }
    }).as('delayedResponse');

    cy.get('input[type="text"]').type('テストメッセージ');
    cy.get('button').contains('送信').click();

    cy.contains('占いの神託を読み解いています...').should('be.visible');
    cy.wait('@delayedResponse');
    cy.contains('遅延レスポンス').should('be.visible');
  });
}); 