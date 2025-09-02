import React, { useState, useEffect } from 'react';
import { FaCoins, FaSearch, FaStar, FaChartLine, FaInfoCircle, FaExternalLinkAlt } from 'react-icons/fa';
import './Coins.css';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCap: number;
  volume24h: number;
  image: string;
  rank: number;
  sparklineData: number[];
}

const Coins: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [sortBy, setSortBy] = useState<'rank' | 'price' | 'change' | 'marketCap'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const mockCoins: Coin[] = [
    {
      id: 'yoy',
      symbol: 'YOY',
      name: 'YooY Land',
      currentPrice: 0.85,
      priceChange24h: 0.12,
      priceChangePercentage24h: 16.47,
      marketCap: 85000000,
      volume24h: 2500000,
      image: 'https://via.placeholder.com/32x32/ffd700/000000?text=Y',
      rank: 1,
      sparklineData: [0.73, 0.75, 0.78, 0.82, 0.79, 0.85]
    },
    {
      id: 'bitcoin',
      symbol: 'BTC',
      name: 'Bitcoin',
      currentPrice: 43250.50,
      priceChange24h: -1250.30,
      priceChangePercentage24h: -2.81,
      marketCap: 850000000000,
      volume24h: 25000000000,
      image: 'https://via.placeholder.com/32x32/f7931a/ffffff?text=B',
      rank: 2,
      sparklineData: [44500, 44200, 43800, 43500, 43000, 43250]
    },
    {
      id: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      currentPrice: 2650.75,
      priceChange24h: 45.25,
      priceChangePercentage24h: 1.74,
      marketCap: 320000000000,
      volume24h: 15000000000,
      image: 'https://via.placeholder.com/32x32/627eea/ffffff?text=E',
      rank: 3,
      sparklineData: [2605, 2610, 2620, 2630, 2640, 2650]
    },
    {
      id: 'usdt',
      symbol: 'USDT',
      name: 'Tether',
      currentPrice: 1.00,
      priceChange24h: 0.00,
      priceChangePercentage24h: 0.00,
      marketCap: 95000000000,
      volume24h: 50000000000,
      image: 'https://via.placeholder.com/32x32/26a17b/ffffff?text=U',
      rank: 4,
      sparklineData: [1.00, 1.00, 1.00, 1.00, 1.00, 1.00]
    }
  ];

  useEffect(() => {
    setCoins(mockCoins);
  }, []);

  const filteredAndSortedCoins = coins
    .filter(coin =>
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortBy) {
        case 'rank':
          aValue = a.rank;
          bValue = b.rank;
          break;
        case 'price':
          aValue = a.currentPrice;
          bValue = b.currentPrice;
          break;
        case 'change':
          aValue = Math.abs(a.priceChangePercentage24h);
          bValue = Math.abs(b.priceChangePercentage24h);
          break;
        case 'marketCap':
          aValue = a.marketCap;
          bValue = b.marketCap;
          break;
        default:
          aValue = a.rank;
          bValue = b.rank;
      }

      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  const formatPrice = (price: number): string => {
    if (price >= 1000) return price.toLocaleString('ko-KR');
    return price.toFixed(4);
  };

  const handleSort = (field: 'rank' | 'price' | 'change' | 'marketCap') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const openCoinDetail = (coin: Coin) => {
    setSelectedCoin(coin);
  };

  const closeCoinDetail = () => {
    setSelectedCoin(null);
  };

  return (
    <div className="coins-page">
      <div className="page-header">
        <h1>코인 마켓</h1>
        <p>실시간 암호화폐 시장 정보를 확인하세요</p>
      </div>

      {/* 검색 및 정렬 */}
      <div className="controls-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="코인 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="sort-controls">
          <span>정렬:</span>
          <button
            className={`sort-button ${sortBy === 'rank' ? 'active' : ''}`}
            onClick={() => handleSort('rank')}
          >
            순위 {sortBy === 'rank' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            className={`sort-button ${sortBy === 'price' ? 'active' : ''}`}
            onClick={() => handleSort('price')}
          >
            가격 {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            className={`sort-button ${sortBy === 'change' ? 'active' : ''}`}
            onClick={() => handleSort('change')}
          >
            변동 {sortBy === 'change' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            className={`sort-button ${sortBy === 'marketCap' ? 'active' : ''}`}
            onClick={() => handleSort('marketCap')}
          >
            시가총액 {sortBy === 'marketCap' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* 코인 목록 */}
      <div className="coins-list">
        <div className="list-header">
          <div className="header-rank">#</div>
          <div className="header-coin">코인</div>
          <div className="header-price">가격</div>
          <div className="header-change">24h 변동</div>
          <div className="header-market-cap">시가총액</div>
          <div className="header-volume">거래량</div>
          <div className="header-chart">차트</div>
        </div>

        {filteredAndSortedCoins.map((coin) => (
          <div
            key={coin.id}
            className="coin-item"
            onClick={() => openCoinDetail(coin)}
          >
            <div className="coin-rank">#{coin.rank}</div>
            <div className="coin-info">
              <img src={coin.image} alt={coin.name} className="coin-icon" />
              <div className="coin-details">
                <span className="coin-name">{coin.name}</span>
                <span className="coin-symbol">{coin.symbol}</span>
              </div>
            </div>
            <div className="coin-price">${formatPrice(coin.currentPrice)}</div>
            <div className={`coin-change ${coin.priceChangePercentage24h >= 0 ? 'positive' : 'negative'}`}>
              {coin.priceChangePercentage24h >= 0 ? '+' : ''}{coin.priceChangePercentage24h.toFixed(2)}%
            </div>
            <div className="coin-market-cap">${formatNumber(coin.marketCap)}</div>
            <div className="coin-volume">${formatNumber(coin.volume24h)}</div>
            <div className="coin-chart">
              <FaChartLine />
            </div>
          </div>
        ))}
      </div>

      {/* 코인 상세 정보 모달 */}
      {selectedCoin && (
        <div className="coin-detail-modal" onClick={closeCoinDetail}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="coin-header-info">
                <img src={selectedCoin.image} alt={selectedCoin.name} className="modal-coin-icon" />
                <div>
                  <h2>{selectedCoin.name} ({selectedCoin.symbol})</h2>
                  <span className="coin-rank">#{selectedCoin.rank} 순위</span>
                </div>
              </div>
              <button className="close-button" onClick={closeCoinDetail}>×</button>
            </div>

            <div className="modal-body">
              <div className="price-section">
                <div className="current-price">
                  ${formatPrice(selectedCoin.currentPrice)}
                </div>
                <div className={`price-change ${selectedCoin.priceChangePercentage24h >= 0 ? 'positive' : 'negative'}`}>
                  {selectedCoin.priceChangePercentage24h >= 0 ? '+' : ''}{selectedCoin.priceChangePercentage24h.toFixed(2)}%
                  <span className="change-amount">
                    ({selectedCoin.priceChange24h >= 0 ? '+' : ''}${formatPrice(selectedCoin.priceChange24h)})
                  </span>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-item">
                  <label>시가총액</label>
                  <span>${formatNumber(selectedCoin.marketCap)}</span>
                </div>
                <div className="stat-item">
                  <label>24h 거래량</label>
                  <span>${formatNumber(selectedCoin.volume24h)}</span>
                </div>
                <div className="stat-item">
                  <label>순환 공급량</label>
                  <span>{formatNumber(selectedCoin.marketCap / selectedCoin.currentPrice)} {selectedCoin.symbol}</span>
                </div>
              </div>

              <div className="actions-section">
                <button className="action-button primary">
                  <FaStar />
                  관심 코인 추가
                </button>
                <button className="action-button secondary">
                  <FaInfoCircle />
                  상세 정보
                </button>
                <button className="action-button secondary">
                  <FaExternalLinkAlt />
                  차트 보기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coins;
