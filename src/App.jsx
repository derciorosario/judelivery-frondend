import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import LoginPage from './components/auth/LoginPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import RegisterPage from './components/auth/RegisterPage';
import VerificationPage from './components/auth/VerificationPage';

import AdminApp from './components/admin/AdminApp';
import GestorApp from './components/gestor/GestorApp';
import MotoristaApp from './components/motorista/MotoristaApp';
import CustomerApp from './components/cliente/CustomerApp';

import LandingPage from './pages/LandingPage';
import StartPage from './pages/StartPage';
import GuestOrderPage from './pages/GuestOrderPage';
import NativeStartPage from './pages/NativeStartPage';
import FaqPage from './pages/FaqPage';
import ProtectedRoute from './ProtectedRoute';
import { SocketProvider } from './contexts/SocketContext';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { isNative } from './api/client';

const AppInner = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const getAppComponent = () => {
    if (!user) return <LoginPage />;
    switch (user.role) {
      case 'superadmin':
      case 'admin':
        return <AdminApp />;
      case 'manager':
        return <GestorApp />;
      case 'driver':
        return <MotoristaApp />;
      case 'customer':
        return <CustomerApp />;
      default:
        return <LoginPage />;
    }
  };

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" replace />} />
      <Route path="/start" element={<StartPage />} />
      <Route path="/guest-order" element={<GuestOrderPage />} />
      <Route path="/verify-registration" element={<VerificationPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/faq" element={<FaqPage />} />
      <Route path="/" element={user ? getAppComponent() : (isNative ? <NativeStartPage /> : <LandingPage />)} />
      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={getAppComponent()} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <SocketProvider>
          <AppInner />
        </SocketProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
