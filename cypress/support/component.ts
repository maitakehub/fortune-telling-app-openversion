/// <reference types="cypress" />
import './commands';
import { mount } from 'cypress/react18';
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