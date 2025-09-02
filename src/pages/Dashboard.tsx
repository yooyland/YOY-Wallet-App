import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useAdmin } from '../contexts/AdminContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { getRealTimePrices, CoinPrice } from '../services/prices';
import { FaStar, FaStar as FaStarSolid, FaPlus, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import './Dashboard.css';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  change24h: number;
  volume: number;
  icon: string;
  isFavorite?: boolean;
}

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap';
  coin: string;
  amount: number;
  address: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  txHash?: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { currentAccount } = useWallet();
  const { adminCoins } = useAdmin();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [activeMarket, setActiveMarket] = useState<'KRW' | 'ETH' | 'BTC' | 'BSC' | 'USDT' | 'MY' | 'FAV'>('KRW');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'change' | 'volume'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [realTimePrices, setRealTimePrices] = useState<CoinPrice[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  // 모의 데이터 함수들 (useMemo 이전에 정의)
  const getMockBalance = (symbol: string) => {
    const balanceMap: { [key: string]: number } = {
      'BTC': 0.5,
      'ETH': 2.5,
      'YOY': 41214,
      'USDT': 1000,
      'USDC': 500,
      'BNB': 10,
      'ADA': 5000,
      'SOL': 100,
      'DOT': 200,
      'LINK': 50,
      'XRP': 10000,
      'AVAX': 50,
      'ATOM': 100,
      'LTC': 20,
      'TRX': 10000,
      'XLM': 5000,
      'XMR': 5,
      'DOGE': 10000,
    };
    return balanceMap[symbol.toUpperCase()] || Math.random() * 1000;
  };

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

  const getMockVolume = (symbol: string) => {
    const volumeMap: { [key: string]: number } = {
      'BTC': 25000000000,
      'ETH': 15000000000,
      'YOY': 5000000,
      'USDT': 50000000000,
      'USDC': 2000000000,
      'BNB': 800000000,
      'ADA': 500000000,
      'SOL': 2000000000,
      'DOT': 300000000,
      'LINK': 800000000,
      'XRP': 2000000000,
      'AVAX': 400000000,
      'ATOM': 200000000,
      'LTC': 300000000,
      'TRX': 800000000,
      'XLM': 200000000,
      'XMR': 100000000,
      'DOGE': 600000000,
    };
    return volumeMap[symbol.toUpperCase()] || 100000000;
  };

  const getCoinIcon = (symbol: string) => {
    // 특정 코인에 대해서는 이미지 파일 사용
    if (['BTC', 'ETH', 'YOY'].includes(symbol.toUpperCase())) {
      return `/assets/${symbol.toLowerCase()}.png`;
    }
    // 나머지는 텍스트 심볼
    return symbol;
  };

  // 코인 심볼을 CoinGecko ID로 변환
  const getCoinGeckoId = (symbol: string): string => {
    const idMap: { [key: string]: string } = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'USDT': 'tether',
      'USDC': 'usd-coin',
      'BNB': 'binancecoin',
      'ADA': 'cardano',
      'SOL': 'solana',
      'DOT': 'polkadot',
      'LINK': 'chainlink',
      'XRP': 'ripple',
      'AVAX': 'avalanche-2',
      'ATOM': 'cosmos',
      'LTC': 'litecoin',
      'TRX': 'tron',
      'XLM': 'stellar',
      'XMR': 'monero',
      'DOGE': 'dogecoin',
    };
    
    return idMap[symbol.toUpperCase()] || symbol.toLowerCase();
  };

  // 실제 가격 데이터 가져오기
  useEffect(() => {
    const fetchPrices = async () => {
      if (adminCoins.length === 0) return;
      
      setIsLoadingPrices(true);
      try {
        const coinIds = adminCoins
          .filter(coin => coin.isActive)
          .map(coin => getCoinGeckoId(coin.symbol));
        
        const prices = await getRealTimePrices(coinIds);
        setRealTimePrices(prices);
      } catch (error) {
        console.error('가격 데이터 가져오기 실패:', error);
      } finally {
        setIsLoadingPrices(false);
      }
    };

    fetchPrices();
    
    // 30초마다 가격 업데이트
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [adminCoins]);

  // 실제 가격 데이터를 사용한 코인 목록
  const availableCoins: Coin[] = useMemo(() => {
    return adminCoins
      .filter(coin => coin.isActive)
      .map(adminCoin => {
        const priceData = realTimePrices.find(p => p.symbol.toUpperCase() === adminCoin.symbol);
        
        return {
          id: adminCoin.id,
          symbol: adminCoin.symbol,
          name: adminCoin.name,
          balance: getMockBalance(adminCoin.symbol), // 실제로는 지갑에서 가져와야 함
          price: priceData?.current_price || getMockPrice(adminCoin.symbol),
          change24h: priceData?.price_change_percentage_24h || getMockChange(adminCoin.symbol),
          volume: priceData?.total_volume || getMockVolume(adminCoin.symbol),
          icon: adminCoin.logoUrl || getCoinIcon(adminCoin.symbol),
          isFavorite: favorites.includes(adminCoin.symbol)
        };
      });
  }, [adminCoins, realTimePrices, favorites]);



  // 총 잔액 계산
  useEffect(() => {
    const total = availableCoins.reduce((sum, coin) => sum + coin.balance * coin.price, 0);
    setTotalBalance(total);
  }, [availableCoins]);

  // 최근 거래 내역 (모의 데이터)
  useEffect(() => {
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'receive',
        coin: 'BTC',
        amount: 0.1,
        address: '0x1234...5678',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'completed',
      },
      {
        id: '2',
        type: 'send',
        coin: 'ETH',
        amount: 1.5,
        address: '0x8765...4321',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: 'completed',
      },
    ];
    setRecentTransactions(mockTransactions);
  }, []);

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
        {isPositive ? <FaSortUp /> : <FaSortDown />}
        {Math.abs(change).toFixed(2)}%
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
  const handleSort = (field: 'price' | 'change' | 'volume') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // 필터링된 코인 목록
  const filteredCoins = availableCoins
    .filter(coin => {
      if (searchTerm) {
        return coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               coin.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'change':
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
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
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
      return availableCoins.filter(coin => coin.balance > 0);
    } else if (market === 'FAV') {
      return availableCoins.filter(coin => favorites.includes(coin.symbol));
    } else {
      return availableCoins; // 실제로는 마켓별 필터링 로직 필요
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
            {/* FaChartLine 대신 다른 아이콘 사용 */}
            <FaSort />
          </div>
        </div>
      </div>

      {/* 코인 목록 */}
      <div className="coins-section">
        <div className="section-title-row">
          <h2>보유 자산</h2>
          {/* 관리자 버튼 - 관리자 권한이 있는 경우에만 표시 */}
          {user?.isAdmin && (
            <div className="admin-section">
              <button className="add-coin-btn" onClick={() => navigate('/admin')}>
                <FaPlus />
                <span>관리자 페이지</span>
              </button>
            </div>
          )}
        </div>
        <div className="coins-grid">
          {availableCoins.map((coin) => (
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
                  <FaSortUp className="receive" />
                ) : (
                  <FaSortDown className="send" />
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
                  {transaction.address}
                </div>
              </div>
              <div className="transaction-status">
                <span className={`status ${transaction.status}`}>
                  {transaction.status === 'completed' ? '완료' : 
                   transaction.status === 'pending' ? '처리중' : '실패'}
                </span>
                <span className="transaction-time">
                  {new Date(transaction.timestamp).toLocaleString('ko-KR')}
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
            {/* FaBitcoin 대신 다른 아이콘 사용 */}
            <FaPlus />
            <span>코인 구매</span>
          </button>
          <button className="action-btn">
            {/* FaEthereum 대신 다른 아이콘 사용 */}
            <FaSort />
            <span>코인 전송</span>
          </button>
          <button className="action-btn">
            {/* FaChartLine 대신 다른 아이콘 사용 */}
            <FaSort />
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-btn">
              <FaSearch />
            </button>
          </div>
          <div className="market-tabs">
            {['KRW', 'ETH', 'BTC', 'BSC', 'USDT', 'MY', 'FAV'].map((market) => (
              <button
                key={market}
                className={`market-tab ${activeMarket === market ? 'active' : ''}`}
                onClick={() => setActiveMarket(market as 'KRW' | 'ETH' | 'BTC' | 'BSC' | 'USDT' | 'MY' | 'FAV')}
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
              {sortBy === 'price' && (
                <span className="sort-indicator">
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>
            <div className="th change-col" onClick={() => handleSort('change')}>
              <span>전일대비</span>
              {sortBy === 'change' && (
                <span className="sort-indicator">
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>
            <div className="th volume-col" onClick={() => handleSort('volume')}>
              <span>거래금액</span>
              {sortBy === 'volume' && (
                <span className="sort-indicator">
                  {sortOrder === 'asc' ? '↑' : '↓'}
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
                      className={`favorite-btn ${favorites.includes(coin.symbol) ? 'active' : ''}`}
                      onClick={() => toggleFavorite(coin.symbol)}
                    >
                      {favorites.includes(coin.symbol) ? <FaStarSolid /> : <FaStar />}
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
                      <span className="coin-symbol">{coin.symbol} . {coin.symbol}/{activeMarket}</span>
                    </div>
                  </div>
                </div>
                <div className="td price-col">
                  <span className="price-value">{formatNumber(coin.price)}</span>
                </div>
                <div className="td change-col">
                  <div className={`change-value ${coin.change24h >= 0 ? 'positive' : 'negative'}`}>
                    {coin.change24h >= 0 ? (
                      <FaSortUp className="change-icon" />
                    ) : (
                      <FaSortDown className="change-icon" />
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

