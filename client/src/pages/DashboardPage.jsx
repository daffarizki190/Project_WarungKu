import { useState, useEffect, useMemo } from 'react';
import { useProductStore } from '../lib/stores/product';
import { useTransactionStore } from '../lib/stores/transaction';
import { LoadingSpinner, formatRupiah } from '../lib/ui';

const STATUS_COLOR = {
    'Aman': { bg: 'rgba(5,150,105,0.1)', text: '#059669', border: 'rgba(5,150,105,0.2)' },
    'Waspada': { bg: 'rgba(245,158,11,0.1)', text: '#D97706', border: 'rgba(245,158,11,0.2)' },
    'Kritis': { bg: 'rgba(220,38,38,0.1)', text: '#DC2626', border: 'rgba(220,38,38,0.2)' }
};

// Hitung prediksi stok dari data produk & transaksi secara in-memory
const buildPredictions = (products, transactions, days = 30) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    // Hitung penjualan per produk dalam periode days
    const soldMap = {};
    transactions.forEach((tx) => {
        if (!tx.createdAt || new Date(tx.createdAt) < cutoff) return;
        (tx.items || []).forEach((item) => {
            soldMap[item.productId] = (soldMap[item.productId] || 0) + (item.qty || 0);
        });
    });

    return products.map((p) => {
        const totalSold = soldMap[p.id] || 0;
        const avgDaily = parseFloat((totalSold / days).toFixed(2));
        let estimatedDays = null;
        let status = 'Aman';
        if (avgDaily > 0) {
            estimatedDays = Math.floor(p.stock / avgDaily);
            if (estimatedDays <= 7) status = 'Kritis';
            else if (estimatedDays <= 14) status = 'Waspada';
        } else if (p.stock === 0) {
            estimatedDays = 0;
            status = 'Kritis';
        }
        return {
            productId: p.id,
            name: p.name,
            currentStock: p.stock,
            totalSoldLast30Days: totalSold,
            avgDailySales: avgDaily,
            estimatedDaysRemaining: estimatedDays,
            status,
        };
    }).sort((a, b) => (a.estimatedDaysRemaining ?? 9999) - (b.estimatedDaysRemaining ?? 9999));
};

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const DashboardPage = ({ onToast }) => {
    const { products, loading: pLoading, fetchProducts } = useProductStore();
    const { transactions, loading: tLoading, fetchTransactions } = useTransactionStore();

    const d = new Date();
    const [reportMonth, setReportMonth] = useState(d.getMonth() + 1);
    const [reportYear, setReportYear] = useState(d.getFullYear());

    useEffect(() => {
        fetchProducts();
        fetchTransactions();
    }, [fetchProducts, fetchTransactions]);

    const loading = pLoading || tLoading;

    const predictions = useMemo(() => buildPredictions(products, transactions, 30), [products, transactions]);

    const handleDownload = () => {
        onToast('Menyiapkan laporan...', 'info');
        // Hitung data laporan untuk bulan/tahun yang dipilih
        const startDate = new Date(reportYear, reportMonth - 1, 1);
        const endDate = new Date(reportYear, reportMonth, 0, 23, 59, 59);
        const monthTx = transactions.filter((tx) => {
            const d = new Date(tx.createdAt);
            return d >= startDate && d <= endDate;
        });
        const totalRevenue = monthTx.reduce((s, t) => s + (t.totalAmount || 0), 0);
        const totalTx = monthTx.length;

        // Buat teks laporan sederhana
        const rows = monthTx.map((tx, i) =>
            `${i + 1}. ${new Date(tx.createdAt).toLocaleDateString('id-ID')} — ${tx.items?.map(it => `${it.name} x${it.qty}`).join(', ')} — ${formatRupiah(tx.totalAmount)}`
        ).join('\n');

        const content = [
            `LAPORAN WARUNGKU — ${MONTHS[reportMonth - 1]} ${reportYear}`,
            '='.repeat(50),
            `Total Transaksi : ${totalTx}`,
            `Total Pendapatan : ${formatRupiah(totalRevenue)}`,
            '',
            'DETAIL TRANSAKSI:',
            '-'.repeat(50),
            rows || '(tidak ada transaksi)',
        ].join('\n');

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan-warungku-${reportYear}-${String(reportMonth).padStart(2, '0')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        onToast('Laporan berhasil diunduh!');
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">

            {/* ── HEADER ── */}
            <div>
                <div className="deco-rule mb-2" />
                <h2 className="font-display text-2xl font-bold text-ink">Dashboard Analitik</h2>
                <p className="text-sm text-clay mt-1">Prediksi stok dan ringkasan performa warung Anda</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">

                {/* ── KIRI: PREDIKSI STOK ── */}
                <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg text-ink font-display flex items-center gap-2">
                            <span>🤖</span> Prediksi Stok (30 Hari)
                        </h3>
                        <button onClick={() => { fetchProducts(); fetchTransactions(); }} className="text-xs text-terracotta hover:underline font-semibold">
                            Segarkan
                        </button>
                    </div>

                    <div className="card !p-0 overflow-hidden border">
                        {loading ? (
                            <div className="p-10"><LoadingSpinner text="Menganalisis Data..." /></div>
                        ) : predictions.length === 0 ? (
                            <div className="p-10 text-center text-clay text-sm">Belum ada cukup data</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-cream-dark text-xs text-clay uppercase tracking-wider">
                                            <th className="px-4 py-3 font-semibold border-b">Produk</th>
                                            <th className="px-4 py-3 font-semibold border-b text-center">Stok Sisa</th>
                                            <th className="px-4 py-3 font-semibold border-b text-center">Terjual (30h)</th>
                                            <th className="px-4 py-3 font-semibold border-b text-center">Laju / Hari</th>
                                            <th className="px-4 py-3 font-semibold border-b text-center">Prediksi Habis</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-sand">
                                        {predictions.slice(0, 10).map((p) => {
                                            const s = STATUS_COLOR[p.status] || STATUS_COLOR['Aman'];
                                            return (
                                                <tr key={p.productId} className="hover:bg-cream/50 transition-colors">
                                                    <td className="px-4 py-3 text-sm font-semibold text-ink">{p.name}</td>
                                                    <td className="px-4 py-3 text-sm text-center font-mono">{p.currentStock}</td>
                                                    <td className="px-4 py-3 text-sm text-center font-mono text-clay">{p.totalSoldLast30Days}</td>
                                                    <td className="px-4 py-3 text-sm text-center font-mono text-clay">{p.avgDailySales}</td>
                                                    <td className="px-4 py-3 text-sm text-center">
                                                        {p.estimatedDaysRemaining === null ? (
                                                            <span className="text-xs text-clay italic">—</span>
                                                        ) : (
                                                            <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-bold border"
                                                                style={{ background: s.bg, color: s.text, borderColor: s.border }}>
                                                                {p.estimatedDaysRemaining === 0 ? 'Habis!' : `${p.estimatedDaysRemaining} Hari`}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {!loading && predictions.length > 0 && (
                            <div className="bg-cream-dark p-3 text-center text-xs text-clay font-medium border-t">
                                * Berdasarkan rata-rata penjualan 30 hari terakhir
                            </div>
                        )}
                    </div>
                </div>

                {/* ── KANAN: GENERATOR LAPORAN ── */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-ink font-display flex items-center gap-2">
                        <span>📄</span> Unduh Laporan
                    </h3>

                    <div className="card space-y-4">
                        <p className="text-sm text-clay leading-relaxed">
                            Unduh ringkasan transaksi bulanan untuk keperluan pembukuan warung.
                        </p>

                        <div className="flex gap-2">
                            <select
                                value={reportMonth}
                                onChange={(e) => setReportMonth(Number(e.target.value))}
                                className="input-field flex-1 !py-2 !text-sm"
                            >
                                {MONTHS.map((m, i) => (
                                    <option key={i} value={i + 1}>{m}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                value={reportYear}
                                onChange={(e) => setReportYear(Number(e.target.value))}
                                className="input-field w-24 !py-2 !text-sm !text-center"
                            />
                        </div>

                        <button onClick={handleDownload} className="btn-primary w-full py-3">
                            ⬇️ Unduh Laporan
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardPage;
