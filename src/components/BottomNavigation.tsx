import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaWallet, 
  FaPaperPlane, 
  FaDownload, 
  FaCoins, 
  FaComments 
} from 'react-icons/fa';
import './BottomNavigation.css';

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const bottomNavItems = [
    {
      id: 'wallet',
      label: 'Wallet',
      icon: <FaWallet />,
      path: '/wallet',
      description: '지갑 생성/복구, 입금, 출금'
    },
    {
      id: 'sent',
      label: 'Sent',
      icon: <FaPaperPlane />,
      path: '/sent',
      description: '코인 보내기, QR 작성, 히스토리'
    },
    {
      id: 'receive',
      label: 'Receive',
      icon: <FaDownload />,
      path: '/receive',
      description: '내 지갑 주소 리스트'
    },
    {
      id: 'coins',
      label: 'Coins',
      icon: <FaCoins />,
      path: '/coins',
      description: '코인 마켓 리스트'
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: <FaComments />,
      path: '/chat',
      description: '사용자 채팅 공간'
    }
  ];

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  const isActiveTab = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bottom-navigation">
      {bottomNavItems.map((item) => (
        <div
          key={item.id}
          className={`nav-item ${isActiveTab(item.path) ? 'active' : ''}`}
          onClick={() => handleTabClick(item.path)}
          title={item.description}
        >
          <div className="nav-icon">
            {item.icon}
          </div>
          <span className="nav-label">{item.label}</span>
        </div>
      ))}
    </nav>
  );
};

export default BottomNavigation;
