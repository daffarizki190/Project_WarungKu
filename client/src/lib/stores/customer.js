// client/src/lib/stores/customer.js — Zustand store untuk data pelanggan

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiFetch } from './api';

export const useCustomerStore = create(
    devtools((set) => ({
        customers: [],
        loading: false,
        error: null,

        fetchCustomers: async (query = {}) => {
            set({ loading: true, error: null });
            try {
                const q = new URLSearchParams(query).toString();
                const data = await apiFetch(`/customers${q ? `?${q}` : ''}`);
                set({ customers: data, loading: false });
            } catch (err) {
                set({ error: err.message, loading: false });
                throw err;
            }
        },

        createCustomer: async (payload) => {
            const data = await apiFetch('/customers', { method: 'POST', body: JSON.stringify(payload) });
            set((s) => ({ customers: [data, ...s.customers] }));
            return data;
        },

        updateCustomer: async (id, payload) => {
            const data = await apiFetch(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
            set((s) => ({ customers: s.customers.map((c) => c.id === id ? data : c) }));
            return data;
        },

        deleteCustomer: async (id) => {
            await apiFetch(`/customers/${id}`, { method: 'DELETE' });
            set((s) => ({ customers: s.customers.filter((c) => c.id !== id) }));
        },
    }), { name: 'CustomerStore' })
);
