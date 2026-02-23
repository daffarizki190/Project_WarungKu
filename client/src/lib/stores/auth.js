import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            loading: false,
            error: null,

            login: async (username, password) => {
                set({ loading: true, error: null });
                try {
                    const res = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });
                    const data = await res.json();

                    if (!data.success) {
                        throw new Error(data.message);
                    }

                    set({
                        token: data.data.token,
                        user: data.data.user,
                        loading: false
                    });

                    return true;
                } catch (err) {
                    set({ error: err.message, loading: false });
                    return false;
                }
            },

            loginKasir: async () => {
                set({ loading: true, error: null });
                try {
                    const res = await fetch('/api/auth/login-kasir', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    const data = await res.json();

                    if (!data.success) {
                        throw new Error(data.message);
                    }

                    set({
                        token: data.data.token,
                        user: data.data.user,
                        loading: false
                    });

                    return true;
                } catch (err) {
                    set({ error: err.message, loading: false });
                    return false;
                }
            },

            logout: () => {
                set({ token: null, user: null, error: null });
            }
        }),
        {
            name: 'wk_auth_session', // persist token to localStorage
        }
    )
);
