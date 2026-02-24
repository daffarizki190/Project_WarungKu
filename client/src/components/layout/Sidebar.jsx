// client/src/components/layout/Sidebar.jsx — redesigned

import { useCookiePrefs } from '../../lib/ui';
import { useAuthStore } from '../../lib/stores/auth';

const NAV = [
  { key: 'kasir', label: 'Kasir', sub: 'Point of Sale', icon: '⊹' },
  { key: 'produk', label: 'Produk', sub: 'Manajemen', icon: '◈' },
  { key: 'hutang', label: 'Hutang', sub: 'Pelanggan', icon: '◎' },
  { key: 'pelanggan', label: 'Pelanggan', sub: 'Database', icon: '◉' },
  { key: 'dashboard', label: 'Dashboard', sub: 'Laporan AI', icon: '📊', adminOnly: true },
  { key: 'riwayat', label: 'Riwayat', sub: 'Transaksi', icon: '◷', adminOnly: true },
  { key: 'backup', label: 'Backup', sub: 'Data & Restore', icon: '⊜', adminOnly: true },
];

const Sidebar = ({ activePage, onNavigate }) => {
  const { shopName, ownerName } = useCookiePrefs();
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    if (window.confirm('Keluar dari akun?')) logout();
  };

  return (
    <aside className="hidden lg:flex w-[240px] min-h-screen flex-col shrink-0 relative"
      style={{
        background: 'linear-gradient(160deg, #022C22 0%, #064E3B 60%, #047857 100%)',
        borderRight: '1px solid rgba(16,185,129,0.12)',
      }}>

      {/* Decorative top pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.04]"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #34D399 0px, #34D399 1px, transparent 0px, transparent 50%)',
          backgroundSize: '8px 8px',
        }} />

      {/* Logo area */}
      <div className="px-6 pt-8 pb-7">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-xs font-bold"
            style={{ boxShadow: '0 4px 12px rgba(5,150,105,0.4)' }}>W</div>
          <span className="font-display text-xl font-bold italic"
            style={{ color: '#F8FAFC', letterSpacing: '-0.02em' }}>WarungKu</span>
        </div>
        <p className="text-xs pl-9" style={{ color: '#64748B', letterSpacing: '0.1em' }}>KASIR DIGITAL</p>
      </div>

      {/* Divider */}
      <div className="mx-6 mb-6" style={{ height: '1px', background: 'linear-gradient(90deg, rgba(16,185,129,0.3) 0%, transparent 100%)' }} />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV.map(({ key, label, sub, icon, adminOnly }) => {
          if (adminOnly && !isAdmin) return null;

          const isActive = activePage === key;
          return (
            <button key={key} onClick={() => onNavigate(key)}
              CLASS_WILL_BE_REPLACED_BELOW_PROPERLY
              className="w-full text-left px-4 py-3.5 rounded-2xl transition-all duration-200 group relative"
              style={{
                background: isActive ? 'rgba(5,150,105,0.18)' : 'transparent',
                border: isActive ? '1px solid rgba(5,150,105,0.25)' : '1px solid transparent',
              }}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-7 rounded-r-full bg-emerald-500" />
              )}
              <div className="flex items-center gap-3">
                <span className="text-base w-5 text-center transition-transform group-hover:scale-110"
                  style={{ color: isActive ? '#34D399' : '#64748B' }}>{icon}</span>
                <div>
                  <p className="text-sm font-semibold leading-none mb-0.5 transition-colors"
                    style={{ color: isActive ? '#F8FAFC' : '#94A3B8' }}>{label}</p>
                  <p className="text-[10px] leading-none"
                    style={{ color: isActive ? '#6EE7B7' : '#475569' }}>{sub}</p>
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom user info + Logout */}
      <div className="mx-3 mb-6 space-y-2">
        <div className="p-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(16,185,129,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: 'rgba(5,150,105,0.2)', color: '#34D399', border: '1px solid rgba(5,150,105,0.25)' }}>
              {ownerName[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate leading-none mb-1"
                style={{ color: '#F1F5F9' }}>{shopName}</p>
              <p className="text-[10px] truncate"
                style={{ color: '#64748B' }}>{ownerName}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-200 group"
          style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}
        >
          <span className="text-base w-5 text-center" style={{ color: '#F87171' }}>⏻</span>
          <span className="text-sm font-semibold" style={{ color: '#F87171' }}>Keluar</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
