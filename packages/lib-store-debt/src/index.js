// packages/lib-store-debt/src/index.js
// @warungku/lib-store-debt

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const API = '/api';

const apiFetch = async (path, opts = {}) => {
  const res  = await fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const useDebtStore = create(
  devtools((set) => ({
    debts:   [],
    stats:   { total: 0, unpaidCount: 0, paidCount: 0, totalUnpaid: 0 },
    loading: false,
    error:   null,

    fetchDebts: async (params = {}) => {
      set({ loading: true, error: null }, false, 'debts/fetchStart');
      try {
        const q    = new URLSearchParams(params).toString();
        const data = await apiFetch(`/debts${q ? `?${q}` : ''}`);
        set({ debts: data.debts, stats: data.stats, loading: false }, false, 'debts/fetchOk');
      } catch (err) {
        set({ error: err.message, loading: false }, false, 'debts/fetchFail');
        throw err;
      }
    },

    createDebt: async (payload) => {
      const data = await apiFetch('/debts', { method: 'POST', body: JSON.stringify(payload) });
      set((s) => ({
        debts: [data, ...s.debts],
        stats: { ...s.stats, total: s.stats.total + 1, unpaidCount: s.stats.unpaidCount + 1, totalUnpaid: s.stats.totalUnpaid + data.amount },
      }), false, 'debts/create');
      return data;
    },

    markAsPaid: async (id) => {
      const data = await apiFetch(`/debts/${id}/pay`, { method: 'PATCH' });
      set((s) => ({
        debts: s.debts.map((d) => d.id === id ? data : d),
        stats: { ...s.stats, unpaidCount: s.stats.unpaidCount - 1, paidCount: s.stats.paidCount + 1, totalUnpaid: s.stats.totalUnpaid - data.amount },
      }), false, 'debts/pay');
      return data;
    },

    deleteDebt: async (id) => {
      await apiFetch(`/debts/${id}`, { method: 'DELETE' });
      set((s) => ({ debts: s.debts.filter((d) => d.id !== id) }), false, 'debts/delete');
    },
  }), { name: 'DebtStore' })
);
