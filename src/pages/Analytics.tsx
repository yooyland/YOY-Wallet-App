import React, { useState, useEffect } from 'react';
import { FaChartLine, FaArrowUp, FaArrowDown, FaEye, FaCalendarAlt } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import './Analytics.css';

interface AnalyticsData {
  totalValue: number;
  change24h: number;
  topGainer: string;
  topLoser: string;
  totalTransactions: number;
  monthlyProfit: number;
}

const Analytics: React.FC = () => {
  const { t } = useLanguage();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalValue: 47200.00,
    change24h: 2.45,
    topGainer: 'BTC',
    topLoser: 'ETH',
    totalTransactions: 156,
    monthlyProfit: 1250.50
  });

  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    // 실제 구현에서는 API에서 분석 데이터를 가져옴
    const fetchAnalytics = () => {
      // 시뮬레이션 데이터
      setAnalyticsData({
        totalValue: 47200.00,
        change24h: Math.random() * 10 - 5, // -5% ~ +5%
        topGainer: 'BTC',
        topLoser: 'ETH',
        totalTransactions: 156,
        monthlyProfit: 1250.50
      });
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // 30초마다 업데이트

    return () => clearInterval(interval);
  }, [timeRange]);

  const chartData = [
    { date: '2024-01-01', value: 45000 },
    { date: '2024-01-02', value: 46200 },
    { date: '2024-01-03', value: 44800 },
    { date: '2024-01-04', value: 47200 },
    { date: '2024-01-05', value: 46800 },
    { date: '2024-01-06', value: 48100 },
    { date: '2024-01-07', value: 47200 },
  ];

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h1>
          <FaChartLine />
          분석
        </h1>
        <p>포트폴리오 성과를 분석하고 투자 인사이트를 확인하세요</p>
      </div>

      <div className="analytics-content">
        {/* 시간 범위 선택 */}
        <div className="time-range-selector">
          {['1d', '7d', '1m', '3m', '1y'].map((range) => (
            <button
              key={range}
              className={`time-btn ${timeRange === range ? 'active' : ''}`}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>

        {/* 주요 지표 */}
        <div className="analytics-cards">
          <div className="analytics-card">
            <div className="card-header">
              <h3>총 자산 가치</h3>
              <FaEye />
            </div>
            <div className="card-value">
              <span className="value">${analyticsData.totalValue.toLocaleString()}</span>
              <div className={`change ${analyticsData.change24h >= 0 ? 'positive' : 'negative'}`}>
                {analyticsData.change24h >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                {Math.abs(analyticsData.change24h).toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-header">
              <h3>이번 달 수익</h3>
              <FaCalendarAlt />
            </div>
            <div className="card-value">
              <span className="value">${analyticsData.monthlyProfit.toLocaleString()}</span>
              <div className="change positive">
                <FaArrowUp />
                12.5%
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-header">
              <h3>총 거래 수</h3>
            </div>
            <div className="card-value">
              <span className="value">{analyticsData.totalTransactions}</span>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-header">
              <h3>최고 수익률</h3>
            </div>
            <div className="card-value">
              <span className="value">{analyticsData.topGainer}</span>
              <div className="change positive">
                <FaArrowUp />
                +25.3%
              </div>
            </div>
          </div>
        </div>

        {/* 차트 영역 */}
        <div className="chart-section">
          <div className="chart-header">
            <h3>포트폴리오 성과</h3>
          </div>
          <div className="chart-placeholder">
            <FaChartLine />
            <p>차트 데이터 로딩 중...</p>
            <small>실제 구현에서는 Chart.js나 Recharts 라이브러리를 사용합니다</small>
          </div>
        </div>

        {/* 자산 분포 */}
        <div className="allocation-section">
          <h3>자산 배분</h3>
          <div className="allocation-list">
            <div className="allocation-item">
              <span className="coin-name">Bitcoin (BTC)</span>
              <span className="percentage">45.2%</span>
              <div className="allocation-bar">
                <div className="bar-fill" style={{ width: '45.2%' }}></div>
              </div>
            </div>
            <div className="allocation-item">
              <span className="coin-name">Ethereum (ETH)</span>
              <span className="percentage">32.8%</span>
              <div className="allocation-bar">
                <div className="bar-fill" style={{ width: '32.8%' }}></div>
              </div>
            </div>
            <div className="allocation-item">
              <span className="coin-name">YooY Land (YOY)</span>
              <span className="percentage">15.5%</span>
              <div className="allocation-bar">
                <div className="bar-fill" style={{ width: '15.5%' }}></div>
              </div>
            </div>
            <div className="allocation-item">
              <span className="coin-name">기타</span>
              <span className="percentage">6.5%</span>
              <div className="allocation-bar">
                <div className="bar-fill" style={{ width: '6.5%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
