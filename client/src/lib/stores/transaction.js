// client/src/lib/stores/transaction.js

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiFetch } from './api';

export const useTransactionStore = create(
  devtools((set) => ({
    transactions: [],
    summary: null,
    loading: false,
    error: null,

    fetchTransactions: async (params = {}) => {
      set({ loading: true, error: null }, false, 'tx/fetchStart');
      try {
        const q = new URLSearchParams(params).toString();
        const [txData, sumData] = await Promise.all([
          apiFetch(`/transactions${q ? `?${q}` : ''}`),
          apiFetch('/transactions/summary/daily'),
        ]);
        set({ transactions: txData.transactions, summary: sumData, loading: false }, false, 'tx/fetchOk');
      } catch (err) {
        set({ error: err.message, loading: false }, false, 'tx/fetchFail');
        throw err;
      }
    },

    createTransaction: async (payload) => {
      const data = await apiFetch('/transactions', { method: 'POST', body: JSON.stringify(payload) });
      set((s) => ({
        transactions: [data, ...s.transactions],
        summary: s.summary
          ? { ...s.summary, transactionCount: s.summary.transactionCount + 1, totalRevenue: s.summary.totalRevenue + data.total }
          : s.summary,
      }), false, 'tx/create');
      return data;
    },
  }), { name: 'TransactionStore' })
);
