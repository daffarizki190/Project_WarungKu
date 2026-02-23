// client/src/components/layout/BottomNav.jsx
// Navigasi bawah untuk layar mobile (<lg). Tersembunyi di desktop.
// Di mobile, tampilkan 5 item utama: Kasir, Produk, Hutang, Riwayat, + "Lainnya" untuk halaman extra

import { useState } from 'react';
import { Modal } from '../../lib/ui';

const MAIN_NAV = [
    { key: 'kasir', label: 'Kasir', icon: '⊹' },
    { key: 'produk', label: 'Produk', icon: '◈' },
    { key: 'hutang', label: 'Hutang', icon: '◎' },
    { key: 'riwayat', label: 'Riwayat', icon: '◷' },
];

const MORE_NAV = [
    { key: 'dashboard', label: 'Dashboard AI & Laporan', icon: '📊' },
    { key: 'pelanggan', label: 'Pelanggan', icon: '◉' },
    { key: 'backup', label: 'Backup & Restore', icon: '⊜' },
];

const BottomNav = ({ activePage, onNavigate }) => {
    const [showMore, setShowMore] = useState(false);
    const isMoreActive = MORE_NAV.some((n) => n.key === activePage);

    const handleNavigate = (key) => {
        onNavigate(key);
        setShowMore(false);
    };

    return (
        <>
            <nav
                className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around"
                style={{
                    background: 'linear-gradient(160deg, #022C22 0%, #064E3B 100%)',
                    borderTop: '1px solid rgba(16,185,129,0.15)',
                    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                }}
            >
                {MAIN_NAV.map(({ key, label, icon }) => {
                    const active = activePage === key;
                    return (
                        <button
                            key={key}
                            onClick={() => onNavigate(key)}
                            className="flex flex-col items-center justify-center gap-0.5 py-2.5 flex-1 relative transition-all duration-200"
                        >
                            <span className="text-xl leading-none transition-transform duration-200"
                                style={{ color: active ? '#34D399' : '#64748B', transform: active ? 'scale(1.15)' : 'scale(1)' }}>
                                {icon}
                            </span>
                            <span className="text-[10px] font-semibold leading-none" style={{ color: active ? '#34D399' : '#475569' }}>
                                {label}
                            </span>
                            {active && <span className="absolute bottom-0 w-8 h-0.5 rounded-full" style={{ background: '#10B981' }} />}
                        </button>
                    );
                })}

                {/* "Lainnya" tombol */}
                <button
                    onClick={() => setShowMore(true)}
                    className="flex flex-col items-center justify-center gap-0.5 py-2.5 flex-1 relative transition-all duration-200"
                >
                    <span className="text-xl leading-none" style={{ color: isMoreActive ? '#34D399' : '#64748B' }}>⋯</span>
                    <span className="text-[10px] font-semibold leading-none" style={{ color: isMoreActive ? '#34D399' : '#475569' }}>
                        Lainnya
                    </span>
                    {isMoreActive && <span className="absolute bottom-0 w-8 h-0.5 rounded-full" style={{ background: '#10B981' }} />}
                </button>
            </nav>

            {/* Sheet "Lainnya" */}
            {showMore && (
                <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setShowMore(false)} />
                    <div className="relative rounded-t-3xl overflow-hidden p-5 space-y-2"
                        style={{ background: '#022C22', border: '1px solid rgba(16,185,129,0.15)' }}>
                        <div className="w-10 h-1 bg-emerald-900/50 rounded-full mx-auto mb-4" />
                        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#64748B' }}>Menu Lainnya</p>
                        {MORE_NAV.map(({ key, label, icon }) => (
                            <button key={key} onClick={() => handleNavigate(key)}
                                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all"
                                style={{
                                    background: activePage === key ? 'rgba(5,150,105,0.15)' : 'rgba(255,255,255,0.04)',
                                    border: `1px solid ${activePage === key ? 'rgba(5,150,105,0.2)' : 'rgba(16,185,129,0.06)'}`,
                                }}>
                                <span className="text-lg" style={{ color: activePage === key ? '#34D399' : '#94A3B8' }}>{icon}</span>
                                <span className="text-sm font-semibold" style={{ color: activePage === key ? '#F8FAFC' : '#94A3B8' }}>{label}</span>
                            </button>
                        ))}
                        <button onClick={() => setShowMore(false)}
                            className="w-full py-3 rounded-2xl text-xs font-semibold mt-2"
                            style={{ background: 'rgba(255,255,255,0.04)', color: '#64748B' }}>
                            Tutup
                        </button>
                        {/* safe-area padding */}
                        <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
                    </div>
                </div>
            )}
        </>
    );
};

export default BottomNav;
