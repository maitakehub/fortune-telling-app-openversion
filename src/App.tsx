import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sparkles, Settings } from 'lucide-react';
import AstrologyChatBot from '@/components/AstrologyChatBot';
import TarotReader from '@/components/TarotReader';
import PalmReader from '@/components/PalmReader';
import HomePage from '@/components/HomePage';
import PersonalInfoOnboarding from '@/components/PersonalInfoOnboarding';
import SignupPage from '@/pages/SignupPage';
import LoginPage from '@/pages/LoginPage';
import PersonalInfoPage from '@/pages/PersonalInfoPage';
import FortunePage from '@/pages/FortunePage';
import HistoryPage from '@/pages/HistoryPage';
import { NumerologyReader } from '@/components/NumerologyReader';
import DreamReader from '@/components/DreamReader';
import AnimalReader from '@/components/AnimalReader';
import FourPillarsReader from '@/components/FourPillarsReader';
import { PasswordReset } from '@/components/PasswordReset';
import { ThemeProvider } from '@/context/ThemeContext';
import { PersonalInfoProvider, usePersonalInfo } from '@/context/PersonalInfoContext';
import { AuthProvider } from '@/auth/AuthContext';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { useAuth } from '@/auth/useAuth';
import SubscriptionPage from '@/pages/SubscriptionPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminSettings from './pages/AdminSettings';
import { UserRole } from '@/types/user';

// 認証が必要なルートを保護するコンポーネント
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

function FortuneContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { personalInfo, setPersonalInfo, clearPersonalInfo, isOnboardingComplete } = usePersonalInfo();
  const { isAuthenticated } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
  }, [isAuthenticated, location, navigate]);

  // 認証状態をチェックする関数
  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    if (!token || !isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return false;
    }
    return true;
  };

  if (!isOnboardingComplete) {
    return (
      <PersonalInfoOnboarding
        onComplete={(info) => {
          setPersonalInfo(info);
          navigate('.');
        }}
        onSkip={() => {
          setPersonalInfo({
            name: 'ゲスト',
            birthDate: new Date().toISOString().split('T')[0],
            birthTime: '',
            gender: '',
            zodiacSign: '不明'
          });
          navigate('.');
        }}
        existingData={personalInfo || undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="relative text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-200 to-amber-200 mb-2">
            神秘の占い
          </h1>
          {personalInfo && (
            <>
              <p className="text-purple-200 text-lg">
                {personalInfo.name}さん（{personalInfo.zodiacSign}）の運命の導き
              </p>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="absolute right-4 top-4 p-2 rounded-full hover:bg-purple-800/30 transition-colors"
              >
                <Settings className="text-purple-200" size={24} />
              </button>
              {showSettings && (
                <div className="absolute right-4 top-16 bg-purple-900/90 rounded-lg shadow-xl border border-purple-700/50 p-4 text-left z-50">
                  <button
                    onClick={() => {
                      if (checkAuth()) {
                        setShowSettings(false);
                        clearPersonalInfo();
                        navigate('/');
                      }
                    }}
                    className="text-purple-200 hover:text-white transition-colors"
                  >
                    プロフィールをリセット
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-purple-950/50 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-800/30 p-6">
          <Routes>
            <Route path="/" element={<FortunePage />} />
            <Route path="/astrology" element={<AstrologyChatBot />} />
            <Route path="/tarot" element={<TarotReader />} />
            <Route path="/palm" element={<PalmReader />} />
            <Route path="/numerology" element={<NumerologyReader />} />
            <Route path="/dream" element={<DreamReader />} />
            <Route path="/animal" element={<AnimalReader />} />
            <Route path="/fourpillars" element={<FourPillarsReader />} />
            <Route path="*" element={<Navigate to="/fortune" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <LoadingProvider>
            <PersonalInfoProvider>
              <Routes>
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/password-reset" element={<PasswordReset />} />
                <Route path="/password-reset/:token" element={<PasswordReset />} />
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/personal-info"
                  element={
                    <ProtectedRoute>
                      <PersonalInfoPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <HistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/fortune/*"
                  element={
                    <ProtectedRoute>
                      <FortuneContent />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/subscription"
                  element={
                    <ProtectedRoute>
                      <SubscriptionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole={UserRole.ADMIN}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requiredRole={UserRole.ADMIN}>
                      <AdminUserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute requiredRole={UserRole.ADMIN}>
                      <AdminSettings />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </PersonalInfoProvider>
          </LoadingProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;