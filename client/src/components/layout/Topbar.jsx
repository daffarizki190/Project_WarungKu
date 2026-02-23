// client/src/components/layout/Topbar.jsx

import { useProductStore } from '../../lib/stores/product';

const TITLES = {
  kasir: { label: 'Kasir', sub: 'Proses transaksi harian' },
  produk: { label: 'Produk', sub: 'Kelola inventori warung' },
  hutang: { label: 'Hutang', sub: 'Catatan piutang pelanggan' },
  riwayat: { label: 'Riwayat', sub: 'Rekap semua transaksi' },
};

const Topbar = ({ activePage }) => {
  const count = useProductStore((s) => s.products.length);
  const now = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const { label, sub } = TITLES[activePage] || TITLES.kasir;

  return (
    <header
      className="bg-white/80 border-b border-sand px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between shrink-0"
      style={{ backdropFilter: 'blur(12px)' }}
    >
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-ink leading-none">{label}</h1>
        <p className="text-xs text-clay font-medium mt-0.5">{sub}</p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Tanggal: disembunyikan di layar sangat kecil */}
        <div className="text-right hidden sm:block">
          <p className="text-xs font-medium text-clay capitalize">{now}</p>
        </div>
        <div className="w-px h-8 bg-sand-dark hidden sm:block" />
        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-terracotta/8 border border-terracotta/15">
          <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
          <span className="text-xs font-semibold text-terracotta">{count} Produk</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
