import React, { useState } from 'react';
import { FaWallet, FaPlus, FaDownload, FaUpload, FaKey, FaShieldAlt, FaQrcode, FaCoins } from 'react-icons/fa';
import './Wallet.css';

const Wallet: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'recover' | 'deposit' | 'withdraw'>('overview');
  const [walletName, setWalletName] = useState('');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedCoin, setSelectedCoin] = useState('YOY');

  const mockWallets = [
    {
      id: '1',
      name: '메인 지갑',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      balance: '1,250.50 YOY',
      network: 'Ethereum',
      isActive: true
    },
    {
      id: '2',
      name: '거래용 지갑',
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      balance: '500.00 YOY',
      network: 'Ethereum',
      isActive: true
    }
  ];

  const handleCreateWallet = () => {
    if (walletName.trim()) {
      // 지갑 생성 로직 구현
      console.log('지갑 생성:', walletName);
      setWalletName('');
      setActiveTab('overview');
    }
  };

  const handleRecoverWallet = () => {
    if (seedPhrase.trim()) {
      // 지갑 복구 로직 구현
      console.log('지갑 복구:', seedPhrase);
      setSeedPhrase('');
      setActiveTab('overview');
    }
  };

  const handleDeposit = () => {
    if (depositAmount && selectedCoin) {
      // 입금 로직 구현
      console.log('입금:', depositAmount, selectedCoin);
      setDepositAmount('');
    }
  };

  const handleWithdraw = () => {
    if (withdrawAmount && selectedCoin) {
      // 출금 로직 구현
      console.log('출금:', withdrawAmount, selectedCoin);
      setWithdrawAmount('');
    }
  };

  const renderOverview = () => (
    <div className="overview-section">
      <div className="wallets-summary">
        <h3>내 지갑 요약</h3>
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-icon">
              <FaWallet />
            </div>
            <div className="card-content">
              <h4>전체 지갑</h4>
              <span className="card-value">{mockWallets.length}개</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="card-icon">
              <FaCoins />
            </div>
            <div className="card-content">
              <h4>총 잔액</h4>
              <span className="card-value">1,750.50 YOY</span>
            </div>
          </div>
        </div>
      </div>

      <div className="wallets-list">
        <h3>지갑 목록</h3>
        {mockWallets.map(wallet => (
          <div key={wallet.id} className="wallet-item">
            <div className="wallet-info">
              <h4>{wallet.name}</h4>
              <p className="wallet-address">{wallet.address}</p>
              <p className="wallet-network">{wallet.network}</p>
            </div>
            <div className="wallet-balance">
              <span className="balance-amount">{wallet.balance}</span>
              <span className={`status-badge ${wallet.isActive ? 'active' : 'inactive'}`}>
                {wallet.isActive ? '활성' : '비활성'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="quick-actions">
        <h3>빠른 액션</h3>
        <div className="action-buttons">
          <button 
            className="action-button primary"
            onClick={() => setActiveTab('create')}
          >
            <FaPlus />
            새 지갑 생성
          </button>
          <button 
            className="action-button secondary"
            onClick={() => setActiveTab('recover')}
          >
            <FaDownload />
            지갑 복구
          </button>
        </div>
      </div>
    </div>
  );

  const renderCreateWallet = () => (
    <div className="create-wallet-section">
      <h3>새 지갑 생성</h3>
      <div className="form-group">
        <label>지갑 이름</label>
        <input
          type="text"
          placeholder="지갑 이름을 입력하세요"
          value={walletName}
          onChange={(e) => setWalletName(e.target.value)}
          className="form-input"
        />
      </div>
      
      <div className="security-info">
        <h4>보안 정보</h4>
        <ul>
          <li>12단어 시드 구문이 생성됩니다</li>
          <li>시드 구문을 안전한 곳에 백업하세요</li>
          <li>절대 다른 사람과 공유하지 마세요</li>
        </ul>
      </div>

      <div className="form-actions">
        <button 
          className="action-button secondary"
          onClick={() => setActiveTab('overview')}
        >
          취소
        </button>
        <button 
          className="action-button primary"
          onClick={handleCreateWallet}
          disabled={!walletName.trim()}
        >
          지갑 생성
        </button>
      </div>
    </div>
  );

  const renderRecoverWallet = () => (
    <div className="recover-wallet-section">
      <h3>지갑 복구</h3>
      <div className="form-group">
        <label>시드 구문</label>
        <textarea
          placeholder="12단어 시드 구문을 입력하세요"
          value={seedPhrase}
          onChange={(e) => setSeedPhrase(e.target.value)}
          className="form-textarea"
          rows={3}
        />
      </div>
      
      <div className="security-warning">
        <FaShieldAlt />
        <p>시드 구문은 안전한 환경에서 입력하세요</p>
      </div>

      <div className="form-actions">
        <button 
          className="action-button secondary"
          onClick={() => setActiveTab('overview')}
        >
          취소
        </button>
        <button 
          className="action-button primary"
          onClick={handleRecoverWallet}
          disabled={!seedPhrase.trim()}
        >
          지갑 복구
        </button>
      </div>
    </div>
  );

  const renderDeposit = () => (
    <div className="deposit-section">
      <h3>입금</h3>
      <div className="form-group">
        <label>입금할 코인</label>
        <select
          value={selectedCoin}
          onChange={(e) => setSelectedCoin(e.target.value)}
          className="form-select"
        >
          <option value="YOY">YOY</option>
          <option value="ETH">ETH</option>
          <option value="USDT">USDT</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>입금 주소</label>
        <div className="address-display">
          <span className="address-text">0x1234567890abcdef1234567890abcdef12345678</span>
          <button className="copy-button">
            <FaQrcode />
          </button>
        </div>
      </div>

      <div className="deposit-info">
        <h4>입금 안내</h4>
        <ul>
          <li>위 주소로 {selectedCoin}을 전송하세요</li>
          <li>네트워크 수수료가 발생할 수 있습니다</li>
          <li>입금 확인에는 몇 분이 소요됩니다</li>
        </ul>
      </div>

      <div className="form-actions">
        <button 
          className="action-button secondary"
          onClick={() => setActiveTab('overview')}
        >
          돌아가기
        </button>
      </div>
    </div>
  );

  const renderWithdraw = () => (
    <div className="withdraw-section">
      <h3>출금</h3>
      <div className="form-group">
        <label>출금할 코인</label>
        <select
          value={selectedCoin}
          onChange={(e) => setSelectedCoin(e.target.value)}
          className="form-select"
        >
          <option value="YOY">YOY</option>
          <option value="ETH">ETH</option>
          <option value="USDT">USDT</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>출금 주소</label>
        <input
          type="text"
          placeholder="출금할 주소를 입력하세요"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>출금 수량</label>
        <input
          type="number"
          placeholder="출금할 수량을 입력하세요"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="form-actions">
        <button 
          className="action-button secondary"
          onClick={() => setActiveTab('overview')}
        >
          취소
        </button>
        <button 
          className="action-button primary"
          onClick={handleWithdraw}
          disabled={!withdrawAmount || !withdrawAmount.trim()}
        >
          출금
        </button>
      </div>
    </div>
  );

  return (
    <div className="wallet-page">
      <div className="page-header">
        <h1>지갑 관리</h1>
        <p>지갑 생성, 복구, 입출금을 관리하세요</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FaWallet />
          개요
        </button>
        <button
          className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          <FaPlus />
          생성
        </button>
        <button
          className={`tab-button ${activeTab === 'recover' ? 'active' : ''}`}
          onClick={() => setActiveTab('recover')}
        >
          <FaDownload />
          복구
        </button>
        <button
          className={`tab-button ${activeTab === 'deposit' ? 'active' : ''}`}
          onClick={() => setActiveTab('deposit')}
        >
          <FaUpload />
          입금
        </button>
        <button
          className={`tab-button ${activeTab === 'withdraw' ? 'active' : ''}`}
          onClick={() => setActiveTab('withdraw')}
        >
          <FaKey />
          출금
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="tab-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'create' && renderCreateWallet()}
        {activeTab === 'recover' && renderRecoverWallet()}
        {activeTab === 'deposit' && renderDeposit()}
        {activeTab === 'withdraw' && renderWithdraw()}
      </div>
    </div>
  );
};

export default Wallet;
