// 간단한 CoinGecko 가격 조회 유틸
// - ERC-20 토큰은 컨트랙트 주소 기반 조회 권장

export const getTokenPriceUSDByContract = async (
  network: 'mainnet' | 'sepolia' | string,
  contract: string
): Promise<number | null> => {
  try {
    // CoinGecko는 테스트넷 미지원. sepolia도 ethereum 메인넷으로 조회 시도.
    const platform = 'ethereum';
    const endpoint = `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${contract}&vs_currencies=usd`;
    const res = await fetch(endpoint);
    if (!res.ok) return null;
    const data = await res.json();
    const key = Object.keys(data)[0];
    if (!key) return null;
    const price = data[key]?.usd;
    return typeof price === 'number' ? price : null;
  } catch (e) {
    return null;
  }
};


