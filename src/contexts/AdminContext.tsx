import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AdminUser, AdminCoin } from '../types';
import { getCoinLogoUrl } from '../utils/upbitApi';

interface AdminState {
  adminUsers: AdminUser[];
  adminCoins: AdminCoin[];
  isLoading: boolean;
  error: string | null;
}

interface AdminContextType extends AdminState {
  isAdmin: boolean;
  addAdmin: (adminData: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  removeAdmin: (adminId: string) => Promise<void>;
  addCoin: (coinData: Omit<AdminCoin, 'id' | 'createdAt' | 'updatedAt' | 'addedBy'>) => Promise<void>;
  updateCoin: (coinId: string, coinData: Partial<AdminCoin>) => Promise<void>;
  removeCoin: (coinId: string) => Promise<void>;
  toggleCoinStatus: (coinId: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

type AdminAction =
  | { type: 'ADMIN_START' }
  | { type: 'ADMIN_SUCCESS' }
  | { type: 'ADMIN_FAILURE'; payload: string }
  | { type: 'LOAD_ADMIN_USERS'; payload: AdminUser[] }
  | { type: 'LOAD_ADMIN_COINS'; payload: AdminCoin[] }
  | { type: 'ADD_ADMIN_USER'; payload: AdminUser }
  | { type: 'REMOVE_ADMIN_USER'; payload: string }
  | { type: 'ADD_COIN'; payload: AdminCoin }
  | { type: 'UPDATE_COIN'; payload: AdminCoin }
  | { type: 'REMOVE_COIN'; payload: string };

const adminReducer = (state: AdminState, action: AdminAction): AdminState => {
  switch (action.type) {
    case 'ADMIN_START':
      return { ...state, isLoading: true, error: null };
    case 'ADMIN_SUCCESS':
      return { ...state, isLoading: false, error: null };
    case 'ADMIN_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'LOAD_ADMIN_USERS':
      return { ...state, adminUsers: action.payload };
    case 'LOAD_ADMIN_COINS':
      return { ...state, adminCoins: action.payload };
    case 'ADD_ADMIN_USER':
      return { ...state, adminUsers: [...state.adminUsers, action.payload] };
    case 'REMOVE_ADMIN_USER':
      return { ...state, adminUsers: state.adminUsers.filter(user => user.id !== action.payload) };
    case 'ADD_COIN':
      return { ...state, adminCoins: [...state.adminCoins, action.payload] };
    case 'UPDATE_COIN':
      return { 
        ...state, 
        adminCoins: state.adminCoins.map(coin => 
          coin.id === action.payload.id ? action.payload : coin
        ) 
      };
    case 'REMOVE_COIN':
      return { ...state, adminCoins: state.adminCoins.filter(coin => coin.id !== action.payload) };
    default:
      return state;
  }
};

const initialState: AdminState = {
  adminUsers: [],
  adminCoins: [],
  isLoading: false,
  error: null,
};

// 초기 관리자 목록
const initialAdminEmails = [
  'admin@yooyland.com',
  'landyooy@gmail.com',
  'jch4389@gmail.com'
];

// 초기 코인 목록
const initialCoins: AdminCoin[] = [
  {
    id: 'coin_btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    contractAddress: '0x0000000000000000000000000000000000000000', // BTC는 네이티브 코인이므로 더미 주소
    network: 'Bitcoin',
    decimals: 8,
    totalSupply: '21000000',
    isActive: true,
    addedBy: 'admin@yooyland.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'coin_eth',
    symbol: 'ETH',
    name: 'Ethereum',
    contractAddress: '0x0000000000000000000000000000000000000000', // ETH는 네이티브 코인이므로 더미 주소
    network: 'Ethereum',
    decimals: 18,
    totalSupply: '120000000',
    isActive: true,
    addedBy: 'admin@yooyland.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'coin_yoy',
    symbol: 'YOY',
    name: 'YooY Land',
    contractAddress: '0xf999DA2B5132eA62A158dA8A82f2265A1b1d9701',
    network: 'Ethereum',
    decimals: 18,
    totalSupply: '10000000000',
    isActive: true,
    addedBy: 'admin@yooyland.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'coin_usdt',
    symbol: 'USDT',
    name: 'Tether USD',
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    network: 'Ethereum',
    decimals: 6,
    totalSupply: '1000000000000',
    isActive: true,
    addedBy: 'admin@yooyland.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'coin_usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    contractAddress: '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8C',
    network: 'Ethereum',
    decimals: 6,
    totalSupply: '50000000000',
    isActive: true,
    addedBy: 'admin@yooyland.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'coin_bnb',
    symbol: 'BNB',
    name: 'Binance Coin',
    contractAddress: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
    network: 'BSC',
    decimals: 18,
    totalSupply: '200000000',
    isActive: true,
    addedBy: 'admin@yooyland.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'coin_ada',
    symbol: 'ADA',
    name: 'Cardano',
    contractAddress: '0x0000000000000000000000000000000000000000',
    network: 'Cardano',
    decimals: 6,
    totalSupply: '45000000000',
    isActive: true,
    addedBy: 'admin@yooyland.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'coin_sol',
    symbol: 'SOL',
    name: 'Solana',
    contractAddress: '0x0000000000000000000000000000000000000000',
    network: 'Solana',
    decimals: 9,
    totalSupply: '500000000',
    isActive: true,
    addedBy: 'admin@yooyland.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'coin_dot',
    symbol: 'DOT',
    name: 'Polkadot',
    contractAddress: '0x0000000000000000000000000000000000000000',
    network: 'Polkadot',
    decimals: 10,
    totalSupply: '1000000000',
    isActive: true,
    addedBy: 'admin@yooyland.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'coin_link',
    symbol: 'LINK',
    name: 'Chainlink',
    contractAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    network: 'Ethereum',
    decimals: 18,
    totalSupply: '1000000000',
    isActive: true,
    addedBy: 'admin@yooyland.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'coin_xrp',
    symbol: 'XRP',
    name: 'Ripple',
    contractAddress: '0x0000000000000000000000000000000000000000',
    network: 'XRP Ledger',
    decimals: 6,
    totalSupply: '100000000000',
    isActive: true,
    addedBy: 'admin@yooyland.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'coin_avax',
    symbol: 'AVAX',
    name: 'Avalanche',
    contractAddress: '0x0000000000000000000000000000000000000000',
    network: 'Avalanche',
    decimals: 18,
    totalSupply: '720000000',
    isActive: true,
    addedBy: 'admin@yooyland.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'coin_atom',
    symbol: 'ATOM',
    name: 'Cosmos',
    contractAddress: '0x0000000000000000000000000000000000000000',
    network: 'Cosmos Hub',
    decimals: 6,
    totalSupply: '260000000',
    isActive: true,
    addedBy: 'admin@yooyland.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'coin_ltc',
    symbol: 'LTC',
    name: 'Litecoin',
    contractAddress: '0x0000000000000000000000000000000000000000',
    network: 'Litecoin',
    decimals: 8,
    totalSupply: '84000000',
    isActive: true,
    addedBy: 'admin@yooyland.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'coin_trx',
    symbol: 'TRX',
    name: 'TRON',
    contractAddress: '0x0000000000000000000000000000000000000000',
    network: 'TRON',
    decimals: 6,
    totalSupply: '100000000000',
    isActive: true,
    addedBy: 'admin@yooyland.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'coin_xlm',
    symbol: 'XLM',
    name: 'Stellar',
    contractAddress: '0x0000000000000000000000000000000000000000',
    network: 'Stellar',
    decimals: 7,
    totalSupply: '50000000000',
    isActive: true,
    addedBy: 'admin@yooyland.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'coin_xmr',
    symbol: 'XMR',
    name: 'Monero',
    contractAddress: '0x0000000000000000000000000000000000000000',
    network: 'Monero',
    decimals: 12,
    totalSupply: '18400000',
    isActive: true,
    addedBy: 'admin@yooyland.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'coin_doge',
    symbol: 'DOGE',
    name: 'Dogecoin',
    contractAddress: '0x0000000000000000000000000000000000000000',
    network: 'Dogecoin',
    decimals: 8,
    totalSupply: '100000000000',
    isActive: true,
    addedBy: 'admin@yooyland.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  // 현재 사용자가 관리자인지 확인하는 함수
  const checkIsAdmin = (): boolean => {
    const currentUser = localStorage.getItem('yoy_wallet_user');
    if (!currentUser) return false;
    
    try {
      const user = JSON.parse(currentUser);
      return initialAdminEmails.includes(user.email);
    } catch (error) {
      return false;
    }
  };

  const isAdmin = checkIsAdmin();

  useEffect(() => {
    // 로컬 스토리지에서 관리자 데이터 복원
    const savedAdminUsers = localStorage.getItem('yoy_wallet_admin_users');

    if (savedAdminUsers) {
      try {
        const adminUsers = JSON.parse(savedAdminUsers);
        dispatch({ type: 'LOAD_ADMIN_USERS', payload: adminUsers });
      } catch (error) {
        console.error('관리자 사용자 로드 실패:', error);
      }
    } else {
      // 초기 관리자 생성
      const initialAdmins: AdminUser[] = initialAdminEmails.map((email, index) => ({
        id: `admin_${index + 1}`,
        email,
        username: email.split('@')[0],
        firstName: '관리자',
        lastName: `${index + 1}`,
        role: index === 0 ? 'super_admin' : 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      dispatch({ type: 'LOAD_ADMIN_USERS', payload: initialAdmins });
      localStorage.setItem('yoy_wallet_admin_users', JSON.stringify(initialAdmins));
    }

    // 코인 데이터 초기화 및 로고 URL 설정
    const initializeCoinsWithLogos = async () => {
      console.log('초기 코인 데이터 로드:', initialCoins.length, '개');
      
      // 각 코인에 대해 로고 URL 가져오기
      const coinsWithLogos = await Promise.all(
        initialCoins.map(async (coin) => {
          try {
            const logoUrl = await getCoinLogoUrl(coin.symbol);
            return {
              ...coin,
              logoUrl: logoUrl || undefined
            };
          } catch (error) {
            console.error(`${coin.symbol} 로고 가져오기 실패:`, error);
            return coin;
          }
        })
      );
      
      dispatch({ type: 'LOAD_ADMIN_COINS', payload: coinsWithLogos });
      localStorage.setItem('yoy_wallet_admin_coins', JSON.stringify(coinsWithLogos));
    };

    initializeCoinsWithLogos();
  }, []);

  const addAdmin = async (adminData: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    dispatch({ type: 'ADMIN_START' });
    try {
      const newAdmin: AdminUser = {
        ...adminData,
        id: `admin_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedAdmins = [...state.adminUsers, newAdmin];
      localStorage.setItem('yoy_wallet_admin_users', JSON.stringify(updatedAdmins));
      
      dispatch({ type: 'ADD_ADMIN_USER', payload: newAdmin });
      dispatch({ type: 'ADMIN_SUCCESS' });
    } catch (error) {
      dispatch({ type: 'ADMIN_FAILURE', payload: '관리자 추가에 실패했습니다.' });
    }
  };

  const removeAdmin = async (adminId: string): Promise<void> => {
    dispatch({ type: 'ADMIN_START' });
    try {
      const updatedAdmins = state.adminUsers.filter(user => user.id !== adminId);
      localStorage.setItem('yoy_wallet_admin_users', JSON.stringify(updatedAdmins));
      
      dispatch({ type: 'REMOVE_ADMIN_USER', payload: adminId });
      dispatch({ type: 'ADMIN_SUCCESS' });
    } catch (error) {
      dispatch({ type: 'ADMIN_FAILURE', payload: '관리자 제거에 실패했습니다.' });
    }
  };

  const addCoin = async (coinData: Omit<AdminCoin, 'id' | 'createdAt' | 'updatedAt' | 'addedBy'>): Promise<void> => {
    dispatch({ type: 'ADMIN_START' });
    try {
      const newCoin: AdminCoin = {
        ...coinData,
        id: `coin_${Date.now()}`,
        addedBy: 'admin@yooyland.com', // 실제로는 현재 로그인한 관리자 이메일
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('새로 추가되는 코인:', newCoin); // 디버깅

      const updatedCoins = [...state.adminCoins, newCoin];
      localStorage.setItem('yoy_wallet_admin_coins', JSON.stringify(updatedCoins));
      
      dispatch({ type: 'ADD_COIN', payload: newCoin });
      dispatch({ type: 'ADMIN_SUCCESS' });
    } catch (error) {
      dispatch({ type: 'ADMIN_FAILURE', payload: '코인 추가에 실패했습니다.' });
    }
  };

  const updateCoin = async (coinId: string, coinData: Partial<AdminCoin>): Promise<void> => {
    dispatch({ type: 'ADMIN_START' });
    try {
      const updatedCoin = state.adminCoins.map(coin => 
        coin.id === coinId 
          ? { ...coin, ...coinData, updatedAt: new Date().toISOString() }
          : coin
      );
      
      localStorage.setItem('yoy_wallet_admin_coins', JSON.stringify(updatedCoin));
      
      const coin = updatedCoin.find(c => c.id === coinId);
      if (coin) {
        dispatch({ type: 'UPDATE_COIN', payload: coin });
      }
      dispatch({ type: 'ADMIN_SUCCESS' });
    } catch (error) {
      dispatch({ type: 'ADMIN_FAILURE', payload: '코인 업데이트에 실패했습니다.' });
    }
  };

  const removeCoin = async (coinId: string): Promise<void> => {
    dispatch({ type: 'ADMIN_START' });
    try {
      const updatedCoins = state.adminCoins.filter(coin => coin.id !== coinId);
      localStorage.setItem('yoy_wallet_admin_coins', JSON.stringify(updatedCoins));
      
      dispatch({ type: 'REMOVE_COIN', payload: coinId });
      dispatch({ type: 'ADMIN_SUCCESS' });
    } catch (error) {
      dispatch({ type: 'ADMIN_FAILURE', payload: '코인 제거에 실패했습니다.' });
    }
  };

  const toggleCoinStatus = async (coinId: string): Promise<void> => {
    dispatch({ type: 'ADMIN_START' });
    try {
      const coin = state.adminCoins.find(c => c.id === coinId);
      if (coin) {
        await updateCoin(coinId, { isActive: !coin.isActive });
      }
    } catch (error) {
      dispatch({ type: 'ADMIN_FAILURE', payload: '코인 상태 변경에 실패했습니다.' });
    }
  };

  const value: AdminContextType = {
    ...state,
    isAdmin,
    addAdmin,
    removeAdmin,
    addCoin,
    updateCoin,
    removeCoin,
    toggleCoinStatus,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
