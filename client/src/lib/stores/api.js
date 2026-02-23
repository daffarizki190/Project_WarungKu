import { useAuthStore } from './auth';

export const apiFetch = async (path, opts = {}) => {
    const { token, logout } = useAuthStore.getState();

    const headers = {
        'Content-Type': 'application/json',
        ...(opts.headers || {})
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const res = await fetch(`/api${path}`, { ...opts, headers });
        const json = await res.json();

        // Auto logout jika token ditolak
        if (res.status === 401) {
            logout();
            throw new Error(json.message || 'Sesi telah berakhir');
        }

        if (!json.success) throw new Error(json.message);
        return json.data;
    } catch (error) {
        throw error;
    }
};
