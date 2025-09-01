import { ethers } from 'ethers';

export interface WalletAccount {
  address: string;
  privateKey: string;
  publicKey: string;
  index: number;
}

export interface HDWallet {
  mnemonic: string;
  seed: string;
  accounts: WalletAccount[];
}

// 브라우저 호환 가능한 니모닉 생성
export const generateMnemonic = (): string => {
  // ethers.js의 내장 니모닉 생성 사용
  return ethers.Wallet.createRandom().mnemonic?.phrase || '';
};

// 니모닉 검증
export const validateMnemonic = (mnemonic: string): boolean => {
  try {
    // ethers.js v6에서는 HDNodeWallet.fromPhrase로 검증
    ethers.HDNodeWallet.fromPhrase(mnemonic);
    return true;
  } catch {
    return false;
  }
};

// HD 지갑 생성 (BIP-44 경로: m/44'/60'/0'/0/index)
export const createHDWallet = async (
  mnemonic: string,
  accountCount: number = 1
): Promise<HDWallet> => {
  if (!validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase');
  }

  // ethers.js의 HDNodeWallet 사용
  const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
  const accounts: WalletAccount[] = [];

  // BIP-44 이더리움 경로
  const basePath = "m/44'/60'/0'/0";

  for (let i = 0; i < accountCount; i++) {
    const path = `${basePath}/${i}`;
    const account = hdNode.derivePath(path);
    
    accounts.push({
      address: account.address,
      privateKey: account.privateKey,
      publicKey: account.publicKey,
      index: i,
    });
  }

  return {
    mnemonic,
    seed: hdNode.privateKey, // seed 대신 privateKey 사용
    accounts,
  };
};

// 니모닉으로부터 지갑 복구
export const recoverWallet = async (
  mnemonic: string,
  accountCount: number = 1
): Promise<HDWallet> => {
  return createHDWallet(mnemonic, accountCount);
};

// 개인키로 서명자 생성
export const createSigner = (privateKey: string, rpcUrl: string) => {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  return new ethers.Wallet(privateKey, provider);
};

// ERC-20 토큰 전송
export const sendToken = async (
  signer: ethers.Wallet,
  tokenAddress: string,
  toAddress: string,
  amount: string,
  decimals: number = 18
) => {
  const tokenABI = [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function balanceOf(address account) view returns (uint256)',
    'function decimals() view returns (uint8)'
  ];
  
  const contract = new ethers.Contract(tokenAddress, tokenABI, signer);
  const amountWei = ethers.parseUnits(amount, decimals);
  
  const tx = await contract.transfer(toAddress, amountWei);
  return tx;
};

// ETH 전송
export const sendEth = async (
  signer: ethers.Wallet,
  toAddress: string,
  amount: string
) => {
  const amountWei = ethers.parseEther(amount);
  const tx = await signer.sendTransaction({
    to: toAddress,
    value: amountWei,
  });
  return tx;
};

// ERC-20 토큰 잔액 조회
export const getErc20Balance = async (
  provider: ethers.Provider,
  tokenAddress: string,
  walletAddress: string
): Promise<string> => {
  const tokenABI = [
    'function balanceOf(address account) view returns (uint256)',
    'function decimals() view returns (uint8)'
  ];
  
  const contract = new ethers.Contract(tokenAddress, tokenABI, provider);
  const balance = await contract.balanceOf(walletAddress);
  const decimals = await contract.decimals();
  
  return ethers.formatUnits(balance, decimals);
};

// ETH 잔액 조회
export const getEthBalance = async (
  provider: ethers.Provider,
  walletAddress: string
): Promise<string> => {
  const balance = await provider.getBalance(walletAddress);
  return ethers.formatEther(balance);
};
