import axios from 'axios';
import { toast } from 'react-hot-toast';

// API 기본 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 포함
});

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리 및 토큰 갱신
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 에러 (토큰 만료) 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // 리프레시 토큰도 만료된 경우 로그아웃
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // 에러 메시지 처리
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
    }

    return Promise.reject(error);
  }
);

// 인증 관련 API
export const authAPI = {
  // 로그인
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // 회원가입
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // 이메일 인증
  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  // 이메일 인증 코드 재전송
  resendVerification: async (email) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },

  // 비밀번호 재설정 요청
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // 비밀번호 재설정
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  // 로그아웃
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // 2FA 설정
  setup2FA: async () => {
    const response = await api.post('/auth/setup-2fa');
    return response.data;
  },

  // 2FA 인증
  verify2FA: async (code) => {
    const response = await api.post('/auth/verify-2fa', { code });
    return response.data;
  }
};

// 사용자 관련 API
export const userAPI = {
  // 프로필 조회
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // 프로필 업데이트
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // 프로필 사진 업로드
  uploadProfilePhoto: async (file) => {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await api.post('/users/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 비밀번호 변경
  changePassword: async (passwordData) => {
    const response = await api.put('/users/change-password', passwordData);
    return response.data;
  },

  // 계정 삭제
  deleteAccount: async (password) => {
    const response = await api.delete('/users/account', { data: { password } });
    return response.data;
  }
};

// 자산 관련 API
export const assetAPI = {
  // 사용자 자산 목록 조회
  getUserAssets: async () => {
    const response = await api.get('/assets');
    return response.data;
  },

  // 특정 코인 자산 조회
  getAssetByCoin: async (coinSymbol, network = 'Ethereum') => {
    const response = await api.get(`/assets/${coinSymbol}?network=${network}`);
    return response.data;
  },

  // 자산 잔액 업데이트
  updateAssetBalance: async (coinSymbol, balance, network = 'Ethereum') => {
    const response = await api.put(`/assets/${coinSymbol}/balance`, {
      balance,
      network
    });
    return response.data;
  },

  // 자산 잠금/해제
  lockAsset: async (coinSymbol, amount, network = 'Ethereum') => {
    const response = await api.post(`/assets/${coinSymbol}/lock`, {
      amount,
      network
    });
    return response.data;
  },

  unlockAsset: async (coinSymbol, amount, network = 'Ethereum') => {
    const response = await api.post(`/assets/${coinSymbol}/unlock`, {
      amount,
      network
    });
    return response.data;
  }
};

// 거래 관련 API
export const transactionAPI = {
  // 사용자 거래 내역 조회
  getUserTransactions: async (options = {}) => {
    const params = new URLSearchParams();
    Object.keys(options).forEach(key => {
      if (options[key] !== undefined && options[key] !== null) {
        params.append(key, options[key]);
      }
    });

    const response = await api.get(`/transactions?${params.toString()}`);
    return response.data;
  },

  // 거래 상세 조회
  getTransaction: async (txHash) => {
    const response = await api.get(`/transactions/${txHash}`);
    return response.data;
  },

  // 거래 생성 (송금)
  createTransaction: async (transactionData) => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  // 거래 상태 업데이트
  updateTransactionStatus: async (txHash, status) => {
    const response = await api.put(`/transactions/${txHash}/status`, { status });
    return response.data;
  },

  // 거래 통계
  getTransactionStats: async (period = '30d') => {
    const response = await api.get(`/transactions/stats?period=${period}`);
    return response.data;
  }
};

// 관리자 관련 API
export const adminAPI = {
  // 사용자 목록 조회
  getUsers: async (options = {}) => {
    const params = new URLSearchParams();
    Object.keys(options).forEach(key => {
      if (options[key] !== undefined && options[key] !== null) {
        params.append(key, options[key]);
      }
    });

    const response = await api.get(`/admin/users?${params.toString()}`);
    return response.data;
  },

  // 사용자 상태 변경
  updateUserStatus: async (userId, status) => {
    const response = await api.put(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  // 블랙리스트 관리
  getBlacklist: async () => {
    const response = await api.get('/admin/blacklist');
    return response.data;
  },

  addToBlacklist: async (blacklistData) => {
    const response = await api.post('/admin/blacklist', blacklistData);
    return response.data;
  },

  removeFromBlacklist: async (entryId) => {
    const response = await api.delete(`/admin/blacklist/${entryId}`);
    return response.data;
  },

  // 거버넌스 요청 관리
  getGovernanceRequests: async () => {
    const response = await api.get('/admin/governance-requests');
    return response.data;
  },

  processGovernanceRequest: async (requestId, action, notes) => {
    const response = await api.put(`/admin/governance-requests/${requestId}`, {
      action,
      notes
    });
    return response.data;
  }
};

// 코인 관련 API
export const coinAPI = {
  // 코인 목록 조회
  getCoins: async () => {
    const response = await api.get('/coins');
    return response.data;
  },

  // 코인 추가
  addCoin: async (coinData) => {
    const response = await api.post('/coins', coinData);
    return response.data;
  },

  // 코인 수정
  updateCoin: async (coinId, coinData) => {
    const response = await api.put(`/coins/${coinId}`, coinData);
    return response.data;
  },

  // 코인 삭제
  deleteCoin: async (coinId) => {
    const response = await api.delete(`/coins/${coinId}`);
    return response.data;
  },

  // 코인 상태 토글
  toggleCoinStatus: async (coinId) => {
    const response = await api.put(`/coins/${coinId}/toggle`);
    return response.data;
  }
};

// 에러 처리 유틸리티
export const handleAPIError = (error) => {
  if (error.response) {
    // 서버 응답이 있는 경우
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return `잘못된 요청: ${data.message || '입력 데이터를 확인해주세요.'}`;
      case 401:
        return '인증이 필요합니다. 다시 로그인해주세요.';
      case 403:
        return '접근 권한이 없습니다.';
      case 404:
        return '요청한 리소스를 찾을 수 없습니다.';
      case 429:
        return '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.';
      case 500:
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      default:
        return data.message || '알 수 없는 오류가 발생했습니다.';
    }
  } else if (error.request) {
    // 요청은 보냈지만 응답을 받지 못한 경우
    return '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
  } else {
    // 요청 자체를 보내지 못한 경우
    return error.message || '요청을 처리할 수 없습니다.';
  }
};

export default api;
