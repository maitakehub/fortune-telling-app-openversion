/// <reference types="cypress" />
import { mount } from 'cypress/react';
import { SinonStub } from 'sinon';
import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/auth/AuthContext';
import { ThemeProvider } from '../../src/context/ThemeContext';
import { PersonalInfoProvider } from '../../src/context/PersonalInfoContext';

// グローバルスタイルのインポート
import '../../src/index.css';

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
      stub(): Chainable<SinonStub>;
      intercept(matcher: string | RegExp | Partial<Cypress.RequestOptions>, response?: string | object | Function): Chainable<null>;
      intercept(method: string, url: string | RegExp, response?: string | object | Function): Chainable<null>;
    }
  }
}

// mountコマンドをカスタマイズして、プロバイダーを追加
Cypress.Commands.add('mount', (component: React.ReactNode) => {
  const wrapped = React.createElement(
    BrowserRouter,
    null,
    React.createElement(
      AuthProvider,
      null,
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(
          PersonalInfoProvider,
          null,
          component
        )
      )
    )
  );

  return mount(wrapped);
});

Cypress.Commands.add('stub', () => {
  return cy.wrap(cy.stub());
});

Cypress.Commands.add('intercept', (
  methodOrMatcher: string | RegExp | Partial<Cypress.RequestOptions>,
  urlOrResponse?: string | RegExp | object | Function,
  response?: string | object | Function
) => {
  if (response) {
    return cy.intercept(methodOrMatcher as string, urlOrResponse as string | RegExp, response);
  }
  if (urlOrResponse) {
    return cy.intercept(methodOrMatcher, urlOrResponse);
  }
  return cy.intercept(methodOrMatcher);
}); 