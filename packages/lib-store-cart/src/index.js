// packages/lib-store-cart/src/index.js
// @warungku/lib-store-cart

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useCartStore = create(
  devtools((set, get) => ({
    items: [],

    addItem: (product) => set((s) => {
      const exists = s.items.find((i) => i.productId === product.id);
      if (exists) return { items: s.items.map((i) => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i) };
      return { items: [...s.items, { productId: product.id, name: product.name, price: product.price, qty: 1 }] };
    }, false, 'cart/add'),

    changeQty: (productId, delta) => set((s) => ({
      items: s.items
        .map((i) => i.productId === productId ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
        .filter((i) => i.qty > 0),
    }), false, 'cart/qty'),

    removeItem: (productId) =>
      set((s) => ({ items: s.items.filter((i) => i.productId !== productId) }), false, 'cart/remove'),

    clearCart: () => set({ items: [] }, false, 'cart/clear'),

    // Selectors
    getTotal:       () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
    getTotalItems:  () => get().items.reduce((s, i) => s + i.qty, 0),
    getPayload:     () => get().items.map(({ productId, qty }) => ({ productId, qty })),
    getSummaryText: () => get().items.map((i) => `${i.name} x${i.qty}`).join(', '),
  }), { name: 'CartStore' })
);
