// client/src/lib/stores/product.js

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiFetch } from './api';

export const useProductStore = create(
  devtools((set, get) => ({
    products: [],
    categories: [],
    loading: false,
    error: null,

    fetchProducts: async (params = {}) => {
      set({ loading: true, error: null }, false, 'products/fetchStart');
      try {
        const q = new URLSearchParams(params).toString();
        const data = await apiFetch(`/products${q ? `?${q}` : ''}`);
        set({ products: data.products, categories: data.categories, loading: false }, false, 'products/fetchOk');
      } catch (err) {
        set({ error: err.message, loading: false }, false, 'products/fetchFail');
        throw err;
      }
    },

    createProduct: async (payload) => {
      const data = await apiFetch('/products', { method: 'POST', body: JSON.stringify(payload) });
      set((s) => ({ products: [...s.products, data] }), false, 'products/create');
      return data;
    },

    updateProduct: async (id, payload) => {
      const data = await apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      set((s) => ({ products: s.products.map((p) => (p.id === id ? data : p)) }), false, 'products/update');
      return data;
    },

    deleteProduct: async (id) => {
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
      set((s) => ({ products: s.products.filter((p) => p.id !== id) }), false, 'products/delete');
    },

    getByCategory: (cat) => {
      const { products } = get();
      return !cat || cat === 'Semua' ? products : products.filter((p) => p.category === cat);
    },
  }), { name: 'ProductStore' })
);
