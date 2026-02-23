// packages/lib-store-category/src/index.js
// @warungku/lib-store-category — Zustand store untuk kategori produk

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiFetch } from './api';

export const useCategoryStore = create(
    devtools((set, get) => ({
        categories: [],
        loading: false,
        error: null,

        fetchCategories: async () => {
            set({ loading: true, error: null });
            try {
                const data = await apiFetch('/categories');
                set({ categories: data, loading: false });
            } catch (err) {
                set({ error: err.message, loading: false });
                throw err;
            }
        },

        createCategory: async (payload) => {
            const data = await apiFetch('/categories', { method: 'POST', body: JSON.stringify(payload) });
            set((s) => ({ categories: [...s.categories, data] }));
            return data;
        },

        updateCategory: async (id, payload) => {
            const data = await apiFetch(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
            set((s) => ({ categories: s.categories.map((c) => c.id === id ? data : c) }));
            return data;
        },

        deleteCategory: async (id) => {
            await apiFetch(`/categories/${id}`, { method: 'DELETE' });
            set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
        },
    }), { name: 'CategoryStore' })
);
