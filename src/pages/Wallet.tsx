import React, { useState, useEffect } from 'react';
import { FaPlus, FaQrcode, FaCopy, FaPaperPlane, FaKey, FaWallet, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';
import { Coin } from '../types';
import { useWallet } from '../contexts/WalletContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAdmin } from '../contexts/AdminContext';
import './Wallet.css';

interface CoinWallet {
  coinId: string;
  coinSymbol: string;
  coinName: string;
  address: string;
  privateKey: string;
  balance: string;
  network: string;
}

const Wallet: React.FC = () => {
  const { wallet, currentAccount, isWalletSetup, createWallet, restoreWallet, selectAccount, addAccount } = useWallet();
  const { t } = useLanguage();
  const { adminCoins } = useAdmin();
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showWalletSetup, setShowWalletSetup] = useState(!isWalletSetup);
  const [showCreateWallet, setShowCreateWallet] = useState(false);
  const [showRestoreWallet, setShowRestoreWallet] = useState(false);
  const [mnemonic, setMnemonic] = useState('');
  const [restoreMnemonic, setRestoreMnemonic] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendToAddress, setSendToAddress] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [coinWallets, setCoinWallets] = useState<CoinWallet[]>([]);
  const [walletCreated, setWalletCreated] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // 관리자가 추가한 활성 코인들을 사용
  const availableCoins: Coin[] = adminCoins
    .filter(coin => coin.isActive)
    .map(adminCoin => ({
      id: adminCoin.id,
      symbol: adminCoin.symbol,
      name: adminCoin.name,
      balance: Math.random() * 1000, // 실제로는 지갑에서 가져와야 함
      price: Math.random() * 1000, // 실제로는 API에서 가져와야 함
      change24h: (Math.random() - 0.5) * 20, // 실제로는 API에서 가져와야 함
      icon: adminCoin.symbol.charAt(0),
    }));

  // 기본 코인들 (관리자가 추가한 코인이 없을 때)
  const defaultCoins: Coin[] = [
    {
      id: 'yoy',
      symbol: 'YOY',
      name: 'YooY Land',
      balance: 1000,
      price: 0.1,
      change24h: 5.8,
      icon: 'Y',
    },
  ];

  const coins = availableCoins.length > 0 ? availableCoins : defaultCoins;

  const walletAddress = currentAccount?.address || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';

  // 지갑 생성 시 코인별 주소 생성
  const generateCoinWallets = async (baseMnemonic: string) => {
    const { ethers } = await import('ethers');
    
    const hdNode = ethers.HDNodeWallet.fromPhrase(baseMnemonic);
    const newCoinWallets: CoinWallet[] = [];

    // 각 코인별로 다른 경로를 사용하여 주소 생성
    coins.forEach((coin, index) => {
      const derivationPath = `m/44'/60'/0'/0/${index}`; // BIP-44 표준
      const account = hdNode.derivePath(derivationPath);
      
      newCoinWallets.push({
        coinId: coin.id,
        coinSymbol: coin.symbol,
        coinName: coin.name,
        address: account.address,
        privateKey: account.privateKey,
        balance: '0.00',
        network: coin.symbol === 'YOY' ? 'Ethereum Mainnet' : 'Ethereum Mainnet'
      });
    });

    setCoinWallets(newCoinWallets);
    setWalletCreated(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleSend = (coin: Coin) => {
    setSelectedCoin(coin);
    setShowSendModal(true);
  };

  const handleReceive = (coin: Coin) => {
    setSelectedCoin(coin);
    setShowReceiveModal(true);
  };

  const handleCreateWallet = async () => {
    try {
      const newMnemonic = await createWallet();
      setMnemonic(newMnemonic);
      await generateCoinWallets(newMnemonic);
      setShowCreateWallet(false);
      setShowWalletSetup(false);
    } catch (error) {
      console.error('지갑 생성 실패:', error);
    }
  };

  const handleRestoreWallet = async () => {
    try {
      await restoreWallet(restoreMnemonic);
      await generateCoinWallets(restoreMnemonic);
      setShowRestoreWallet(false);
      setShowWalletSetup(false);
    } catch (error) {
      console.error('지갑 복구 실패:', error);
    }
  };

  const handleAddAccount = async () => {
    try {
      await addAccount();
    } catch (error) {
      console.error('계정 추가 실패:', error);
    }
  };

  const handleSendTransaction = async () => {
    if (!currentAccount || !selectedCoin) return;
    
    try {
      setSendLoading(true);
      
      // 실제 전송 로직 구현
      // const INFURA_ID = process.env.REACT_APP_INFURA_ID;
      // const rpc = `https://mainnet.infura.io/v3/${INFURA_ID}`;
      // const signer = createSigner(currentAccount.privateKey, rpc);
      // const tx = await sendToken(signer, selectedCoin.contract, sendToAddress, sendAmount);
      
      alert('전송 기능은 개발 중입니다. 실제 전송을 위해서는 추가 보안 설정이 필요합니다.');
      
      setShowSendModal(false);
      setSendAmount('');
      setSendToAddress('');
    } catch (error) {
      console.error('전송 실패:', error);
      alert('전송에 실패했습니다.');
    } finally {
      setSendLoading(false);
    }
  };

  // 지갑이 이미 생성되어 있는지 확인
  useEffect(() => {
    if (isWalletSetup && wallet?.mnemonic) {
      generateCoinWallets(wallet.mnemonic);
    }
  }, [isWalletSetup, wallet]);

  return (
    <div className="wallet">
      <div className="wallet-header">
        <h1>{t('wallet.title')}</h1>
        <p>{t('wallet.description')}</p>
      </div>

      {/* 지갑 설정이 안된 경우 */}
      {showWalletSetup && (
        <div className="wallet-setup">
          <div className="setup-card">
            <h2>{t('wallet.setup.title')}</h2>
            <p>{t('wallet.setup.description')}</p>
            <div className="setup-actions">
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateWallet(true)}
              >
                <FaWallet />
                {t('wallet.setup.create')}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowRestoreWallet(true)}
              >
                <FaKey />
                {t('wallet.setup.restore')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 지갑 생성 모달 */}
      {showCreateWallet && (
        <div className="modal-overlay" onClick={() => setShowCreateWallet(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('wallet.create.title')}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCreateWallet(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <p>{t('wallet.create.warning')}</p>
              <button 
                className="btn btn-primary"
                onClick={handleCreateWallet}
              >
                {t('wallet.create.generate')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 니모닉 표시 모달 */}
      {mnemonic && (
        <div className="modal-overlay" onClick={() => setMnemonic('')}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('wallet.mnemonic.title')}</h3>
              <button 
                className="modal-close"
                onClick={() => setMnemonic('')}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <p>{t('wallet.mnemonic.warning')}</p>
              <div className="mnemonic-display">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowMnemonic(!showMnemonic)}
                >
                  {showMnemonic ? <FaEyeSlash /> : <FaEye />}
                  {showMnemonic ? t('wallet.mnemonic.hide') : t('wallet.mnemonic.show')}
                </button>
                {showMnemonic && (
                  <div className="mnemonic-text">
                    {mnemonic}
                  </div>
                )}
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => setMnemonic('')}
              >
                {t('wallet.mnemonic.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 지갑 복구 모달 */}
      {showRestoreWallet && (
        <div className="modal-overlay" onClick={() => setShowRestoreWallet(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('wallet.restore.title')}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowRestoreWallet(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>{t('wallet.restore.mnemonic')}</label>
                <textarea
                  value={restoreMnemonic}
                  onChange={(e) => setRestoreMnemonic(e.target.value)}
                  placeholder={t('wallet.restore.placeholder')}
                  rows={4}
                />
              </div>
              <button 
                className="btn btn-primary"
                onClick={handleRestoreWallet}
                disabled={!restoreMnemonic.trim()}
              >
                {t('wallet.restore.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 지갑이 설정된 경우 */}
      {isWalletSetup && (
        <>
          {/* 지갑 주소 */}
          <div className="wallet-address-section">
            <div className="address-card">
              <div className="address-info">
                <h3>{t('wallet.address.title')}</h3>
                <div className="address-display">
                  <span className="address-text">{walletAddress}</span>
                  <button className="copy-btn" onClick={() => copyAddress(walletAddress)}>
                    {copiedAddress === walletAddress ? <FaCheck /> : <FaCopy />}
                  </button>
                </div>
                <p className="address-note">
                  {t('wallet.address.note')}
                </p>
              </div>
              <div className="address-actions">
                <button className="btn btn-secondary">
                  <FaQrcode />
                  {t('wallet.address.qr')}
                </button>
                <button className="btn btn-secondary" onClick={handleAddAccount}>
                  <FaPlus />
                  {t('wallet.address.addAccount')}
                </button>
              </div>
            </div>
          </div>

          {/* 계정 선택 */}
          {wallet && wallet.accounts.length > 1 && (
            <div className="accounts-section">
              <div className="section-header">
                <h2>{t('wallet.accounts.title')}</h2>
              </div>
              <div className="accounts-list">
                {wallet.accounts.map((account, index) => (
                  <div 
                    key={index}
                    className={`account-item ${currentAccount?.index === index ? 'active' : ''}`}
                    onClick={() => selectAccount(index)}
                  >
                    <span className="account-index">계정 {index + 1}</span>
                    <span className="account-address">{account.address.slice(0, 6)}...{account.address.slice(-4)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 코인별 지갑 주소 리스트 */}
          {walletCreated && coinWallets.length > 0 && (
            <div className="coin-wallets-section">
              <div className="section-header">
                <h2>코인별 지갑 주소</h2>
                <p>각 코인별로 생성된 고유 지갑 주소입니다</p>
              </div>
              <div className="coin-wallets-list">
                {coinWallets.map((coinWallet) => (
                  <div key={coinWallet.coinId} className="coin-wallet-item">
                    <div className="coin-wallet-header">
                      <div className="coin-info">
                        <div className="coin-icon">{coinWallet.coinSymbol.charAt(0)}</div>
                        <div className="coin-details">
                          <h3>{coinWallet.coinName}</h3>
                          <p>{coinWallet.coinSymbol}</p>
                        </div>
                      </div>
                      <div className="network-badge">
                        {coinWallet.network}
                      </div>
                    </div>
                    <div className="wallet-address-info">
                      <div className="address-row">
                        <span className="address-label">지갑 주소:</span>
                        <div className="address-display">
                          <span className="address-text">{coinWallet.address}</span>
                          <button 
                            className="copy-btn" 
                            onClick={() => copyAddress(coinWallet.address)}
                          >
                            {copiedAddress === coinWallet.address ? <FaCheck /> : <FaCopy />}
                          </button>
                        </div>
                      </div>
                      <div className="balance-row">
                        <span className="balance-label">잔액:</span>
                        <span className="balance-amount">{coinWallet.balance} {coinWallet.coinSymbol}</span>
                      </div>
                    </div>
                    <div className="wallet-actions">
                      <button 
                        className="btn btn-secondary"
                        onClick={() => handleSend({ id: coinWallet.coinId, symbol: coinWallet.coinSymbol, name: coinWallet.coinName, balance: parseFloat(coinWallet.balance), price: 0, change24h: 0, icon: coinWallet.coinSymbol.charAt(0) })}
                      >
                        <FaPaperPlane />
                        전송
                      </button>
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleReceive({ id: coinWallet.coinId, symbol: coinWallet.coinSymbol, name: coinWallet.coinName, balance: parseFloat(coinWallet.balance), price: 0, change24h: 0, icon: coinWallet.coinSymbol.charAt(0) })}
                      >
                        <FaQrcode />
                        받기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 코인 목록 */}
          <div className="coins-section">
            <div className="section-header">
              <h2>보유 자산</h2>
              <button className="btn btn-primary">
                <FaPlus />
                코인 추가
              </button>
            </div>

            <div className="coins-list">
              {coins.map((coin) => (
                <div key={coin.id} className="coin-item">
                  <div className="coin-info">
                    <div className="coin-icon">{coin.icon}</div>
                    <div className="coin-details">
                      <h3>{coin.name}</h3>
                      <p>{coin.symbol}</p>
                    </div>
                    <div className="coin-balance">
                      <div className="balance-amount">{coin.balance} {coin.symbol}</div>
                      <div className="balance-value">{formatCurrency(coin.balance * coin.price)}</div>
                    </div>
                  </div>
                  <div className="coin-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleSend(coin)}
                    >
                      <FaPaperPlane />
                      전송
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleReceive(coin)}
                    >
                      <FaQrcode />
                      받기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 전송 모달 */}
      {showSendModal && selectedCoin && (
        <div className="modal-overlay" onClick={() => setShowSendModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedCoin.name} 전송</h3>
              <button 
                className="modal-close"
                onClick={() => setShowSendModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>받는 주소</label>
                <input 
                  type="text" 
                  placeholder="지갑 주소를 입력하세요"
                  value={sendToAddress}
                  onChange={(e) => setSendToAddress(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>전송 수량</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                />
                <span className="balance-info">
                  보유: {selectedCoin.balance} {selectedCoin.symbol}
                </span>
              </div>
              <div className="form-group">
                <label>수수료</label>
                <input type="text" value="0.001" readOnly />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowSendModal(false)}>
                취소
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSendTransaction}
                disabled={sendLoading || !sendToAddress.trim() || !sendAmount.trim()}
              >
                {sendLoading ? '전송 중...' : '전송'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 받기 모달 */}
      {showReceiveModal && selectedCoin && (
        <div className="modal-overlay" onClick={() => setShowReceiveModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedCoin.name} 받기</h3>
              <button 
                className="modal-close"
                onClick={() => setShowReceiveModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="qr-section">
                <div className="qr-placeholder">
                  <FaQrcode />
                  <p>QR 코드</p>
                </div>
              </div>
              <div className="address-section">
                <label>지갑 주소</label>
                <div className="address-display">
                  <span className="address-text">{walletAddress}</span>
                  <button className="copy-btn" onClick={() => copyAddress(walletAddress)}>
                    {copiedAddress === walletAddress ? <FaCheck /> : <FaCopy />}
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowReceiveModal(false)}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
