import React, { createContext, useContext } from 'react';
import db from '../instant';

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
  const { data } = db.useQuery({ AppSettings: {} });
  const currency = (data?.AppSettings?.[0]?.settings as { currency?: string } | undefined)?.currency ?? '$';
  const formatCurrency = (amount: number) => `${currency}${formatAmount(amount)}`;
  return <CurrencyContext.Provider value={{ currency, formatCurrency }}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => useContext(CurrencyContext);
