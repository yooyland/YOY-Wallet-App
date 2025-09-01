import { ethers } from 'ethers';

export interface EthConfig {
  rpcUrl: string;
}

export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)'
];

export const createProvider = (rpcUrl: string) => {
  return new ethers.JsonRpcProvider(rpcUrl);
};

export const getEthBalance = async (rpcUrl: string, address: string) => {
  const provider = createProvider(rpcUrl);
  const balance = await provider.getBalance(address);
  return Number(ethers.formatEther(balance));
};

export const getErc20Balance = async (
  rpcUrl: string,
  tokenAddress: string,
  walletAddress: string
) => {
  const provider = createProvider(rpcUrl);
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const [raw, decimals, symbol, name] = await Promise.all([
    contract.balanceOf(walletAddress),
    contract.decimals(),
    contract.symbol(),
    contract.name(),
  ]);
  const balance = Number(ethers.formatUnits(raw, decimals));
  return { balance, decimals, symbol, name };
};


