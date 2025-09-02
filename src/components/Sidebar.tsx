import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSecurity } from '../contexts/SecurityContext';
import { 
  FaTimes, 
  FaHome, 
  FaWallet, 
  FaExchangeAlt, 
  FaCog, 
  FaUser, 
  FaShieldAlt,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaPalette,
  FaLanguage,
  FaBell,
  FaLock,
  FaKey,
  FaQrcode,
  FaHistory,
  FaAddressBook,
  FaCoins,
  FaComments,
  FaHeadset,
  FaEnvelope
} from 'react-icons/fa';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { securitySettings } = useSecurity();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  const menuItems = [
    {
      id: 'home',
      label: '홈',
      icon: <FaHome />,
      path: '/',
      description: '메인 대시보드'
    },
    {
      id: 'wallet',
      label: '지갑',
      icon: <FaWallet />,
      path: '/wallet',
      description: '지갑 관리'
    },
    {
      id: 'exchange',
      label: '거래소',
      icon: <FaExchangeAlt />,
      path: '/exchange',
      description: '코인 거래'
    },
    {
      id: 'profile',
      label: '프로필',
      icon: <FaUser />,
      path: '/profile',
      description: '사용자 프로필'
    }
  ];

  const settingsItems = [
    {
      id: 'settings',
      label: '설정',
      icon: <FaCog />,
      path: '/settings',
      description: '앱 설정'
    },
    {
      id: 'security',
      label: '보안 설정',
      icon: <FaShieldAlt />,
      path: '/security',
      description: 'PIN, 생체인증 설정'
    },
    {
      id: 'notifications',
      label: '알림 설정',
      icon: <FaBell />,
      path: '/notifications',
      description: '알림 관리'
    },
    {
      id: 'appearance',
      label: '외관 설정',
      icon: <FaPalette />,
      path: '/appearance',
      description: '테마 및 언어 설정'
    },
    {
      id: 'privacy',
      label: '개인정보',
      icon: <FaLock />,
      path: '/privacy',
      description: '개인정보 관리'
    },
    {
      id: 'customer-support',
      label: '고객센터',
      icon: <FaHeadset />,
      path: '/customer-support',
      description: '고객 지원'
    },
    {
      id: 'feedback',
      label: '의견 보내기',
      icon: <FaEnvelope />,
      path: '/feedback',
      description: '피드백 및 제안'
    }
  ];

  const quickActions = [
    {
      id: 'qr-code',
      label: 'QR 코드 생성',
      icon: <FaQrcode />,
      action: () => handleNavigation('/qr-generator'),
      description: 'QR 코드 생성'
    },
    {
      id: 'history',
      label: '거래 내역',
      icon: <FaHistory />,
      action: () => handleNavigation('/history'),
      description: '거래 내역 보기'
    },
    {
      id: 'address-book',
      label: '주소록',
      icon: <FaAddressBook />,
      action: () => handleNavigation('/address-book'),
      description: '주소록 관리'
    }
  ];

  // 관리자 메뉴 (관리자만 표시)
  const adminItems = [
    {
      id: 'admin',
      label: '관리자 메뉴',
      icon: <FaShieldAlt />,
      path: '/adminpage',
      description: '시스템 관리'
    }
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="user-info">
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt="Profile" className="user-avatar" />
          ) : (
            <div className="user-avatar-placeholder">
              {user?.firstName ? user.firstName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="user-details">
            <h3>{user?.firstName} {user?.lastName}</h3>
            <p>{user?.email}</p>
          </div>
        </div>
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <div className="sidebar-content">
        {/* 메인 메뉴 */}
        <div className="menu-section">
          <h4>메인 메뉴</h4>
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
              title={item.description}
            >
              <div className="menu-icon">{item.icon}</div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* 설정 메뉴 */}
        <div className="menu-section">
          <h4>설정</h4>
          {settingsItems.map((item) => (
            <div
              key={item.id}
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
              title={item.description}
            >
              <div className="menu-icon">{item.icon}</div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* 빠른 액션 */}
        <div className="menu-section">
          <h4>빠른 액션</h4>
          {quickActions.map((item) => (
            <div
              key={item.id}
              className="menu-item"
              onClick={item.action}
              title={item.description}
            >
              <div className="menu-icon">{item.icon}</div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* 관리자 메뉴 (관리자만 표시) */}
        {user?.isAdmin && (
          <div className="menu-section">
            <h4>관리자</h4>
            {adminItems.map((item) => (
              <div
                key={item.id}
                className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
                title={item.description}
              >
                <div className="menu-icon">{item.icon}</div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* 테마 토글 */}
        <div className="menu-section">
          <h4>테마</h4>
          <div className="menu-item" onClick={toggleTheme}>
            <div className="menu-icon">
              {isDark ? <FaSun /> : <FaMoon />}
            </div>
            <span>{isDark ? '라이트 모드' : '다크 모드'}</span>
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>로그아웃</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
