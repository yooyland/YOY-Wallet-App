// 실제 CoinGecko API를 사용한 가격 데이터 서비스
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  image: string;
  last_updated: string;
}

export interface MarketData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

// 실제 가격 데이터 가져오기
export const getRealTimePrices = async (coinIds: string[]): Promise<CoinPrice[]> => {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('실시간 가격 데이터 가져오기 실패:', error);
    // 폴백: 모의 데이터 반환
    return getMockPrices(coinIds);
  }
};

// 특정 코인의 상세 정보 가져오기
export const getCoinDetail = async (coinId: string): Promise<CoinPrice | null> => {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      id: data.id,
      symbol: data.symbol,
      name: data.name,
      current_price: data.market_data?.current_price?.usd || 0,
      price_change_percentage_24h: data.market_data?.price_change_percentage_24h || 0,
      market_cap: data.market_data?.market_cap?.usd || 0,
      total_volume: data.market_data?.total_volume?.usd || 0,
      circulating_supply: data.market_data?.circulating_supply || 0,
      total_supply: data.market_data?.total_supply || 0,
      max_supply: data.market_data?.max_supply || null,
      image: data.image?.large || '',
      last_updated: data.last_updated
    };
  } catch (error) {
    console.error('코인 상세 정보 가져오기 실패:', error);
    return null;
  }
};

// 시장 차트 데이터 가져오기
export const getMarketChart = async (
  coinId: string, 
  days: number = 7, 
  currency: string = 'usd'
): Promise<MarketData | null> => {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('시장 차트 데이터 가져오기 실패:', error);
    return null;
  }
};

// 모의 데이터 (폴백용)
const getMockPrices = (coinIds: string[]): CoinPrice[] => {
  const mockData: { [key: string]: CoinPrice } = {
    bitcoin: {
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      current_price: 47500,
      price_change_percentage_24h: 2.5,
      market_cap: 900000000000,
      total_volume: 25000000000,
      circulating_supply: 19500000,
      total_supply: 21000000,
      max_supply: 21000000,
      image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      last_updated: new Date().toISOString()
    },
    ethereum: {
      id: 'ethereum',
      symbol: 'eth',
      name: 'Ethereum',
      current_price: 3350,
      price_change_percentage_24h: -1.2,
      market_cap: 400000000000,
      total_volume: 15000000000,
      circulating_supply: 120000000,
      total_supply: 120000000,
      max_supply: null,
      image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      last_updated: new Date().toISOString()
    },
    tether: {
      id: 'tether',
      symbol: 'usdt',
      name: 'Tether',
      current_price: 1.0,
      price_change_percentage_24h: 0.0,
      market_cap: 95000000000,
      total_volume: 50000000000,
      circulating_supply: 95000000000,
      total_supply: 100000000000,
      max_supply: null,
      image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
      last_updated: new Date().toISOString()
    }
  };

  return coinIds.map(id => mockData[id] || {
    id,
    symbol: id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    current_price: Math.random() * 100,
    price_change_percentage_24h: (Math.random() - 0.5) * 20,
    market_cap: Math.random() * 1000000000,
    total_volume: Math.random() * 100000000,
    circulating_supply: Math.random() * 1000000000,
    total_supply: Math.random() * 1000000000,
    max_supply: null,
    image: '',
    last_updated: new Date().toISOString()
  });
};

// 기존 함수들 (호환성 유지)
export const getTokenPriceUSD = async (symbol: string): Promise<number> => {
  try {
    const coinId = getCoinGeckoId(symbol);
    const detail = await getCoinDetail(coinId);
    return detail?.current_price || 0;
  } catch (error) {
    console.error('토큰 가격 가져오기 실패:', error);
    return 0;
  }
};

export const getTokenPriceUSDByContract = async (contractAddress: string): Promise<number> => {
  try {
    // 컨트랙트 주소로 코인 ID 찾기 (실제로는 더 복잡한 로직 필요)
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/ethereum/contract/${contractAddress}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.market_data?.current_price?.usd || 0;
  } catch (error) {
    console.error('컨트랙트 주소로 가격 가져오기 실패:', error);
    return 0;
  }
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
    'YOY': 'yooy-land' // 실제로는 존재하지 않을 수 있음
  };
  
  return idMap[symbol.toUpperCase()] || symbol.toLowerCase();
};


