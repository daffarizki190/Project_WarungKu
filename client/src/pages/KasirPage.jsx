// client/src/pages/KasirPage.jsx

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useProductStore } from '../lib/stores/product';
import { useCartStore } from '../lib/stores/cart';
import { useTransactionStore } from '../lib/stores/transaction';
import { useDebtStore } from '../lib/stores/debt';
import { Modal, LoadingSpinner, useModal } from '../lib/ui';
import ProductCard from '../components/kasir/ProductCard';
import CartPanel from '../components/kasir/CartPanel';
import ReceiptModal from '../components/kasir/ReceiptModal';
import DebtForm from '../components/hutang/DebtForm';

const KasirPage = ({ onToast }) => {
  const { products, categories, loading, fetchProducts } = useProductStore();
  const { addItem, getPayload, getSummaryText, clearCart, getTotal, getTotalItems } = useCartStore();
  const { createTransaction } = useTransactionStore();
  const { createDebt } = useDebtStore();
  const debtModal = useModal();

  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('Semua');
  const [formLoad, setFormLoad] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [receipt, setReceipt] = useState(null); // data struk setelah checkout
  const [sharedDebt, setSharedDebt] = useState(null); // data hutang untuk di-share WA setelah sukses buat

  useEffect(() => {
    fetchProducts();
    const onFocus = () => fetchProducts();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchProducts]);

  const filtered = useMemo(() =>
    products
      .filter((p) => activeCat === 'Semua' || p.category === activeCat)
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [products, activeCat, search]
  );

  const handleCheckout = useCallback(async ({ amountPaid, discount = 0, paymentMethod = 'CASH' }) => {
    try {
      const tx = await createTransaction({ items: getPayload(), amountPaid, discount, paymentMethod });
      clearCart();
      await fetchProducts();
      setShowCart(false);
      setReceipt(tx); // tampilkan struk
    } catch (err) { onToast(err.message, 'error'); }
  }, [createTransaction, getPayload, clearCart, fetchProducts]);

  const handleAddAsDebt = useCallback(() => {
    debtModal.open({ amount: getTotal(), description: getSummaryText() });
    setShowCart(false);
  }, [debtModal, getTotal, getSummaryText]);

  const handleSaveDebt = useCallback(async (data) => {
    setFormLoad(true);
    try {
      const newDebt = await createDebt(data);
      onToast('Hutang dicatat', 'success');
      debtModal.close();
      clearCart();
      setSharedDebt(newDebt); // memunculkan dialog cetak/share via WA
    } catch (err) { onToast(err.message, 'error'); }
    finally { setFormLoad(false); }
  }, [createDebt, debtModal, clearCart, onToast]);

  const handleShareWa = useCallback(() => {
    if (!sharedDebt) return;
    const text = `Informasi Nota WarungKu\n--------------------------------\nAtas nama: *${sharedDebt.customerName}*\n\nRincian belanja hari ini:\n${sharedDebt.description}\n\n*Total Tagihan Masuk: Rp ${sharedDebt.amount.toLocaleString('id-ID')}*\n${sharedDebt.dueDate ? `Jatuh tempo: ${new Date(sharedDebt.dueDate).toLocaleDateString('id-ID')}\n` : ''}\nTerima kasih atas kunjungannya! 😊`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }, [sharedDebt]);

  const totalItems = getTotalItems();

  return (
    <>
      {/* Container utama KasirPage perlu menjadi relative agar FAB dengan absolute position dapat menempel pada sudut kanan bawah */}
      <div className="relative">
        {/* ── Desktop: 2 kolom | Mobile: 1 kolom ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-stretch">

          {/* ── Kiri: Product Browser ── */}
          <div className="flex flex-col">

            {/* Search */}
            <div className="relative mb-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-clay text-sm">⌕</span>
              <input
                className="w-full input-field pl-10 pr-10"
                placeholder="Cari nama produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-clay hover:text-ink text-xs font-bold transition-colors">✕</button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex gap-2 flex-wrap mb-4">
              {['Semua', ...categories].map((c) => (
                <button key={c} onClick={() => setActiveCat(c)}
                  className="px-3 py-1.5 rounded-2xl text-xs font-semibold border transition-all duration-150"
                  style={{
                    background: activeCat === c ? '#059669' : '#FFFFFF',
                    color: activeCat === c ? '#F8FAFC' : '#64748B',
                    border: `1px solid ${activeCat === c ? '#047857' : '#E2E8F0'}`,
                    boxShadow: activeCat === c ? '0 2px 8px rgba(5,150,105,0.3)' : 'none',
                  }}>
                  {c}
                </button>
              ))}
            </div>

            {/* Grid produk */}
            <div>
              {loading ? (
                <LoadingSpinner text="Memuat produk..." />
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-clay">
                  <div className="w-16 h-16 rounded-3xl bg-sand flex items-center justify-center text-2xl mb-4">📦</div>
                  <p className="text-sm font-medium">Produk tidak ditemukan</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pb-2">
                  {filtered.map((p) => <ProductCard key={p.id} product={p} onAdd={addItem} />)}
                </div>
              )}
            </div>
          </div>

          {/* ── Kanan: Cart Panel (desktop only) ── */}
          <div className="hidden lg:block">
            <div className="sticky top-6 h-[calc(100vh-140px)] z-10 transition-all duration-300">
              <CartPanel onCheckout={handleCheckout} onAddAsDebt={handleAddAsDebt} />
            </div>
          </div>
        </div>

        {/* ── FAB cart (mobile only) — using fixed to stick to viewport ── */}
        <button
          onClick={() => setShowCart(true)}
          className="lg:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #059669, #047857)', boxShadow: '0 4px 20px rgba(5,150,105,0.5)' }}>
          <span className="text-white text-xl">🛒</span>
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: '#DC2626' }}>{totalItems}</span>
          )}
        </button>
      </div>

      {/* ── Cart Drawer (mobile only) ── */}
      {showCart && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="relative rounded-t-3xl overflow-hidden" style={{ maxHeight: '90dvh' }}>
            <CartPanel onCheckout={handleCheckout} onAddAsDebt={handleAddAsDebt} onClose={() => setShowCart(false)} />
          </div>
        </div>
      )}

      {/* ── Receipt Modal ── */}
      {receipt && <ReceiptModal transaction={receipt} onClose={() => setReceipt(null)} />}

      {/* ── Debt Modal ── */}
      <Modal isOpen={debtModal.isOpen} onClose={debtModal.close} title="Catat sebagai Hutang">
        <DebtForm initialData={debtModal.data} onSubmit={handleSaveDebt} onCancel={debtModal.close} loading={formLoad} />
      </Modal>

      {/* ── Share WA Modal ── */}
      <Modal isOpen={!!sharedDebt} onClose={() => setSharedDebt(null)} title="Hutang Berhasil Dicatat!">
        <div className="flex flex-col items-center justify-center p-4 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-4xl mb-2">✅</div>
          <p className="text-sm text-ink mb-4 font-medium">Buku Kasbon sudah diperbarui. Apakah Anda ingin langsung mengirimkan rincian nota tagihan ini ke WhatsApp pelanggan?</p>
          <div className="w-full flex gap-3">
            <button onClick={() => setSharedDebt(null)} className="flex-1 btn-secondary text-xs">Tutup Saja</button>
            <button onClick={handleShareWa} className="flex-1 btn-primary bg-[#25D366] hover:bg-[#1DA851] text-xs">Kirim via WA</button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default KasirPage;
