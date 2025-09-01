import React, { useState, useEffect } from 'react';
import { FaHistory, FaSearch, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { Transaction } from '../types';
import './History.css';

const History: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    // 목업 거래 내역 데이터
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'receive',
        coin: 'BTC',
        amount: 0.5,
        from: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        to: '내 지갑',
        timestamp: new Date('2024-01-15T10:30:00'),
        status: 'completed',
        hash: '0x123...abc',
        fee: 0.0001
      },
      {
        id: '2',
        type: 'send',
        coin: 'ETH',
        amount: 2.5,
        from: '내 지갑',
        to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        timestamp: new Date('2024-01-14T15:45:00'),
        status: 'completed',
        hash: '0x456...def',
        fee: 0.002
      },
      {
        id: '3',
        type: 'receive',
        coin: 'YOY',
        amount: 1000,
        from: '0x999...yoy',
        to: '내 지갑',
        timestamp: new Date('2024-01-13T09:20:00'),
        status: 'completed',
        hash: '0x789...ghi',
        fee: 0.01
      },
      {
        id: '4',
        type: 'send',
        coin: 'BTC',
        amount: 0.25,
        from: '내 지갑',
        to: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
        timestamp: new Date('2024-01-12T14:15:00'),
        status: 'pending',
        hash: '0xabc...123',
        fee: 0.0001
      },
      {
        id: '5',
        type: 'receive',
        coin: 'ETH',
        amount: 1.8,
        from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        to: '내 지갑',
        timestamp: new Date('2024-01-11T11:00:00'),
        status: 'failed',
        hash: '0xdef...456',
        fee: 0.002
      }
    ];

    setTransactions(mockTransactions);
    setFilteredTransactions(mockTransactions);
  }, []);

  useEffect(() => {
    let filtered = transactions;

    // 타입 필터
    if (filterType !== 'all') {
      filtered = filtered.filter(tx => tx.type === filterType);
    }

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.coin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.hash?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'amount':
          return b.amount - a.amount;
        case 'coin':
          return a.coin.localeCompare(b.coin);
        default:
          return 0;
      }
    });

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, filterType, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'failed': return '#f44336';
      default: return '#cccccc';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '완료';
      case 'pending': return '대기중';
      case 'failed': return '실패';
      default: return status;
    }
  };

  return (
    <div className="history">
      <div className="history-header">
        <h1>
          <FaHistory />
          거래내역
        </h1>
        <p>모든 거래 내역을 확인하고 관리하세요</p>
      </div>

      <div className="history-content">
        {/* 필터 및 검색 */}
        <div className="history-controls">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="코인명, 주소, 해시로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">전체</option>
              <option value="send">전송</option>
              <option value="receive">수신</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">날짜순</option>
              <option value="amount">금액순</option>
              <option value="coin">코인순</option>
            </select>
          </div>
        </div>

        {/* 거래 목록 */}
        <div className="transactions-list">
          {filteredTransactions.length === 0 ? (
            <div className="no-transactions">
              <FaHistory />
              <p>거래 내역이 없습니다</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-icon">
                  {transaction.type === 'send' ? (
                    <FaArrowUp className="send-icon" />
                  ) : (
                    <FaArrowDown className="receive-icon" />
                  )}
                </div>

                <div className="transaction-details">
                  <div className="transaction-main">
                    <div className="transaction-type-coin">
                      <span className="transaction-type">
                        {transaction.type === 'send' ? '전송' : '수신'}
                      </span>
                      <span className="transaction-coin">{transaction.coin}</span>
                    </div>
                    <div className="transaction-amount">
                      <span className={`amount ${transaction.type}`}>
                        {transaction.type === 'send' ? '-' : '+'}
                        {transaction.amount} {transaction.coin}
                      </span>
                    </div>
                  </div>

                  <div className="transaction-meta">
                    <div className="transaction-info">
                      <span className="transaction-address">
                        {transaction.type === 'send' ? 
                          `To: ${transaction.to.slice(0, 10)}...${transaction.to.slice(-8)}` :
                          `From: ${transaction.from.slice(0, 10)}...${transaction.from.slice(-8)}`
                        }
                      </span>
                      <span className="transaction-time">
                        {transaction.timestamp.toLocaleDateString('ko-KR')} {transaction.timestamp.toLocaleTimeString('ko-KR')}
                      </span>
                    </div>
                    <div className="transaction-status-fee">
                      <span 
                        className="transaction-status"
                        style={{ color: getStatusColor(transaction.status) }}
                      >
                        {getStatusText(transaction.status)}
                      </span>
                      <span className="transaction-fee">
                        수수료: {transaction.fee} {transaction.coin}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 페이지네이션 (향후 구현) */}
        <div className="pagination">
          <button disabled>이전</button>
          <span>1 / 1</span>
          <button disabled>다음</button>
        </div>
      </div>
    </div>
  );
};

export default History;
