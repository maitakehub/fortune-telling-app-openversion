import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AstrologyChatBot from './components/AstrologyChatBot';
import TarotReader from './components/TarotReader';
import PalmReader from './components/PalmReader';
import HomePage from './components/HomePage';
import PersonalInfoOnboarding from './components/PersonalInfoOnboarding';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import FortunePage from './pages/FortunePage';
import { NumerologyReader } from './components/NumerologyReader';
import DreamReader from './components/DreamReader';
import AnimalReader from './components/AnimalReader';
import FourPillarsReader from './components/FourPillarsReader';
import FengshuiReader from './components/FengshuiReader';
import { PasswordReset } from './components/PasswordReset';
import { ThemeProvider } from './contexts/ThemeContext';
import { PersonalInfoProvider } from './contexts/PersonalInfoContext';
import { AuthProvider } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';
import Header from './components/Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HistoryPage from './pages/HistoryPage';

function App() {
  return (
    <PersonalInfoProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <LoadingProvider>
              <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
                <Header />
                <div className="container mx-auto px-4 py-8">
                  <Routes>
                    {/* パブリックルート */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/reset-password" element={<PasswordReset />} />
                    
                    {/* 認証チェックを一時的に無効化 */}
                    <Route path="/fortune">
                      <Route index element={<FortunePage />} />
                      <Route path="astrology" element={<AstrologyChatBot />} />
                      <Route path="tarot" element={<TarotReader />} />
                      <Route path="palm" element={<PalmReader />} />
                      <Route path="numerology" element={<NumerologyReader />} />
                      <Route path="dream" element={<DreamReader />} />
                      <Route path="animal" element={<AnimalReader />} />
                      <Route path="fourpillars" element={<FourPillarsReader />} />
                      <Route path="fengshui" element={<FengshuiReader />} />
                      <Route path="onboarding" element={<PersonalInfoOnboarding onComplete={() => {}} onSkip={() => {}} />} />
                      <Route path="history" element={<HistoryPage />} />
                    </Route>

                    {/* 404ページ */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
                <ToastContainer />
              </div>
            </LoadingProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </PersonalInfoProvider>
  );
}

export default App;