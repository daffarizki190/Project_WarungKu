// client/src/components/produk/ProductForm.jsx — redesigned

import { useState, useEffect } from 'react';
import { Input } from '../../lib/ui';

const INIT = { name: '', category: '', price: '', stock: '' };
const CATEGORIES = ['Makanan', 'Minuman', 'Rokok', 'Snack', 'Lainnya'];

const ProductForm = ({ product, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(product ? { name: product.name, category: product.category, price: product.price, stock: product.stock } : INIT);
    setErrors({});
  }, [product]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nama wajib diisi';
    if (!form.category.trim()) e.category = 'Kategori wajib diisi';
    if (form.price === '' || Number(form.price) < 0) e.price = 'Harga tidak valid';
    if (form.stock === '' || Number(form.stock) < 0) e.stock = 'Stok tidak valid';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ name: form.name, category: form.category, price: Number(form.price), stock: Number(form.stock) });
  };

  const set = (f) => (e) => {
    setForm((p) => ({ ...p, [f]: e.target.value }));
    if (errors[f]) setErrors((p) => ({ ...p, [f]: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input label="Nama Produk" placeholder="contoh: Mie Goreng Spesial" value={form.name} onChange={set('name')} error={errors.name} autoFocus />

      <div>
        <p className="text-xs font-semibold text-clay uppercase tracking-wider mb-2">Kategori</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button type="button" key={c} onClick={() => { setForm(p => ({ ...p, category: c })); setErrors(p => ({ ...p, category: '' })); }}
              className="px-4 py-2 rounded-2xl text-sm font-semibold transition-all"
              style={{
                background: form.category === c ? '#059669' : '#E2E8F0',
                color: form.category === c ? '#F8FAFC' : '#64748B',
                border: `1px solid ${form.category === c ? '#047857' : '#CBD5E1'}`,
              }}>
              {c}
            </button>
          ))}
          {/* Custom input */}
          <input placeholder="Lainnya..." value={!CATEGORIES.includes(form.category) ? form.category : ''}
            onChange={(e) => { setForm(p => ({ ...p, category: e.target.value })); setErrors(p => ({ ...p, category: '' })); }}
            className="px-4 py-2 rounded-2xl text-sm border border-sand-dark outline-none focus:border-terracotta transition-all bg-white placeholder:text-clay/40 text-ink"
            style={{ width: '120px' }} />
        </div>
        {errors.category && <p className="text-xs text-red-500 font-medium mt-1.5">{errors.category}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Harga (Rp)" type="number" placeholder="5000" min="0" value={form.price} onChange={set('price')} error={errors.price} />
        <Input label="Stok" type="number" placeholder="0" min="0" value={form.stock} onChange={set('stock')} error={errors.stock} />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 btn-secondary">Batal</button>
        <button type="submit" disabled={loading} className="flex-1 btn-primary">
          {loading ? 'Menyimpan...' : product ? 'Perbarui Produk' : 'Tambah Produk'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
