import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useAdmin } from '../contexts/AdminContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { FaQrcode, FaCamera, FaCheck, FaTimes, FaEdit, FaPaperPlane, FaDownload } from 'react-icons/fa';
import './History.css';

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'pending_receive' | 'pending_send';
  coin: string;
  amount: number;
  address: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed' | 'waiting_approval' | 'counter_offer';
  txHash?: string;
  fromAddress?: string;
  toAddress?: string;
  fee?: number;
  note?: string;
  counterOffer?: {
    amount: number;
    note: string;
    timestamp: string;
  };
}

interface QRCodeData {
  type: 'receive' | 'send';
  coin: string;
  amount: number;
  address: string;
  note?: string;
  timestamp: string;
  requestId?: string;
}

const History: React.FC = () => {
  const { user } = useAuth();
  const { currentAccount } = useWallet();
  const { adminCoins } = useAdmin();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<string>('YOY');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [counterOfferAmount, setCounterOfferAmount] = useState<string>('');
  const [counterOfferNote, setCounterOfferNote] = useState<string>('');

  // 실제 거래 내역 생성
  useEffect(() => {
    const generateTransactions = () => {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'receive',
          coin: 'YOY',
          amount: 1000,
          address: '0x1234...5678',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'completed',
          txHash: '0xabc123...def456',
          fromAddress: '0x1234...5678',
          toAddress: currentAccount?.address || '',
          fee: 0.001,
          note: '프로젝트 보상'
        },
        {
          id: '2',
          type: 'send',
          coin: 'ETH',
          amount: 0.5,
          address: '0x8765...4321',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'completed',
          txHash: '0xdef456...abc123',
          fromAddress: currentAccount?.address || '',
          toAddress: '0x8765...4321',
          fee: 0.005,
          note: '친구에게 전송'
        },
        {
          id: '3',
          type: 'pending_receive',
          coin: 'YOY',
          amount: 500,
          address: '0x9876...5432',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          status: 'waiting_approval',
          fromAddress: '0x9876...5432',
          toAddress: currentAccount?.address || '',
          note: '커뮤니티 보상'
        },
        {
          id: '4',
          type: 'pending_send',
          coin: 'BTC',
          amount: 0.1,
          address: '0x1111...2222',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          status: 'counter_offer',
          fromAddress: currentAccount?.address || '',
          toAddress: '0x1111...2222',
          note: '거래소 입금',
          counterOffer: {
            amount: 0.08,
            note: '수량 조정 요청',
            timestamp: new Date().toISOString()
          }
        }
      ];
      
      setTransactions(mockTransactions);
    };

    generateTransactions();
  }, [currentAccount]);

  // QR 코드 생성
  const generateReceiveQR = () => {
    if (!currentAccount?.address) return;
    
    const qrData: QRCodeData = {
      type: 'receive',
      coin: selectedCoin,
      amount: parseFloat(amount) || 0,
      address: currentAccount.address,
      note,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    };
    
    setQrData(qrData);
    setShowQRModal(true);
  };

  // QR 코드 스캔 (실제로는 카메라 연동)
  const handleQRScan = (qrText: string) => {
    try {
      const data: QRCodeData = JSON.parse(qrText);
      
      if (data.type === 'receive') {
        // 받기 요청 처리
        setSelectedTransaction({
          id: `pending_${Date.now()}`,
          type: 'pending_receive',
          coin: data.coin,
          amount: data.amount,
          address: data.address,
          timestamp: new Date().toISOString(),
          status: 'waiting_approval',
          fromAddress: data.address,
          toAddress: currentAccount?.address || '',
          note: data.note
        });
        setShowReceiveModal(true);
      } else if (data.type === 'send') {
        // 보내기 요청 처리
        setSelectedTransaction({
          id: `pending_${Date.now()}`,
          type: 'pending_send',
          coin: data.coin,
          amount: data.amount,
          address: data.address,
          timestamp: new Date().toISOString(),
          status: 'waiting_approval',
          fromAddress: currentAccount?.address || '',
          toAddress: data.address,
          note: data.note
        });
        setShowSendModal(true);
      }
    } catch (error) {
      console.error('QR 코드 파싱 실패:', error);
    }
  };

  // 거래 승인
  const approveTransaction = (transaction: Transaction) => {
    const updatedTransactions = transactions.map(t => 
      t.id === transaction.id 
        ? { ...t, status: 'completed' as const }
        : t
    );
    setTransactions(updatedTransactions);
    setShowReceiveModal(false);
    setShowSendModal(false);
  };

  // 거래 거절
  const rejectTransaction = (transaction: Transaction) => {
    const updatedTransactions = transactions.map(t => 
      t.id === transaction.id 
        ? { ...t, status: 'failed' as const }
        : t
    );
    setTransactions(updatedTransactions);
    setShowReceiveModal(false);
    setShowSendModal(false);
  };

  // 카운터 오퍼 제안
  const submitCounterOffer = () => {
    if (!selectedTransaction) return;
    
    const updatedTransaction: Transaction = {
      ...selectedTransaction,
      status: 'counter_offer',
      counterOffer: {
        amount: parseFloat(counterOfferAmount),
        note: counterOfferNote,
        timestamp: new Date().toISOString()
      }
    };
    
    const updatedTransactions = transactions.map(t => 
      t.id === selectedTransaction.id ? updatedTransaction : t
    );
    setTransactions(updatedTransactions);
    setShowCounterOfferModal(false);
    setCounterOfferAmount('');
    setCounterOfferNote('');
  };

  // 카운터 오퍼 수락
  const acceptCounterOffer = (transaction: Transaction) => {
    if (!transaction.counterOffer) return;
    
    const updatedTransaction: Transaction = {
      ...transaction,
      amount: transaction.counterOffer.amount,
      status: 'completed',
      note: transaction.counterOffer.note
    };
    
    const updatedTransactions = transactions.map(t => 
      t.id === transaction.id ? updatedTransaction : t
    );
    setTransactions(updatedTransactions);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return 'green';
      case 'pending': return 'orange';
      case 'failed': return 'red';
      case 'waiting_approval': return 'blue';
      case 'counter_offer': return 'purple';
      default: return 'gray';
    }
  };

  const getStatusText = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return '완료';
      case 'pending': return '처리중';
      case 'failed': return '실패';
      case 'waiting_approval': return '승인 대기';
      case 'counter_offer': return '수량 조정';
      default: return '알 수 없음';
    }
  };

  return (
    <div className="history">
      <div className="history-header">
        <h1>거래 내역</h1>
        <div className="history-actions">
          <button className="action-btn" onClick={() => setShowQRModal(true)}>
            <FaQrcode />
            <span>QR 받기</span>
          </button>
          <button className="action-btn" onClick={() => setShowReceiveModal(true)}>
            <FaCamera />
            <span>QR 스캔</span>
          </button>
        </div>
      </div>

      {/* 거래 내역 목록 */}
      <div className="transactions-list">
        {transactions.map((transaction) => (
          <div key={transaction.id} className={`transaction-item ${transaction.status}`}>
            <div className="transaction-icon">
              {transaction.type === 'receive' || transaction.type === 'pending_receive' ? (
                <FaCheck className="receive" />
              ) : (
                <FaPaperPlane className="send" />
              )}
            </div>
            
            <div className="transaction-details">
              <div className="transaction-main">
                <span className="transaction-type">
                  {transaction.type === 'receive' || transaction.type === 'pending_receive' ? '수신' : '송금'}
                </span>
                <span className="transaction-coin">{transaction.coin}</span>
                <span className="transaction-amount">
                  {transaction.amount.toLocaleString()} {transaction.coin}
                </span>
              </div>
              
              <div className="transaction-info">
                <div className="transaction-address">
                  {transaction.type === 'receive' || transaction.type === 'pending_receive' 
                    ? `From: ${formatAddress(transaction.fromAddress || '')}`
                    : `To: ${formatAddress(transaction.toAddress || '')}`
                  }
                </div>
                <div className="transaction-time">
                  {new Date(transaction.timestamp).toLocaleString('ko-KR')}
                </div>
                <div className={`transaction-status ${getStatusColor(transaction.status)}`}>
                  {getStatusText(transaction.status)}
                </div>
              </div>
              
              {transaction.note && (
                <div className="transaction-note">{transaction.note}</div>
              )}
              
              {transaction.status === 'waiting_approval' && (
                <div className="transaction-actions">
                  <button 
                    className="approve-btn"
                    onClick={() => approveTransaction(transaction)}
                  >
                    <FaCheck /> 승인
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => rejectTransaction(transaction)}
                  >
                    <FaTimes /> 거절
                  </button>
                  {transaction.type === 'pending_receive' && (
                    <button 
                      className="counter-offer-btn"
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        setShowCounterOfferModal(true);
                      }}
                    >
                      <FaEdit /> 수량 조정
                    </button>
                  )}
                </div>
              )}
              
              {transaction.status === 'counter_offer' && transaction.counterOffer && (
                <div className="counter-offer">
                  <div className="counter-offer-info">
                    <span>제안된 수량: {transaction.counterOffer.amount} {transaction.coin}</span>
                    <span>메모: {transaction.counterOffer.note}</span>
                  </div>
                  <div className="counter-offer-actions">
                    <button 
                      className="accept-btn"
                      onClick={() => acceptCounterOffer(transaction)}
                    >
                      <FaCheck /> 수락
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => rejectTransaction(transaction)}
                    >
                      <FaTimes /> 거절
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* QR 코드 모달 */}
      {showQRModal && (
        <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>QR 코드 생성</h3>
              <button className="close-btn" onClick={() => setShowQRModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="qr-form">
              <div className="form-group">
                <label>코인 선택</label>
                <select 
                  value={selectedCoin} 
                  onChange={(e) => setSelectedCoin(e.target.value)}
                >
                  {adminCoins.filter(coin => coin.isActive).map(coin => (
                    <option key={coin.symbol} value={coin.symbol}>
                      {coin.name} ({coin.symbol})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>받을 수량</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.000001"
                />
              </div>
              
              <div className="form-group">
                <label>메모 (선택사항)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="메모를 입력하세요"
                />
              </div>
              
              <button className="generate-qr-btn" onClick={generateReceiveQR}>
                <FaQrcode /> QR 코드 생성
              </button>
            </div>
            
            {qrData && (
              <div className="qr-display">
                <QRCode value={JSON.stringify(qrData)} size={200} />
                <button className="download-qr-btn">
                  <FaDownload /> QR 코드 저장
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 카운터 오퍼 모달 */}
      {showCounterOfferModal && selectedTransaction && (
        <div className="modal-overlay" onClick={() => setShowCounterOfferModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>수량 조정 제안</h3>
              <button className="close-btn" onClick={() => setShowCounterOfferModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="counter-offer-form">
              <div className="original-amount">
                원래 요청: {selectedTransaction.amount} {selectedTransaction.coin}
              </div>
              
              <div className="form-group">
                <label>제안할 수량</label>
                <input
                  type="number"
                  value={counterOfferAmount}
                  onChange={(e) => setCounterOfferAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.000001"
                />
              </div>
              
              <div className="form-group">
                <label>제안 메모</label>
                <textarea
                  value={counterOfferNote}
                  onChange={(e) => setCounterOfferNote(e.target.value)}
                  placeholder="수량 조정 이유를 설명하세요"
                  rows={3}
                />
              </div>
              
              <button className="submit-counter-offer-btn" onClick={submitCounterOffer}>
                <FaPaperPlane /> 제안 전송
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
