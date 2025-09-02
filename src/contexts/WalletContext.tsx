import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { HDWallet, WalletAccount, generateMnemonic, createHDWallet, recoverWallet } from '../services/wallet';

interface WalletContextType {
  wallet: HDWallet | null;
  currentAccount: WalletAccount | null;
  isWalletSetup: boolean;
  createWallet: () => Promise<string>; // 니모닉 반환
  restoreWallet: (mnemonic: string) => Promise<void>;
  selectAccount: (index: number) => void;
  addAccount: () => Promise<void>;
  sendTransaction: (to: string, amount: string, coin: string) => Promise<string>;
  clearWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<HDWallet | null>(null);
  const [currentAccount, setCurrentAccount] = useState<WalletAccount | null>(null);

  // 지갑 복구 함수
  const restoreWallet = async (mnemonic: string): Promise<void> => {
    const restoredWallet = await recoverWallet(mnemonic, 5); // 5개 계정 복구
    
    setWallet(restoredWallet);
    setCurrentAccount(restoredWallet.accounts[0]);
    
    localStorage.setItem('yoy_wallet_mnemonic', mnemonic);
    localStorage.setItem('yoy_wallet_account_index', '0');
  };

  // 계정 선택 함수
  const selectAccount = (index: number) => {
    if (wallet && wallet.accounts[index]) {
      setCurrentAccount(wallet.accounts[index]);
      localStorage.setItem('yoy_wallet_account_index', index.toString());
    }
  };

  // 로컬 스토리지에서 지갑 복구 시도
  useEffect(() => {
    const savedMnemonic = localStorage.getItem('yoy_wallet_mnemonic');
    const savedAccountIndex = localStorage.getItem('yoy_wallet_account_index');
    
    if (savedMnemonic) {
      restoreWallet(savedMnemonic).then(() => {
        if (savedAccountIndex) {
          selectAccount(parseInt(savedAccountIndex));
        }
      }).catch(console.error);
    }
  }, []);

  const createWallet = async (): Promise<string> => {
    const mnemonic = generateMnemonic();
    const newWallet = await createHDWallet(mnemonic, 1);
    
    setWallet(newWallet);
    setCurrentAccount(newWallet.accounts[0]);
    
    // 보안상 니모닉은 실제로는 암호화해서 저장해야 함
    localStorage.setItem('yoy_wallet_mnemonic', mnemonic);
    localStorage.setItem('yoy_wallet_account_index', '0');
    
    return mnemonic;
  };

  const addAccount = async () => {
    if (!wallet) return;
    
    const newAccountCount = wallet.accounts.length + 1;
    const updatedWallet = await createHDWallet(wallet.mnemonic, newAccountCount);
    
    setWallet(updatedWallet);
  };

  const sendTransaction = async (to: string, amount: string, coin: string): Promise<string> => {
    if (!currentAccount) {
      throw new Error('지갑이 설정되지 않았습니다.');
    }
    
    // 실제로는 여기서 블록체인 트랜잭션을 전송해야 함
    // 현재는 모의 트랜잭션 해시를 반환
    const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
    
    // 로컬 스토리지에 트랜잭션 기록 저장
    const transactions = JSON.parse(localStorage.getItem('yoy_transactions') || '[]');
    transactions.push({
      from: currentAccount.address,
      to,
      amount,
      coin,
      txHash: mockTxHash,
      timestamp: new Date().toISOString(),
      status: 'completed'
    });
    localStorage.setItem('yoy_transactions', JSON.stringify(transactions));
    
    return mockTxHash;
  };

  const clearWallet = () => {
    setWallet(null);
    setCurrentAccount(null);
    localStorage.removeItem('yoy_wallet_mnemonic');
    localStorage.removeItem('yoy_wallet_account_index');
  };

  const value: WalletContextType = {
    wallet,
    currentAccount,
    isWalletSetup: !!wallet,
    createWallet,
    restoreWallet,
    selectAccount,
    addAccount,
    sendTransaction,
    clearWallet,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
