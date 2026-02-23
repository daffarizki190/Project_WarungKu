// client/src/components/produk/StockModal.jsx
// Mini-modal untuk menambah stok produk dengan cepat

import { useState } from 'react';
import { formatRupiah } from '../../lib/ui';

const StockModal = ({ product, onSubmit, onCancel, loading }) => {
    const [amount, setAmount] = useState('');
    const num = parseInt(amount, 10);
    const valid = !isNaN(num) && num > 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!valid) return;
        onSubmit({ stock: product.stock + num });
    };

    return (
        <div>
            {/* Info produk */}
            <div className="flex items-center gap-3 mb-5 p-4 rounded-2xl bg-sand/40">
                <div className="w-10 h-10 rounded-xl bg-terracotta/10 flex items-center justify-center shrink-0">
                    <span className="text-lg">📦</span>
                </div>
                <div className="min-w-0">
                    <p className="font-semibold text-ink text-sm truncate">{product?.name}</p>
                    <p className="text-xs text-clay">Stok saat ini: <span className="font-bold text-ink">{product?.stock} unit</span></p>
                    <p className="text-xs text-clay">{formatRupiah(product?.price)}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-clay mb-2 uppercase tracking-wide">
                        Jumlah Tambahan Stok
                    </label>
                    <input
                        type="number"
                        min="1"
                        className="input-field text-center text-lg font-bold"
                        placeholder="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        autoFocus
                    />
                    {valid && (
                        <p className="text-xs text-emerald-600 font-medium mt-2 text-center">
                            Stok baru: {product?.stock} + {num} = <span className="font-bold">{product?.stock + num} unit</span>
                        </p>
                    )}
                </div>

                <div className="flex gap-3">
                    <button type="button" onClick={onCancel} className="btn-secondary flex-1">Batal</button>
                    <button
                        type="submit"
                        disabled={!valid || loading}
                        className="btn-primary flex-1"
                    >
                        {loading ? 'Menyimpan...' : `Tambah ${valid ? num + ' unit' : ''}`}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StockModal;
