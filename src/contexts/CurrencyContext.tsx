import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type SupportedCurrency = 'USD' | 'KRW' | 'JPY' | 'EUR' | 'CNY';

interface CurrencyContextType {
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
  formatMoney: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = (): CurrencyContextType => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};

const currencyLocales: Record<SupportedCurrency, string> = {
  USD: 'en-US',
  KRW: 'ko-KR',
  JPY: 'ja-JP',
  EUR: 'de-DE',
  CNY: 'zh-CN',
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<SupportedCurrency>('USD');

  useEffect(() => {
    const saved = localStorage.getItem('yoy_currency') as SupportedCurrency | null;
    if (saved) setCurrencyState(saved);
  }, []);

  const setCurrency = (c: SupportedCurrency) => {
    setCurrencyState(c);
    localStorage.setItem('yoy_currency', c);
  };

  const formatMoney = useMemo(() => {
    return (amount: number) =>
      new Intl.NumberFormat(currencyLocales[currency], { style: 'currency', currency }).format(amount);
  }, [currency]);

  const value: CurrencyContextType = { currency, setCurrency, formatMoney };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};


