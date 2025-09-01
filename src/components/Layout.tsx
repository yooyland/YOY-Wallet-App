import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSecurity } from '../contexts/SecurityContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  FaWallet, 
  FaHome, 
  FaUser, 
  FaCog, 
  FaSignOutAlt,
  FaBars,
  FaChartLine,
  FaHistory,
  FaShieldAlt
} from 'react-icons/fa';
import './Layout.css';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { securitySettings } = useSecurity();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    // 보안 설정이 있으면 PIN 인증 페이지로, 없으면 로그인 페이지로
    if (securitySettings.pinEnabled || securitySettings.biometricEnabled) {
      navigate('/pin-auth');
    } else {
      navigate('/login');
    }
  };

  // 하단 탭바 메뉴 (주요 기능)
  const tabItems = [
    { path: '/', label: t('nav.dashboard'), icon: <FaHome /> },
    { path: '/wallet', label: t('nav.wallet'), icon: <FaWallet /> },
    { path: '/profile', label: t('nav.profile'), icon: <FaUser /> },
    { path: '/settings', label: t('nav.settings'), icon: <FaCog /> },
  ];

  // 사이드바 메뉴 (추가 설정)
  const sidebarItems = [
    { path: '/analytics', label: '분석', icon: <FaChartLine /> },
    { path: '/history', label: '거래내역', icon: <FaHistory /> },
    { path: '/security', label: '보안', icon: <FaSignOutAlt /> },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="layout">
      {/* 상단 헤더 */}
      <header className="app-header">
        <div className="header-actions" onClick={() => navigate('/profile')} title="My Dashboard">
          <div className="user-avatar-small">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.username} />
            ) : (
              <div className="avatar-placeholder-small">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
            )}
          </div>
        </div>
        <div className="header-logo">
          <img 
            src={isDark ? "/logo.png" : "/logo-1.png"} 
            alt="YOY Wallet" 
            className="header-logo-image" 
          />
        </div>
        <button className="menu-toggle" onClick={toggleSidebar} aria-label="Open menu">
          <FaBars />
        </button>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>

      {/* 하단 탭바 */}
      <nav className="bottom-tabs">
        {tabItems.map((item) => (
          <button
            key={item.path}
            className={`tab-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* 사이드바 (햄버거 메뉴) */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
                   <div className="logo-section">
           <img 
             src={isDark ? "/logo.png" : "/logo-1.png"} 
             alt="YOY Wallet" 
             className="logo-image" 
           />
           <h2 className="logo-text">{t('app.name')}</h2>
         </div>
        </div>

        <div className="user-info">
          <div className="user-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.username} />
            ) : (
              <div className="avatar-placeholder">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
            )}
          </div>
          <div className="user-details">
            <h3>{user?.firstName} {user?.lastName}</h3>
            <p>@{user?.username}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.path}
              className="nav-item"
              onClick={() => {
                navigate(item.path);
                closeSidebar();
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          {user?.isAdmin && (
            <button
              className="nav-item admin-nav-item"
              onClick={() => {
                navigate('/admin');
                closeSidebar();
              }}
            >
              <FaShieldAlt />
              <span>관리자 패널</span>
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      {/* 모바일 오버레이 */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}
    </div>
  );
};

export default Layout;
