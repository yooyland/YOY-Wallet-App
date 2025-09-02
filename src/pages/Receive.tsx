import React, { useState } from 'react';
import { FaDownload, FaCopy, FaShare, FaQrcode, FaPlus, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Receive.css';

const Receive: React.FC = () => {
  const [showPrivateKey, setShowPrivateKey] = useState<{ [key: string]: boolean }>({});
  const [selectedNetwork, setSelectedNetwork] = useState('Ethereum');

  const mockWallets = [
    {
      id: '1',
      name: '메인 지갑',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      network: 'Ethereum',
      balance: '1,250.50 YOY',
      isActive: true,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: '거래용 지갑',
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      network: 'Ethereum',
      balance: '500.00 YOY',
      isActive: true,
      createdAt: '2024-02-01'
    },
    {
      id: '3',
      name: '저축 지갑',
      address: '0x9876543210fedcba9876543210fedcba98765432',
      network: 'BSC',
      balance: '2,000.00 YOY',
      isActive: true,
      createdAt: '2024-03-10'
    }
  ];

  const networks = [
    { id: 'Ethereum', name: 'Ethereum', icon: '🔵' },
    { id: 'BSC', name: 'BSC', icon: '🟡' },
    { id: 'Polygon', name: 'Polygon', icon: '🟣' },
    { id: 'Arbitrum', name: 'Arbitrum', icon: '🔴' }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // 토스트 메시지 표시
    console.log('주소가 클립보드에 복사되었습니다:', text);
  };

  const shareAddress = (address: string, name: string) => {
    if (navigator.share) {
      navigator.share({
        title: `${name} 지갑 주소`,
        text: `지갑 주소: ${address}`,
        url: `https://etherscan.io/address/${address}`
      });
    } else {
      copyToClipboard(address);
    }
  };

  const togglePrivateKey = (walletId: string) => {
    setShowPrivateKey(prev => ({
      ...prev,
      [walletId]: !prev[walletId]
    }));
  };

  const filteredWallets = mockWallets.filter(wallet => 
    selectedNetwork === 'all' || wallet.network === selectedNetwork
  );

  return (
    <div className="receive-page">
      <div className="page-header">
        <h1>내 지갑 주소</h1>
        <p>지갑 주소를 확인하고 공유하세요</p>
      </div>

      {/* 네트워크 필터 */}
      <div className="network-filter">
        <h3>네트워크 선택</h3>
        <div className="network-buttons">
          <button
            className={`network-button ${selectedNetwork === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedNetwork('all')}
          >
            🌐 전체
          </button>
          {networks.map(network => (
            <button
              key={network.id}
              className={`network-button ${selectedNetwork === network.id ? 'active' : ''}`}
              onClick={() => setSelectedNetwork(network.id)}
            >
              {network.icon} {network.name}
            </button>
          ))}
        </div>
      </div>

      {/* 지갑 목록 */}
      <div className="wallets-section">
        <div className="section-header">
          <h3>지갑 목록</h3>
          <button className="add-wallet-button">
            <FaPlus />
            새 지갑 추가
          </button>
        </div>

        <div className="wallets-grid">
          {filteredWallets.map(wallet => (
            <div key={wallet.id} className="wallet-card">
              <div className="wallet-header">
                <div className="wallet-info">
                  <h4>{wallet.name}</h4>
                  <span className={`network-badge ${wallet.network.toLowerCase()}`}>
                    {wallet.network}
                  </span>
                </div>
                <div className="wallet-status">
                  <span className={`status-dot ${wallet.isActive ? 'active' : 'inactive'}`}></span>
                </div>
              </div>

              <div className="wallet-address">
                <label>지갑 주소</label>
                <div className="address-display">
                  <span className="address-text">{wallet.address}</span>
                  <button
                    className="copy-button"
                    onClick={() => copyToClipboard(wallet.address)}
                    title="주소 복사"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>

              <div className="wallet-balance">
                <label>잔액</label>
                <span className="balance-amount">{wallet.balance}</span>
              </div>

              <div className="wallet-actions">
                <button
                  className="action-button primary"
                  onClick={() => shareAddress(wallet.address, wallet.name)}
                  title="주소 공유"
                >
                  <FaShare />
                  공유
                </button>
                <button
                  className="action-button secondary"
                  onClick={() => togglePrivateKey(wallet.id)}
                  title="개인키 표시/숨김"
                >
                  {showPrivateKey[wallet.id] ? <FaEyeSlash /> : <FaEye />}
                  개인키
                </button>
                <button
                  className="action-button secondary"
                  title="QR 코드 보기"
                >
                  <FaQrcode />
                  QR
                </button>
              </div>

              {/* 개인키 표시 (보안 주의) */}
              {showPrivateKey[wallet.id] && (
                <div className="private-key-section">
                  <div className="security-warning">
                    ⚠️ 보안 주의: 개인키는 절대 공유하지 마세요!
                  </div>
                  <div className="private-key-display">
                    <label>개인키</label>
                    <div className="private-key-text">
                      <span>0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef</span>
                      <button
                        className="copy-button"
                        onClick={() => copyToClipboard('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')}
                        title="개인키 복사"
                      >
                        <FaCopy />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="wallet-footer">
                <span className="created-date">생성일: {wallet.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="quick-actions">
        <h3>빠른 액션</h3>
        <div className="action-buttons">
          <button className="quick-action-button">
            <FaDownload />
            주소 내보내기
          </button>
          <button className="quick-action-button">
            <FaQrcode />
            QR 코드 생성
          </button>
          <button className="quick-action-button">
            <FaShare />
            전체 공유
          </button>
        </div>
      </div>

      {/* 보안 팁 */}
      <div className="security-tips">
        <h3>🔒 보안 팁</h3>
        <ul>
          <li>개인키는 절대 다른 사람과 공유하지 마세요</li>
          <li>지갑 주소는 안전하게 공유할 수 있습니다</li>
          <li>정기적으로 백업을 확인하세요</li>
          <li>의심스러운 링크나 앱을 피하세요</li>
        </ul>
      </div>
    </div>
  );
};

export default Receive;
