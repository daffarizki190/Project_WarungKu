import { create } from 'zustand';

const BASE_PY_URL = 'http://localhost:8000/api/py';

export const useReportStore = create((set) => ({
    predictions: [],
    loading: false,
    error: null,

    fetchPredictions: async (days = 30) => {
        set({ loading: true, error: null });
        try {
            const res = await fetch(`${BASE_PY_URL}/predict-stock?days=${days}`);
            if (!res.ok) throw new Error('Gagal mengambil data prediksi');
            const result = await res.json();

            // Urutkan: Kritis dulu, lalu sisa stok
            const sorted = (result.data || []).sort((a, b) => {
                if (a.estimatedDaysRemaining === null) return 1;
                if (b.estimatedDaysRemaining === null) return -1;
                return a.estimatedDaysRemaining - b.estimatedDaysRemaining;
            });

            set({ predictions: sorted, loading: false });
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    downloadPdfReport: (year, month) => {
        // Karena ini file download, kita bisa directly redirect/buka di tab baru
        window.open(`${BASE_PY_URL}/report/pdf?year=${year}&month=${month}`, '_blank');
    }
}));
