// 업비트 API 유틸리티
export interface UpbitMarket {
  market: string;
  korean_name: string;
  english_name: string;
  market_warning: string;
}

export interface UpbitTicker {
  market: string;
  trade_date: string;
  trade_time: string;
  trade_price: number;
  trade_volume: number;
  prev_closing_price: number;
  change: string;
  change_price: number;
  change_rate: number;
  signed_change_price: number;
  signed_change_rate: number;
  high_price: number;
  low_price: number;
  acc_trade_volume_24h: number;
  acc_trade_price_24h: number;
  high_price_24h: number;
  low_price_24h: number;
  acc_trade_volume: number;
  acc_trade_price: number;
  trade_timestamp: number;
}

// 업비트 마켓 정보 가져오기
export const getUpbitMarkets = async (): Promise<UpbitMarket[]> => {
  try {
    const response = await fetch('https://api.upbit.com/v1/market/all');
    if (!response.ok) {
      throw new Error('업비트 API 요청 실패');
    }
    return await response.json();
  } catch (error) {
    console.error('업비트 마켓 정보 가져오기 실패:', error);
    return [];
  }
};

// 업비트 티커 정보 가져오기
export const getUpbitTicker = async (market: string): Promise<UpbitTicker | null> => {
  try {
    const response = await fetch(`https://api.upbit.com/v1/ticker?markets=${market}`);
    if (!response.ok) {
      throw new Error('업비트 API 요청 실패');
    }
    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    console.error('업비트 티커 정보 가져오기 실패:', error);
    return null;
  }
};

// 코인 심볼로 업비트 마켓 찾기
export const findUpbitMarket = (symbol: string, markets: UpbitMarket[]): UpbitMarket | null => {
  const upperSymbol = symbol.toUpperCase();
  
  // KRW 마켓에서 찾기
  const krwMarket = markets.find(market => 
    market.market === `KRW-${upperSymbol}`
  );
  if (krwMarket) return krwMarket;
  
  // BTC 마켓에서 찾기
  const btcMarket = markets.find(market => 
    market.market === `BTC-${upperSymbol}`
  );
  if (btcMarket) return btcMarket;
  
  // USDT 마켓에서 찾기
  const usdtMarket = markets.find(market => 
    market.market === `USDT-${upperSymbol}`
  );
  if (usdtMarket) return usdtMarket;
  
  return null;
};

// 업비트 로고 URL 생성
export const getUpbitLogoUrl = (market: string): string => {
  const symbol = market.split('-')[1];
  return `https://static.upbit.com/logos/${symbol}.png`;
};

// 코인 심볼로 로고 URL 가져오기
export const getCoinLogoUrl = async (symbol: string): Promise<string | null> => {
  try {
    const markets = await getUpbitMarkets();
    const market = findUpbitMarket(symbol, markets);
    
    if (market) {
      return getUpbitLogoUrl(market.market);
    }
    
    return null;
  } catch (error) {
    console.error('로고 URL 가져오기 실패:', error);
    return null;
  }
};

// 코인 정보와 함께 로고 URL 가져오기
export const getCoinInfoWithLogo = async (symbol: string) => {
  try {
    const markets = await getUpbitMarkets();
    const market = findUpbitMarket(symbol, markets);
    
    if (market) {
      const ticker = await getUpbitTicker(market.market);
      return {
        market: market.market,
        koreanName: market.korean_name,
        englishName: market.english_name,
        logoUrl: getUpbitLogoUrl(market.market),
        ticker
      };
    }
    
    return null;
  } catch (error) {
    console.error('코인 정보 가져오기 실패:', error);
    return null;
  }
};
