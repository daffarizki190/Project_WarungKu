// client/src/pages/BackupPage.jsx
// Backup & restore data JSON warung

import { useState } from 'react';

const BackupPage = ({ onToast }) => {
    const [restoreLoading, setRestoreLoading] = useState(false);
    const [restoreFile, setRestoreFile] = useState(null);

    // ── Download backup ──────────────────────────────────────────────────────────
    const handleDownload = async () => {
        try {
            const res = await fetch('/api/backup');
            if (!res.ok) throw new Error('Gagal mengunduh backup');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const date = new Date().toISOString().slice(0, 10);
            a.href = url;
            a.download = `warungku-backup-${date}.json`;
            a.click();
            URL.revokeObjectURL(url);
            onToast('Backup berhasil diunduh');
        } catch (err) { onToast(err.message, 'error'); }
    };

    // ── Upload & restore ─────────────────────────────────────────────────────────
    const handleRestore = async () => {
        if (!restoreFile) return;
        if (!window.confirm('Restore akan mengganti SEMUA data saat ini. Lanjutkan?')) return;
        setRestoreLoading(true);
        try {
            const text = await restoreFile.text();
            const res = await fetch('/api/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: text,
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            onToast('Data berhasil direstore! Halaman akan dimuat ulang.', 'success');
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) { onToast(err.message, 'error'); }
        finally { setRestoreLoading(false); setRestoreFile(null); }
    };

    return (
        <div className="space-y-6 max-w-xl mx-auto">
            <div>
                <div className="deco-rule mb-2" />
                <h2 className="font-display text-xl font-bold text-ink">Backup & Restore</h2>
                <p className="text-xs text-clay mt-0.5">Kelola data WarungKu Anda dengan aman</p>
            </div>

            {/* ── Backup section ── */}
            <div className="card space-y-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl shrink-0">
                        💾
                    </div>
                    <div>
                        <h3 className="font-semibold text-ink">Download Backup</h3>
                        <p className="text-xs text-clay mt-1">
                            Unduh semua data (produk, transaksi, hutang, pelanggan, kategori) sebagai satu file JSON.
                            Simpan di tempat yang aman.
                        </p>
                    </div>
                </div>
                <button onClick={handleDownload} className="btn-success w-full">
                    ⬇ Download Backup Sekarang
                </button>
            </div>

            {/* ── Restore section ── */}
            <div className="card space-y-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shrink-0">
                        📤
                    </div>
                    <div>
                        <h3 className="font-semibold text-ink">Restore Data</h3>
                        <p className="text-xs text-clay mt-1">
                            Upload file backup JSON untuk mengembalikan data. <span className="font-semibold text-amber-700">Perhatian: semua data saat ini akan ditimpa.</span>
                        </p>
                    </div>
                </div>

                {/* File picker */}
                <label className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-dashed border-sand-dark cursor-pointer hover:border-terracotta/40 transition-colors">
                    <span className="text-2xl">📁</span>
                    <div className="flex-1 min-w-0">
                        {restoreFile ? (
                            <p className="text-sm font-semibold text-ink truncate">{restoreFile.name}</p>
                        ) : (
                            <p className="text-sm text-clay">Klik untuk pilih file backup (.json)</p>
                        )}
                    </div>
                    <input
                        type="file"
                        accept=".json,application/json"
                        className="hidden"
                        onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                    />
                </label>

                <button
                    onClick={handleRestore}
                    disabled={!restoreFile || restoreLoading}
                    className="btn-primary w-full disabled:opacity-40"
                    style={{ background: restoreFile ? '#D97706' : undefined }}
                >
                    {restoreLoading ? 'Memproses...' : '⬆ Restore Data'}
                </button>
            </div>

            {/* Info box */}
            <div className="p-4 rounded-2xl" style={{ background: '#FEF3C7', border: '1px solid #FCD34D' }}>
                <p className="text-xs text-amber-800 font-semibold mb-1">💡 Tips Backup</p>
                <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                    <li>Lakukan backup rutin minimal 1x seminggu</li>
                    <li>Simpan file backup di cloud (Google Drive, dll)</li>
                    <li>File backup tidak mengandung password atau data sensitif</li>
                </ul>
            </div>
        </div>
    );
};

export default BackupPage;
