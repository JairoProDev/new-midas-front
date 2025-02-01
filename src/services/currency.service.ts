import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api`;

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add request interceptor to add auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
  updatedAt: string;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  updatedAt: string;
}

export const currencyService = {
  async getSupportedCurrencies(): Promise<Currency[]> {
    const response = await axiosInstance.get('/currencies');
    return response.data;
  },

  async getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
    const response = await axiosInstance.get('/currencies/exchange-rate', {
      params: { from, to },
    });
    return response.data;
  },

  async convertAmount(
    amount: number,
    from: string,
    to: string
  ): Promise<{ amount: number; rate: number }> {
    const response = await axiosInstance.get('/currencies/convert', {
      params: { amount, from, to },
    });
    return response.data;
  },

  async getDefaultCurrency(): Promise<Currency> {
    const response = await axiosInstance.get('/currencies/default');
    return response.data;
  },

  async setDefaultCurrency(currencyCode: string): Promise<void> {
    await axiosInstance.put('/currencies/default', { currency: currencyCode });
  },

  formatAmount(amount: number, currency: string, locale = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  async getBulkExchangeRates(
    baseCurrency: string,
    currencies: string[]
  ): Promise<{ [key: string]: number }> {
    const response = await axiosInstance.get('/currencies/bulk-rates', {
      params: { base: baseCurrency, currencies: currencies.join(',') },
    });
    return response.data;
  },

  async getHistoricalRates(
    from: string,
    to: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    dates: string[];
    rates: number[];
  }> {
    const response = await axiosInstance.get('/currencies/historical-rates', {
      params: {
        from,
        to,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
    return response.data;
  },
}; 