// client/src/App.jsx

import { useState, useCallback } from 'react';
import { useCookiePrefs } from './lib/ui';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import BottomNav from './components/layout/BottomNav';
import ToastContainer from './components/ToastContainer';
import KasirPage from './pages/KasirPage';
import ProdukPage from './pages/ProdukPage';
import HutangPage from './pages/HutangPage';
import RiwayatPage from './pages/RiwayatPage';
import DashboardPage from './pages/DashboardPage';
import KategoriPage from './pages/KategoriPage';
import PelangganPage from './pages/PelangganPage';
import BackupPage from './pages/BackupPage';
import LoginPage from './pages/LoginPage';
import { useAuthStore } from './lib/stores/auth';

const PAGES = {
  kasir: KasirPage,
  produk: ProdukPage,
  hutang: HutangPage,
  riwayat: RiwayatPage,
  dashboard: DashboardPage,
  kategori: KategoriPage,
  pelanggan: PelangganPage,
  backup: BackupPage,
};

const App = () => {
  const { token } = useAuthStore();
  const { activePage, setActivePage } = useCookiePrefs();
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3200);
  }, []);

  const removeToast = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);
  const ActivePage = PAGES[activePage] || KasirPage;

  if (!token) {
    return <LoginPage />;
  }

  return (
    // Wrapper: flex row di desktop, full-height
    <div className="flex h-screen overflow-hidden" style={{ background: '#F8FAFC' }}>

      {/* Sidebar: hanya desktop (lg+) */}
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      {/* Konten utama */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar activePage={activePage} />

        {/* Scroll area — tambah pb-16 lg:pb-0 agar konten tidak tertutup BottomNav di mobile */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 pb-20 lg:pb-6 relative z-0">
          <div className="min-h-[calc(100vh-140px)] lg:min-h-full flex flex-col">
            <ActivePage onToast={addToast} />
          </div>
        </main>
      </div>

      {/* Bottom nav: hanya mobile (< lg) */}
      <BottomNav activePage={activePage} onNavigate={setActivePage} />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default App;
