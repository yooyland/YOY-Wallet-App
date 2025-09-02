export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  profilePhoto?: string;
  createdAt: string;
  updatedAt: string;
  isAdmin?: boolean;
}

// ... existing code ...

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'super_admin';
  createdAt: string;
  updatedAt: string;
}

export interface AdminCoin {
  id: string;
  symbol: string;
  name: string;
  contractAddress: string;
  network: string;
  decimals: number;
  totalSupply: string;
  isActive: boolean;
  logoUrl?: string; // 로고 URL 필드 추가
  addedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  change24h: number;
  volume?: number;
  icon: string;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap';
  coin: string;
  amount: number;
  fee: number;
  status: 'pending' | 'completed' | 'failed';
  from: string;
  to: string;
  timestamp: Date;
  hash?: string;
}

export interface Wallet {
  id: string;
  userId: string;
  address: string;
  coins: Coin[];
  totalValue: number;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface PinCredentials {
  pin: string;
}

export interface BiometricCredentials {
  biometric: boolean;
}

export interface SecuritySettings {
  pinEnabled: boolean;
  biometricEnabled: boolean;
  pin?: string;
}
