// client/src/pages/ProdukPage.jsx — dengan fitur tambah stok cepat

import { useState, useEffect, useCallback } from 'react';
import { useProductStore } from '../lib/stores/product';
import { useAuthStore } from '../lib/stores/auth';
import { Modal, LoadingSpinner, Badge, StatCard, useModal, formatRupiah, getCategoryColor } from '../lib/ui';
import ProductForm from '../components/produk/ProductForm';
import StockModal from '../components/produk/StockModal';

const LOW_STOCK_THRESHOLD = 5;

const ProdukPage = ({ onToast }) => {
  const { products, loading, fetchProducts, createProduct, updateProduct, deleteProduct } = useProductStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const formModal = useModal();
  const stockModal = useModal(); // untuk tambah stok cepat
  const [search, setSearch] = useState('');
  const [formLoad, setFormLoad] = useState(false);

  useEffect(() => {
    fetchProducts();
    const onFocus = () => fetchProducts();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchProducts]);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const maxStock = Math.max(...products.map((p) => p.stock), 1);
  const lowCount = products.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length;
  const outCount = products.filter((p) => p.stock === 0).length;

  const handleSubmit = useCallback(async (data) => {
    setFormLoad(true);
    try {
      formModal.data ? await updateProduct(formModal.data.id, data) : await createProduct(data);
      onToast(formModal.data ? 'Produk diperbarui' : 'Produk ditambahkan');
      formModal.close();
    } catch (err) { onToast(err.message, 'error'); }
    finally { setFormLoad(false); }
  }, [formModal, createProduct, updateProduct, onToast]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Hapus produk ini?')) return;
    try { await deleteProduct(id); onToast('Produk dihapus'); }
    catch (err) { onToast(err.message, 'error'); }
  }, [deleteProduct, onToast]);

  const handleStockUpdate = useCallback(async ({ stock }) => {
    setFormLoad(true);
    try {
      await updateProduct(stockModal.data.id, { ...stockModal.data, stock });
      onToast(`Stok ${stockModal.data.name} ditambah`);
      stockModal.close();
    } catch (err) { onToast(err.message, 'error'); }
    finally { setFormLoad(false); }
  }, [stockModal, updateProduct, onToast]);

  return (
    <div className="space-y-5">
      {/* Alert stok rendah */}
      {(lowCount > 0 || outCount > 0) && (
        <div className="flex items-start gap-3 p-4 rounded-2xl"
          style={{ background: '#FEF3C7', border: '1px solid #FCD34D' }}>
          <span className="text-xl mt-0.5">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Perhatian Stok</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {outCount > 0 && <span>{outCount} produk <b>habis</b>. </span>}
              {lowCount > 0 && <span>{lowCount} produk <b>hampir habis</b> (≤{LOW_STOCK_THRESHOLD} unit). </span>}
              Segera restok untuk menghindari kehabisan.
            </p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-clay text-sm">⌕</span>
          <input className="w-full input-field pl-10" placeholder="Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {isAdmin && (
          <button onClick={() => formModal.open(null)} className="btn-primary w-full sm:w-auto shrink-0">+ Tambah Produk</button>
        )}
      </div>

      {loading ? <LoadingSpinner text="Memuat produk..." /> : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-clay">
          <div className="w-16 h-16 rounded-3xl bg-sand flex items-center justify-center text-2xl mb-4">📦</div>
          <p className="text-sm font-medium mb-5">Belum ada produk</p>
          {isAdmin && (
            <button onClick={() => formModal.open(null)} className="btn-primary">+ Tambah Produk</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p, i) => (
            <div key={p.id} className="card animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
              {/* Category + status */}
              <div className="flex items-center justify-between mb-3">
                <span className={`pill text-[10px] font-bold tracking-wide ${getCategoryColor(p.category)}`}>{p.category}</span>
                {p.stock === 0 && <Badge variant="danger">Habis</Badge>}
                {p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD && <Badge variant="warning">Tipis</Badge>}
              </div>

              <h3 className="font-body font-semibold text-sm text-ink leading-snug mb-1.5">{p.name}</h3>
              <p className="font-display font-bold text-terracotta text-xl mb-4">{formatRupiah(p.price)}</p>

              {/* Stock bar */}
              <div className="mb-4">
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-clay font-medium">Stok</span>
                  <span className={`text-xs font-bold ${p.stock === 0 ? 'text-red-600' : p.stock <= LOW_STOCK_THRESHOLD ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {p.stock} unit
                  </span>
                </div>
                <div className="h-1.5 bg-sand rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (p.stock / maxStock) * 100)}%`,
                      background: p.stock === 0 ? '#DC2626' : p.stock <= LOW_STOCK_THRESHOLD ? '#F59E0B' : '#059669',
                    }} />
                </div>
              </div>

              {/* Action buttons */}
              {isAdmin && (
                <div className="flex gap-2 pt-3 border-t border-sand">
                  {/* Tombol tambah stok cepat */}
                  <button
                    onClick={() => stockModal.open(p)}
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-2 rounded-xl border transition-all"
                    style={{ background: '#F0FDF4', color: '#059669', border: '1px solid #BBF7D0' }}
                    title="Tambah stok"
                  >
                    + Stok
                  </button>
                  <button onClick={() => formModal.open(p)} className="btn-edit flex-1 text-xs py-2">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="btn-danger text-xs py-2 px-3">Hapus</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal edit/tambah produk */}
      <Modal isOpen={formModal.isOpen} onClose={formModal.close} title={formModal.data ? 'Edit Produk' : 'Produk Baru'}>
        <ProductForm product={formModal.data} onSubmit={handleSubmit} onCancel={formModal.close} loading={formLoad} />
      </Modal>

      {/* Modal tambah stok cepat */}
      <Modal isOpen={stockModal.isOpen} onClose={stockModal.close} title="Tambah Stok">
        <StockModal product={stockModal.data} onSubmit={handleStockUpdate} onCancel={stockModal.close} loading={formLoad} />
      </Modal>
    </div>
  );
};

export default ProdukPage;
