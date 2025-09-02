import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useAdmin } from '../contexts/AdminContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getMarketChart, MarketData } from '../services/prices';
import { FaChartLine, FaArrowUp, FaArrowDown, FaDollarSign, FaCoins, FaExchangeAlt } from 'react-icons/fa';
import './Analytics.css';

interface AnalyticsData {
  totalValue: number;
  totalChange24h: number;
  totalChange7d: number;
  totalChange30d: number;
  portfolioDistribution: { coin: string; percentage: number; value: number }[];
  tradingVolume: { date: string; volume: number }[];
  topPerformers: { coin: string; change: number; value: number }[];
  worstPerformers: { coin: string; change: number; value: number }[];
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const { currentAccount } = useWallet();
  const { adminCoins } = useAdmin();
  const { t } = useLanguage();
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<MarketData | null>(null);

  // 실제 분석 데이터 생성
  useEffect(() => {
    const generateAnalyticsData = async () => {
      setIsLoading(true);
      
      try {
        // 실제 포트폴리오 데이터 계산
        const portfolioValue = adminCoins
          .filter(coin => coin.isActive)
          .reduce((total, coin) => {
            const balance = getMockBalance(coin.symbol);
            const price = getMockPrice(coin.symbol);
            return total + (balance * price);
          }, 0);

        // 포트폴리오 분포 계산
        const distribution = adminCoins
          .filter(coin => coin.isActive)
          .map(coin => {
            const balance = getMockBalance(coin.symbol);
            const price = getMockPrice(coin.symbol);
            const value = balance * price;
            return {
              coin: coin.symbol,
              percentage: (value / portfolioValue) * 100,
              value
            };
          })
          .sort((a, b) => b.value - a.value);

        // 거래량 데이터 (모의)
        const tradingVolume = Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          volume: Math.random() * 1000000 + 100000
        }));

        // 성과자/실패자 계산
        const performers = adminCoins
          .filter(coin => coin.isActive)
          .map(coin => {
            const balance = getMockBalance(coin.symbol);
            const price = getMockPrice(coin.symbol);
            const change = getMockChange(coin.symbol);
            return {
              coin: coin.symbol,
              change,
              value: balance * price
            };
          })
          .sort((a, b) => b.change - a.change);

        const topPerformers = performers.slice(0, 5);
        const worstPerformers = performers.slice(-5).reverse();

        // 24시간 변화율 계산 (모의)
        const totalChange24h = distribution.reduce((total, item) => {
          const coin = adminCoins.find(c => c.symbol === item.coin);
          return total + (getMockChange(coin?.symbol || '') * (item.percentage / 100));
        }, 0);

        setAnalyticsData({
          totalValue: portfolioValue,
          totalChange24h,
          totalChange7d: totalChange24h * 0.8,
          totalChange30d: totalChange24h * 1.2,
          portfolioDistribution: distribution,
          tradingVolume,
          topPerformers,
          worstPerformers
        });

        // 차트 데이터 가져오기 (BTC 기준)
        const btcChartData = await getMarketChart('bitcoin', 7);
        setChartData(btcChartData);

      } catch (error) {
        console.error('분석 데이터 생성 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateAnalyticsData();
  }, [adminCoins]);

  // 모의 데이터 함수들
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="analytics">
        <div className="loading">분석 데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="analytics">
        <div className="error">분석 데이터를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h1>포트폴리오 분석</h1>
        <p>자산 현황과 성과를 분석해보세요</p>
      </div>

      {/* 주요 지표 */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <FaDollarSign />
          </div>
          <div className="metric-content">
            <h3>총 자산</h3>
            <div className="metric-value">{formatCurrency(analyticsData.totalValue)}</div>
            <div className={`metric-change ${analyticsData.totalChange24h >= 0 ? 'positive' : 'negative'}`}>
              {formatPercentage(analyticsData.totalChange24h)}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <FaArrowUp />
          </div>
          <div className="metric-content">
            <h3>7일 수익률</h3>
            <div className="metric-value">{formatPercentage(analyticsData.totalChange7d)}</div>
            <div className="metric-label">지난 주 대비</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <FaCoins />
          </div>
          <div className="metric-content">
            <h3>보유 코인</h3>
            <div className="metric-value">{analyticsData.portfolioDistribution.length}개</div>
            <div className="metric-label">활성 코인</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <FaExchangeAlt />
          </div>
          <div className="metric-content">
            <h3>거래량</h3>
            <div className="metric-value">{formatCurrency(analyticsData.tradingVolume[analyticsData.tradingVolume.length - 1]?.volume || 0)}</div>
            <div className="metric-label">오늘</div>
          </div>
        </div>
      </div>

      {/* 포트폴리오 분포 */}
      <div className="portfolio-section">
        <h2>포트폴리오 분포</h2>
        <div className="portfolio-chart">
          {analyticsData.portfolioDistribution.map((item, index) => (
            <div key={item.coin} className="portfolio-item">
              <div className="portfolio-bar">
                <div 
                  className="portfolio-fill" 
                  style={{ 
                    width: `${item.percentage}%`,
                    backgroundColor: `hsl(${index * 30}, 70%, 50%)`
                  }}
                />
              </div>
              <div className="portfolio-info">
                <span className="coin-symbol">{item.coin}</span>
                <span className="coin-percentage">{item.percentage.toFixed(1)}%</span>
                <span className="coin-value">{formatCurrency(item.value)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 성과 분석 */}
      <div className="performance-section">
        <div className="performance-column">
          <h3>최고 성과자</h3>
          <div className="performance-list">
            {analyticsData.topPerformers.map((performer, index) => (
              <div key={performer.coin} className="performance-item positive">
                <div className="performance-rank">{index + 1}</div>
                <div className="performance-coin">{performer.coin}</div>
                <div className="performance-change">{formatPercentage(performer.change)}</div>
                <div className="performance-value">{formatCurrency(performer.value)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="performance-column">
          <h3>최저 성과자</h3>
          <div className="performance-list">
            {analyticsData.worstPerformers.map((performer, index) => (
              <div key={performer.coin} className="performance-item negative">
                <div className="performance-rank">{index + 1}</div>
                <div className="performance-coin">{performer.coin}</div>
                <div className="performance-change">{formatPercentage(performer.change)}</div>
                <div className="performance-value">{formatCurrency(performer.value)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 거래량 차트 */}
      <div className="volume-section">
        <h2>거래량 추이</h2>
        <div className="volume-chart">
          {analyticsData.tradingVolume.map((item, index) => (
            <div key={item.date} className="volume-bar">
              <div 
                className="volume-fill"
                style={{ 
                  height: `${(item.volume / Math.max(...analyticsData.tradingVolume.map(v => v.volume))) * 100}%`
                }}
              />
              <span className="volume-date">{new Date(item.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
