import React, { useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { WalletProvider } from './contexts/WalletContext';
import { SecurityProvider } from './contexts/SecurityContext';
import { AdminProvider } from './contexts/AdminContext';
import { useAuth } from './contexts/AuthContext';
import { useAdmin } from './contexts/AdminContext';
import { useTheme } from './contexts/ThemeContext';
import { useLanguage } from './contexts/LanguageContext';
import { useSecurity } from './contexts/SecurityContext';
import { FaBars, FaUser, FaChartLine, FaHistory, FaShieldAlt, FaCog, FaHeadset, FaEnvelope } from 'react-icons/fa';
import './App.css';

// 페이지 컴포넌트들
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Security from './pages/Security';
import PinAuth from './pages/PinAuth';
import PinSetup from './pages/PinSetup';
import Sent from './pages/Sent';
import Receive from './pages/Receive';
import Chat from './pages/Chat';
import Coins from './pages/Coins';
import AdminPage from './pages/AdminPage';
import CustomerSupport from './pages/CustomerSupport';
import Feedback from './pages/Feedback';
import BottomNavigation from './components/BottomNavigation';

const AppContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { isAdmin } = useAdmin();
  const { t } = useLanguage();
  const { securitySettings } = useSecurity();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(undefined);

  // 프로필 사진 로드
  React.useEffect(() => {
    try {
      const savedPhoto = sessionStorage.getItem('profile_photo');
      if (savedPhoto) {
        setProfilePhoto(savedPhoto);
      } else if (user?.avatar) {
        setProfilePhoto(user.avatar);
      }
    } catch (error) {
      console.warn('프로필 사진을 로드할 수 없습니다:', error);
    }
  }, [user?.avatar]);

  // 로그인/회원가입 페이지는 헤더와 네비게이션 없이 렌더링
  if (location.pathname === '/login' || location.pathname === '/register') {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Login />;
  }

  // PIN이 활성화되어 있고 현재 PIN 인증 페이지가 아닌 경우
  if (securitySettings.pinEnabled && location.pathname !== '/pin-auth' && location.pathname !== '/pin-setup') {
    return <PinAuth />;
  }

  // PIN 설정이 필요한 경우 (사용자가 PIN을 선택한 경우에만)
  if (securitySettings.pinEnabled && !securitySettings.pin && location.pathname !== '/pin-setup') {
    return <PinSetup />;
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);



  const sidebarItems = [
    { path: '/analytics', icon: <FaChartLine />, label: t('analytics') },
    { path: '/history', icon: <FaHistory />, label: t('history') },
    { path: '/security', icon: <FaShieldAlt />, label: t('security') },
    { path: '/settings', icon: <FaCog />, label: '설정' },
    { path: '/customer-support', icon: <FaHeadset />, label: '고객센터' },
    { path: '/feedback', icon: <FaEnvelope />, label: '의견 보내기' }
  ];

  if (isAdmin) {
    sidebarItems.unshift({ path: '/admin', icon: <FaUser />, label: t('admin') });
  }

  return (
    <div className="app">
      {/* 헤더 */}
      <header className="header">
        <div className="header-left">
          <div className="profile-photo" onClick={() => navigate('/profile')}>
            <img 
              src={profilePhoto || "https://via.placeholder.com/40x40/ffd700/000000?text=U"} 
              alt="Profile" 
              className="profile-img" 
            />
            <div className="profile-info">
              <div className="profile-email">{user?.email || 'user@example.com'}</div>
            </div>
          </div>
        </div>
        
        <div className="header-center">
          <div className="logo" onClick={() => navigate('/')}>
            <img 
              src="/logo.png" 
              alt="YOY Wallet" 
              className="logo-img"
              onError={(e) => {
                // 이미지 로드 실패 시 텍스트로 대체
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const textLogo = target.nextElementSibling as HTMLElement;
                if (textLogo) textLogo.style.display = 'block';
              }}
            />
            <div className="logo-text" style={{ display: 'none' }}>
              YOY Wallet
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <FaBars />
          </button>
        </div>
      </header>

      {/* 사이드바 */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>메뉴</h3>
          <button className="close-btn" onClick={closeSidebar}>
            ×
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {sidebarItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </div>

      {/* 사이드바 오버레이 */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      {/* 메인 콘텐츠 */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/history" element={<History />} />
          <Route path="/security" element={<Security />} />
          <Route path="/pin-auth" element={<PinAuth />} />
          <Route path="/pin-setup" element={<PinSetup />} />
          <Route path="/sent" element={<Sent />} />
          <Route path="/receive" element={<Receive />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/coins" element={<Coins />} />
          <Route path="/admin-page" element={<AdminPage />} />
          <Route path="/customer-support" element={<CustomerSupport />} />
          <Route path="/feedback" element={<Feedback />} />
        </Routes>
      </main>

      {/* 하단 네비게이션 */}
      <BottomNavigation />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <WalletProvider>
            <SecurityProvider>
              <AdminProvider>
                <AppContent />
              </AdminProvider>
            </SecurityProvider>
          </WalletProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
