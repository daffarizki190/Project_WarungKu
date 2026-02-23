import { useState, useEffect } from 'react';
import { useReportStore } from '../lib/stores/report';
import { LoadingSpinner } from '../lib/ui';

const STATUS_COLOR = {
    'Aman': { bg: 'rgba(5,150,105,0.1)', text: '#059669', border: 'rgba(5,150,105,0.2)' },
    'Waspada': { bg: 'rgba(245,158,11,0.1)', text: '#D97706', border: 'rgba(245,158,11,0.2)' },
    'Kritis': { bg: 'rgba(220,38,38,0.1)', text: '#DC2626', border: 'rgba(220,38,38,0.2)' }
};

const DashboardPage = ({ onToast }) => {
    const { predictions, loading, fetchPredictions, downloadPdfReport } = useReportStore();

    // Default to current month/year
    const d = new Date();
    const [reportMonth, setReportMonth] = useState(d.getMonth() + 1);
    const [reportYear, setReportYear] = useState(d.getFullYear());

    useEffect(() => {
        fetchPredictions(30);
    }, [fetchPredictions]);

    const handleDownload = () => {
        onToast('Menyiapkan laporan PDF...', 'info');
        downloadPdfReport(reportYear, reportMonth);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">

            {/* ── HEADER ── */}
            <div>
                <div className="deco-rule mb-2" />
                <h2 className="font-display text-2xl font-bold text-ink">Dashboard Analitik</h2>
                <p className="text-sm text-clay mt-1">AI memprediksi dan merangkum performa warung Anda</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">

                {/* ── KIRI: PREDIKSI STOK (Makan porsi lebih besar) ── */}
                <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg text-ink font-display flex items-center gap-2">
                            <span>🤖</span> Prediksi Stok (30 Hari)
                        </h3>
                        <button onClick={() => fetchPredictions(30)} className="text-xs text-terracotta hover:underline font-semibold">
                            Segarkan
                        </button>
                    </div>

                    <div className="card !p-0 overflow-hidden border">
                        {loading ? (
                            <div className="p-10"><LoadingSpinner text="AI Sedang Menganalisis Data..." /></div>
                        ) : predictions.length === 0 ? (
                            <div className="p-10 text-center text-clay text-sm">Belum ada cukup data transaksi</div>
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
                                        {predictions.slice(0, 10).map((p, i) => {
                                            const s = STATUS_COLOR[p.status] || STATUS_COLOR['Aman'];
                                            return (
                                                <tr key={p.productId} className="hover:bg-cream/50 transition-colors">
                                                    <td className="px-4 py-3 text-sm font-semibold text-ink">{p.name}</td>
                                                    <td className="px-4 py-3 text-sm text-center font-mono">{p.currentStock}</td>
                                                    <td className="px-4 py-3 text-sm text-center font-mono text-clay">{p.totalSoldLast30Days}</td>
                                                    <td className="px-4 py-3 text-sm text-center font-mono text-clay">{p.avgDailySales}</td>
                                                    <td className="px-4 py-3 text-sm text-center">
                                                        {p.estimatedDaysRemaining === null ? (
                                                            <span className="text-xs text-clay italic">Tidak Valid</span>
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
                                * Berdasarkan rata-rata algoritma dari penjualan 30 hari ke belakang.
                            </div>
                        )}
                    </div>
                </div>

                {/* ── KANAN: GENERATOR LAPORAN ── */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-ink font-display flex items-center gap-2">
                        <span>📄</span> Cetak Laporan PDF
                    </h3>

                    <div className="card space-y-4">
                        <p className="text-sm text-clay leading-relaxed">
                            Unduh rincian laba rugi bulanan dan daftar transaksi untuk keperluan pembukuan warung.
                        </p>

                        <div className="flex gap-2">
                            <select
                                value={reportMonth}
                                onChange={(e) => setReportMonth(Number(e.target.value))}
                                className="input-field flex-1 !py-2 !text-sm"
                            >
                                {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, i) => (
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
                            ⬇️ Unduh PDF Laporan
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardPage;
