import React, { useState } from 'react';
import { FaPaperPlane, FaQrcode, FaHistory, FaCopy, FaDownload } from 'react-icons/fa';
import './Sent.css';

const Sent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'send' | 'qr' | 'history'>('send');
  const [sendData, setSendData] = useState({
    to: '',
    amount: '',
    coin: 'YOY',
    note: ''
  });

  const [qrData, setQrData] = useState({
    address: '',
    amount: '',
    coin: 'YOY',
    message: ''
  });

  const handleSend = () => {
    // 송금 로직 구현
    console.log('송금 데이터:', sendData);
  };

  const generateQR = () => {
    // QR 코드 생성 로직 구현
    console.log('QR 데이터:', qrData);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // 토스트 메시지 표시
  };

  const mockTransactions = [
    {
      id: '1',
      type: 'send',
      to: '0x1234...5678',
      amount: '100 YOY',
      coin: 'YOY',
      status: 'confirmed',
      date: '2024-12-19 14:30',
      txHash: '0xabcd...efgh'
    },
    {
      id: '2',
      type: 'send',
      to: '0x8765...4321',
      amount: '50 YOY',
      coin: 'YOY',
      status: 'pending',
      date: '2024-12-19 13:15',
      txHash: '0xdcba...hgfe'
    }
  ];

  return (
    <div className="sent-page">
      <div className="page-header">
        <h1>송금 관리</h1>
        <p>코인을 보내고, QR 코드를 생성하고, 거래 내역을 확인하세요</p>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'send' ? 'active' : ''}`}
          onClick={() => setActiveTab('send')}
        >
          <FaPaperPlane />
          코인 보내기
        </button>
        <button
          className={`tab-button ${activeTab === 'qr' ? 'active' : ''}`}
          onClick={() => setActiveTab('qr')}
        >
          <FaQrcode />
          QR 작성
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <FaHistory />
          히스토리
        </button>
      </div>

      <div className="tab-content">
        {/* 코인 보내기 탭 */}
        {activeTab === 'send' && (
          <div className="send-tab">
            <div className="form-card">
              <h3>코인 보내기</h3>
              <div className="form-group">
                <label>받는 주소</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={sendData.to}
                  onChange={(e) => setSendData({ ...sendData, to: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>수량</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={sendData.amount}
                  onChange={(e) => setSendData({ ...sendData, amount: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>코인</label>
                <div className="coin-selector">
                  <select
                    value={sendData.coin}
                    onChange={(e) => setSendData({ ...sendData, coin: e.target.value })}
                  >
                    <option value="YOY">YOY</option>
                    <option value="ETH">ETH</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>메모 (선택사항)</label>
                <input
                  type="text"
                  placeholder="메모를 입력하세요"
                  value={sendData.note}
                  onChange={(e) => setSendData({ ...sendData, note: e.target.value })}
                />
              </div>
              <button className="send-button" onClick={handleSend}>
                <FaPaperPlane />
                코인 보내기
              </button>
            </div>
          </div>
        )}

        {/* QR 작성 탭 */}
        {activeTab === 'qr' && (
          <div className="qr-tab">
            <div className="form-card">
              <h3>QR 코드 생성</h3>
              <div className="form-group">
                <label>지갑 주소</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={qrData.address}
                  onChange={(e) => setQrData({ ...qrData, address: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>요청 수량</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={qrData.amount}
                  onChange={(e) => setQrData({ ...qrData, amount: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>코인</label>
                <div className="coin-selector">
                  <select
                    value={qrData.coin}
                    onChange={(e) => setQrData({ ...qrData, coin: e.target.value })}
                  >
                    <option value="YOY">YOY</option>
                    <option value="ETH">ETH</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>메시지 (선택사항)</label>
                <input
                  type="text"
                  placeholder="메시지를 입력하세요"
                  value={qrData.message}
                  onChange={(e) => setQrData({ ...qrData, message: e.target.value })}
                />
              </div>
              <button className="qr-button" onClick={generateQR}>
                <FaQrcode />
                QR 코드 생성
              </button>
            </div>

            {/* QR 코드 미리보기 */}
            <div className="qr-preview">
              <h4>QR 코드 미리보기</h4>
              <div className="qr-code-placeholder">
                <FaQrcode size={120} />
                <p>QR 코드가 여기에 표시됩니다</p>
              </div>
              <div className="qr-info">
                <p><strong>주소:</strong> {qrData.address || '입력 필요'}</p>
                <p><strong>수량:</strong> {qrData.amount || '0'} {qrData.coin}</p>
                <p><strong>메시지:</strong> {qrData.message || '없음'}</p>
              </div>
            </div>
          </div>
        )}

        {/* 히스토리 탭 */}
        {activeTab === 'history' && (
          <div className="history-tab">
            <div className="history-header">
              <h3>송금 내역</h3>
              <button className="export-button">
                <FaDownload />
                내보내기
              </button>
            </div>
            <div className="transactions-list">
              {mockTransactions.map((tx) => (
                <div key={tx.id} className={`transaction-item ${tx.status}`}>
                  <div className="transaction-icon">
                    <FaPaperPlane />
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-main">
                      <span className="transaction-amount">{tx.amount}</span>
                      <span className="transaction-status">{tx.status}</span>
                    </div>
                    <div className="transaction-sub">
                      <span className="transaction-to">To: {tx.to}</span>
                      <span className="transaction-date">{tx.date}</span>
                    </div>
                  </div>
                  <div className="transaction-actions">
                    <button
                      className="copy-button"
                      onClick={() => copyToClipboard(tx.txHash)}
                      title="트랜잭션 해시 복사"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sent;
