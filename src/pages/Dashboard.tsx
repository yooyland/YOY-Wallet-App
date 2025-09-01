import React, { useState, useEffect } from 'react';
import { FaBitcoin, FaEthereum, FaChartLine, FaArrowUp, FaArrowDown, FaPlus, FaStar, FaSearch } from 'react-icons/fa';
import { Coin, Transaction } from '../types';
import './Dashboard.css';
import { getErc20Balance } from '../services/eth';
import { getTokenPriceUSDByContract } from '../services/prices';
import { useWallet } from '../contexts/WalletContext';
import { useAdmin } from '../contexts/AdminContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { currentAccount } = useWallet();
  const { adminCoins } = useAdmin();
  const navigate = useNavigate();
  const [totalBalance, setTotalBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [selectedMarket, setSelectedMarket] = useState('USDT');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'price' | 'change24h' | 'volume'>('price');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [favorites, setFavorites] = useState<string[]>([]);

  // 관리자가 등록한 코인들을 사용
  const availableCoins: Coin[] = React.useMemo(() => 
    adminCoins
      .filter(coin => coin.isActive)
      .map(adminCoin => {
        // 실제 코인 심볼 매핑 또는 이미지 경로 반환
        const getCoinIcon = (symbol: string) => {
          switch (symbol.toUpperCase()) {
            case 'BTC': return '/assets/btc.png'; // 이미지 경로
            case 'ETH': return '/assets/eth.png'; // 이미지 경로
            case 'YOY': return '/assets/yoy.png'; // 이미지 경로
            case 'USDT': return '$';
            case 'USDC': return '$';
            case 'BNB': return 'B';
            case 'ADA': return 'A';
            case 'SOL': return 'S';
            case 'DOT': return 'D';
            case 'MATIC': return 'M';
            case 'LINK': return 'L';
            case 'UNI': return 'U';
            case 'AVAX': return 'A';
            case 'ATOM': return 'A';
            case 'LTC': return 'Ł';
            case 'XRP': return 'X';
            case 'DOGE': return 'Ð';
            case 'SHIB': return 'S';
            case 'XLM': return 'X';
            case 'XMR': return 'M';
            case 'TRX': return 'T';
            default: return symbol.charAt(0);
          }
        };

        // 실제 거래량 데이터 (시뮬레이션)
        const getMockVolume = (symbol: string) => {
          const volumeMap: { [key: string]: number } = {
            'BTC': 41214,
            'ETH': 25678,
            'YOY': 41214,
            'USDT': 150000,
            'USDC': 85000,
            'BNB': 32000,
            'ADA': 18000,
            'SOL': 28000,
            'DOT': 12000,
            'LINK': 22000,
            'XRP': 35000,
            'AVAX': 15000,
            'ATOM': 8000,
            'LTC': 12000,
            'TRX': 45000,
            'XLM': 10000,
            'XMR': 5000,
            'DOGE': 25000,
          };
          return volumeMap[symbol.toUpperCase()] || Math.floor(Math.random() * 50000) + 1000;
        };

        // 고정된 가격 데이터
        const getMockPrice = (symbol: string) => {
          const priceMap: { [key: string]: number } = {
            'BTC': 47500,
            'ETH': 3350,
            'YOY': 0.125,
            'USDT': 1.0,
            'USDC': 1.0,
            'BNB': 325,
            'ADA': 0.55,
            'SOL': 110,
            'DOT': 8.5,
            'LINK': 17.5,
            'XRP': 0.65,
            'AVAX': 35,
            'ATOM': 12,
            'LTC': 85,
            'TRX': 0.08,
            'XLM': 0.12,
            'XMR': 180,
            'DOGE': 0.15,
          };
          return priceMap[symbol.toUpperCase()] || 50;
        };

        const getMockChange = (symbol: string) => {
          const changeMap: { [key: string]: number } = {
            'BTC': 2.5,
            'ETH': -1.2,
            'YOY': 5.8,
            'USDT': 0.0,
            'USDC': 0.0,
            'BNB': 3.1,
            'ADA': -0.8,
            'SOL': 4.2,
            'DOT': 1.5,
            'LINK': -2.1,
            'XRP': 1.8,
            'AVAX': -0.5,
            'ATOM': 2.3,
            'LTC': -1.1,
            'TRX': 0.9,
            'XLM': -0.3,
            'XMR': 1.2,
            'DOGE': 3.5,
          };
          return changeMap[symbol.toUpperCase()] || 0;
        };

                    return {
              id: adminCoin.id,
              symbol: adminCoin.symbol,
              name: adminCoin.name,
              balance: getMockVolume(adminCoin.symbol), // 실제 거래량으로 변경
              price: getMockPrice(adminCoin.symbol),
              change24h: getMockChange(adminCoin.symbol),
              volume: getMockVolume(adminCoin.symbol),
              icon: adminCoin.logoUrl || getCoinIcon(adminCoin.symbol), // 로고 URL 우선 사용
            };
      }), [adminCoins]
  );

  // 기본 코인들 (관리자가 추가한 코인이 없을 때)
  const defaultCoins: Coin[] = [
    {
      id: 'yoy',
      symbol: 'YOY',
      name: 'YooY Land',
      balance: 41214,
      price: 0.125,
      change24h: 5.8,
      volume: 12000000,
      icon: '/assets/yoy.png',
    },
    {
      id: 'btc',
      symbol: 'BTC',
      name: 'Bitcoin',
      balance: 41214,
      price: 47500,
      change24h: 2.5,
      volume: 1410000000,
      icon: '/assets/btc.png',
    },
    {
      id: 'eth',
      symbol: 'ETH',
      name: 'Ethereum',
      balance: 25678,
      price: 3350,
      change24h: -1.2,
      volume: 890000000,
      icon: '/assets/eth.png',
    },
  ];

  // 관리자 등록 코인이 있으면 사용, 없으면 기본 코인 사용
  const coins = availableCoins.length > 0 ? availableCoins : defaultCoins;

  // 디버깅: 로고 URL 확인
  console.log('관리자 코인 데이터:', adminCoins);
  console.log('사용 가능한 코인:', availableCoins);
  console.log('최종 사용 코인:', coins);

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'receive',
      coin: 'BTC',
      amount: 0.1,
      fee: 0.001,
      status: 'completed',
      from: '0x1234...5678',
      to: '내 지갑',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      type: 'send',
      coin: 'ETH',
      amount: 1.5,
      fee: 0.005,
      status: 'completed',
      from: '내 지갑',
      to: '0x8765...4321',
      timestamp: new Date(Date.now() - 7200000),
    },
  ];

  useEffect(() => {
    // 총 잔액 계산 (코인 변경 시 갱신)
    const total = coins.reduce((sum, coin) => sum + coin.balance * coin.price, 0);
    setTotalBalance(total);
  }, [coins]);

  useEffect(() => {
    setRecentTransactions(mockTransactions);
  }, [mockTransactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (change: number) => {
    const isPositive = change >= 0;
    return (
      <span className={`change ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? <FaArrowUp /> : <FaArrowDown />}
        {Math.abs(change)}%
      </span>
    );
  };

  // 단위 축소 함수 (T, M, B)
  const formatNumber = (num: number): string => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  // 정렬 함수
  const handleSort = (field: 'price' | 'change24h' | 'volume') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // 필터링된 코인 목록
  const filteredCoins = coins
    .filter(coin => {
      if (searchQuery) {
        return coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortField) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'change24h':
          aValue = a.change24h;
          bValue = b.change24h;
          break;
        case 'volume':
          aValue = a.volume || 0;
          bValue = b.volume || 0;
          break;
        default:
          return 0;
      }
      
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

  // 즐겨찾기 토글
  const toggleFavorite = (coinId: string) => {
    setFavorites(prev => 
      prev.includes(coinId) 
        ? prev.filter(id => id !== coinId)
        : [...prev, coinId]
    );
  };

  // 마켓별 필터링
  const getMarketCoins = (market: string) => {
    if (market === 'MY') {
      return coins.filter(coin => coin.balance > 0);
    } else if (market === 'FAV') {
      return coins.filter(coin => favorites.includes(coin.id));
    } else {
      return coins; // 실제로는 마켓별 필터링 로직 필요
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>대시보드</h1>
        <p>암호화폐 자산 현황을 한눈에 확인하세요</p>
      </div>

      {/* 총 자산 요약 */}
      <div className="balance-summary">
        <div className="balance-card">
          <div className="balance-info">
            <h2>총 자산</h2>
            <div className="balance-amount">{formatCurrency(totalBalance)}</div>
            <p className="balance-change">+2.5% (24시간)</p>
          </div>
          <div className="balance-icon">
            <FaChartLine />
          </div>
        </div>
      </div>

      {/* 코인 목록 */}
      <div className="coins-section">
        <div className="section-title-row">
          <h2>보유 자산</h2>
          <button className="add-coin-btn" onClick={() => navigate('/admin')}>
            <FaPlus />
            <span>관리자 페이지</span>
          </button>
        </div>
        <div className="coins-grid">
          {coins.map((coin) => (
            <div key={coin.id} className="coin-card">
                               <div className="coin-header">
                <div className="coin-icon">
                  {coin.icon && coin.icon.startsWith('http') ? (
                    // URL이 http로 시작하면 이미지로 표시 (업비트 로고 또는 업로드된 로고)
                    <img src={coin.icon} alt={coin.symbol} className="coin-image-icon" />
                  ) : typeof coin.icon === 'string' && coin.icon.startsWith('/assets/') ? (
                    // 로컬 assets 폴더의 이미지
                    <img src={coin.icon} alt={coin.symbol} className="coin-image-icon" />
                  ) : (
                    // 텍스트 심볼
                    <span className="coin-text-icon">{coin.icon}</span>
                  )}
                </div>
                   <div className="coin-info">
                     <h3>{coin.name}</h3>
                     <p>{coin.symbol}</p>
                   </div>
                   <div className="coin-change">
                     {formatPercentage(coin.change24h)}
                   </div>
                 </div>
                             <div className="coin-balance">
                 <div className="balance-details">
                   <span className="balance-amount">{coin.balance.toLocaleString()} {coin.symbol}</span>
                   <span className="balance-value">{formatCurrency(coin.balance * coin.price)}</span>
                 </div>
                 <div className="coin-price">{formatCurrency(coin.price)}</div>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* 최근 거래 내역 */}
      <div className="transactions-section">
        <h2>최근 거래 내역</h2>
        <div className="transactions-list">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-icon">
                {transaction.type === 'receive' ? (
                  <FaArrowUp className="receive" />
                ) : (
                  <FaArrowDown className="send" />
                )}
              </div>
              <div className="transaction-details">
                <div className="transaction-main">
                  <span className="transaction-type">
                    {transaction.type === 'receive' ? '수신' : '송금'}
                  </span>
                  <span className="transaction-coin">{transaction.coin}</span>
                </div>
                <div className="transaction-amount">
                  {transaction.amount} {transaction.coin}
                </div>
                <div className="transaction-address">
                  {transaction.type === 'receive' ? 'From: ' : 'To: '}
                  {transaction.type === 'receive' ? transaction.from : transaction.to}
                </div>
              </div>
              <div className="transaction-status">
                <span className={`status ${transaction.status}`}>
                  {transaction.status === 'completed' ? '완료' : 
                   transaction.status === 'pending' ? '처리중' : '실패'}
                </span>
                <span className="transaction-time">
                  {transaction.timestamp.toLocaleString('ko-KR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="quick-actions">
        <h2>빠른 액션</h2>
        <div className="actions-grid">
          <button className="action-btn">
            <FaBitcoin />
            <span>코인 구매</span>
          </button>
          <button className="action-btn">
            <FaEthereum />
            <span>코인 전송</span>
          </button>
          <button className="action-btn">
            <FaChartLine />
            <span>거래 내역</span>
          </button>
        </div>
      </div>

      {/* 코인 마켓 섹션 */}
      <div className="coin-market-section">
        <div className="market-header">
          <div className="search-bar">
            <input
              type="text"
              placeholder="검색: BTC, YOY ...."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn">
              <FaSearch />
            </button>
          </div>
          <div className="market-tabs">
            {['KRW', 'ETH', 'BTC', 'BSC', 'USDT', 'MY', 'FAV'].map((market) => (
              <button
                key={market}
                className={`market-tab ${selectedMarket === market ? 'active' : ''}`}
                onClick={() => setSelectedMarket(market)}
              >
                {market}
              </button>
            ))}
          </div>
        </div>

        <div className="market-table">
          <div className="table-header">
            <div className="th market-col">
              <span>Coin/Market</span>
            </div>
            <div className="th price-col" onClick={() => handleSort('price')}>
              <span>현재가</span>
              {sortField === 'price' && (
                <span className="sort-indicator">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>
            <div className="th change-col" onClick={() => handleSort('change24h')}>
              <span>전일대비</span>
              {sortField === 'change24h' && (
                <span className="sort-indicator">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>
            <div className="th volume-col" onClick={() => handleSort('volume')}>
              <span>거래금액</span>
              {sortField === 'volume' && (
                <span className="sort-indicator">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>
          </div>
          
          <div className="table-body">
            {filteredCoins.map((coin) => (
              <div key={coin.id} className="table-row">
                <div className="td market-col">
                  <div className="coin-info">
                    <button 
                      className={`favorite-btn ${favorites.includes(coin.id) ? 'active' : ''}`}
                      onClick={() => toggleFavorite(coin.id)}
                    >
                      <FaStar />
                    </button>
                                         <div className="coin-icon">
                       {typeof coin.icon === 'string' && coin.icon.startsWith('/assets/') ? (
                         <img src={coin.icon} alt={coin.symbol} className="coin-image-icon" />
                       ) : (
                         <span className="coin-text-icon">{coin.icon}</span>
                       )}
                     </div>
                    <div className="coin-details">
                      <span className="coin-name">{coin.name}</span>
                      <span className="coin-symbol">{coin.symbol} . {coin.symbol}/{selectedMarket}</span>
                    </div>
                  </div>
                </div>
                <div className="td price-col">
                  <span className="price-value">{formatNumber(coin.price)}</span>
                </div>
                <div className="td change-col">
                  <div className={`change-value ${coin.change24h >= 0 ? 'positive' : 'negative'}`}>
                    {coin.change24h >= 0 ? (
                      <FaArrowUp className="change-icon" />
                    ) : (
                      <FaArrowDown className="change-icon" />
                    )}
                    {Math.abs(coin.change24h).toFixed(2)}
                  </div>
                </div>
                <div className="td volume-col">
                  <span className="volume-value">{formatNumber(coin.volume || 0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

