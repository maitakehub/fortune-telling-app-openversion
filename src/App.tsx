import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sparkles, Settings } from 'lucide-react';
import AstrologyChatBot from './components/AstrologyChatBot';
import TarotReader from './components/TarotReader';
import PalmReader from './components/PalmReader';
import HomePage from './components/HomePage';
import PersonalInfoOnboarding from './components/PersonalInfoOnboarding';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import PersonalInfoPage from './pages/PersonalInfoPage';
import FortunePage from './pages/FortunePage';
import HistoryPage from './pages/HistoryPage';
import { NumerologyReader } from './components/NumerologyReader';
import DreamReader from './components/DreamReader';
import AnimalReader from './components/AnimalReader';
import FourPillarsReader from './components/FourPillarsReader';
import { PasswordReset } from './components/PasswordReset';
import { ThemeProvider } from './contexts/ThemeContext';
import { PersonalInfoProvider, usePersonalInfo } from './contexts/PersonalInfoContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';
import SubscriptionPage from './pages/SubscriptionPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminSettings from './pages/AdminSettings';
import { UserRole } from './types/user';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import PersonalizedChatBot from './components/PersonalizedChatBot';
import ChatBot from './components/ChatBot';

// 認証が必要なルートを保護するコンポーネント
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isAuthenticated = !!user;

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
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
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
  }, [isAuthenticated, location, navigate]);

  // 認証状態をチェックする関数
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token || !isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return false;
    }
    return true;
  };

  if (!isOnboardingComplete) {
    return (
      <PersonalInfoOnboarding
        onComplete={(info) => {
          setPersonalInfo(info);
          navigate('/fortune');
        }}
        onSkip={() => {
          setPersonalInfo({
            name: 'ゲスト',
            birthDate: new Date().toISOString().split('T')[0],
            birthTime: '',
            gender: '',
            zodiacSign: '不明'
          });
          navigate('/fortune');
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

// Layouts
const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LoadingProvider>
          <PersonalInfoProvider>
            <Router>
              <div className="min-h-screen bg-gray-900 text-white">
                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="dark"
                />
                <Routes>
                  {/* 認証不要のルート */}
                  <Route path="/" element={<AuthLayout><HomePage /></AuthLayout>} />
                  <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
                  <Route path="/signup" element={<AuthLayout><SignupPage /></AuthLayout>} />
                  <Route path="/password-reset" element={<PasswordReset />} />
                  <Route path="/password-reset/:token" element={<PasswordReset />} />

                  {/* 認証が必要なルート */}
                  <Route path="/personal-info" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <PersonalInfoPage />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/history" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <HistoryPage />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/fortune/*" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <FortuneContent />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/subscription" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <SubscriptionPage />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute requiredRole={UserRole.ADMIN}>
                      <MainLayout>
                        <AdminDashboard />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/users" element={
                    <ProtectedRoute requiredRole={UserRole.ADMIN}>
                      <MainLayout>
                        <AdminUserManagement />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/settings" element={
                    <ProtectedRoute requiredRole={UserRole.ADMIN}>
                      <MainLayout>
                        <AdminSettings />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/chat" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <PersonalizedChatBot />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/fortune/chat" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ChatBot />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/fortune/astrology-chat" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <AstrologyChatBot />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </Router>
          </PersonalInfoProvider>
        </LoadingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;