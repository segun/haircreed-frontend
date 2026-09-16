import React, { createContext, useContext } from 'react';
import { getCurrentAppSettings } from '../api/databaseReads';
import { useApiQuery } from '../hooks/useApiQuery';

const formatAmount = (amount: number): string =>
  amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type CurrencyContextValue = {
  currency: string;
  formatCurrency: (amount: number) => string;
};

const defaultContext: CurrencyContextValue = {
  currency: '$',
  formatCurrency: (amount) => `$${formatAmount(amount)}`,
};

const CurrencyContext = createContext<CurrencyContextValue>(defaultContext);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data } = useApiQuery('currency-settings', getCurrentAppSettings);
  const currency = data?.settings.currency ?? '$';
  const formatCurrency = (amount: number) => `${currency}${formatAmount(amount)}`;
  return <CurrencyContext.Provider value={{ currency, formatCurrency }}>{children}</CurrencyContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCurrency = () => useContext(CurrencyContext);
