import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { WalletProvider } from './contexts/WalletContext';
import { SecurityProvider } from './contexts/SecurityContext';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import History from './pages/History';
import PinSetup from './pages/PinSetup';
import PinAuth from './pages/PinAuth';
import Admin from './pages/Admin';
import Layout from './components/Layout';
import './App.css';

import { useSecurity } from './contexts/SecurityContext';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { securitySettings } = useSecurity();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const { isAdmin } = useAdmin();
  
  // 관리자 페이지인지 확인
  const isAdminPage = location.pathname === '/admin';
  
  // 관리자 모드 클래스 적용
  React.useEffect(() => {
    if (isAdminPage || isAdmin) {
      document.body.classList.add('admin-mode');
    } else {
      document.body.classList.remove('admin-mode');
    }
  }, [isAdminPage, isAdmin]);

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pin-setup" element={<PinSetup />} />
        <Route path="/pin-auth" element={<PinAuth />} />
        <Route path="/admin" element={<Admin />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="history" element={<History />} />
        </Route>
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <WalletProvider>
          <SecurityProvider>
            <AdminProvider>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </AdminProvider>
          </SecurityProvider>
        </WalletProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
