// client/src/components/kasir/CartPanel.jsx

import { useState } from 'react';
import { useCartStore } from '../../lib/stores/cart';
import { formatRupiah } from '../../lib/ui';

const PAYMENT_METHODS = [
  { key: 'CASH', label: 'Tunai', icon: '💵' },
  { key: 'TRANSFER', label: 'Transfer', icon: '🏦' },
  { key: 'QRIS', label: 'QRIS', icon: '📱' },
];

// onClose: opsional, hanya di mode drawer mobile
const CartPanel = ({ onCheckout, onAddAsDebt, onClose }) => {
  const { items, changeQty, clearCart, getTotal } = useCartStore();
  const [amountPaid, setAmountPaid] = useState('');
  const [discount, setDiscount] = useState('');
  const [discountType, setDiscountType] = useState('nominal'); // 'nominal' | 'percent'
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  const subtotal = getTotal();
  const discountAmt = discountType === 'percent'
    ? Math.round(subtotal * Math.min(100, Math.max(0, Number(discount))) / 100)
    : Math.min(subtotal, Math.max(0, Number(discount)));
  const total = Math.max(0, subtotal - discountAmt);
  const paid = Number(amountPaid);
  const change = paid >= total && paid > 0 ? paid - total : null;
  const shortage = paid > 0 && paid < total ? total - paid : null;
  const totalItems = items.reduce((s, i) => s + i.qty, 0);

  const handleCheckout = () => {
    if (!items.length || paid < total) return;
    onCheckout({ amountPaid: paid, discount: discountAmt, paymentMethod });
    setAmountPaid('');
    setDiscount('');
  };

  return (
    <div className="flex flex-col h-full rounded-3xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #022C22 0%, #064E3B 100%)',
        border: '1px solid rgba(16,185,129,0.12)',
        boxShadow: '0 4px 32px rgba(28,20,16,0.15)',
      }}>

      {/* Header */}
      <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(16,185,129,0.1)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#64748B' }}>Keranjang</p>
            <h3 className="font-display text-xl font-bold italic" style={{ color: '#F8FAFC' }}>Pesanan</h3>
          </div>
          <div className="flex items-center gap-2">
            {totalItems > 0 && (
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold"
                style={{ background: 'rgba(5,150,105,0.25)', color: '#34D399', border: '1px solid rgba(5,150,105,0.3)' }}>
                {totalItems}
              </div>
            )}
            {onClose && (
              <button onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8' }}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 opacity-40">
            <div className="text-3xl mb-3">🛒</div>
            <p className="text-xs font-medium" style={{ color: '#94A3B8' }}>Pilih produk</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.productId}
              className="flex items-center gap-3 rounded-2xl px-3 py-3"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(16,185,129,0.08)' }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate leading-none mb-1.5" style={{ color: '#F1F5F9' }}>{item.name}</p>
                <p className="text-xs font-bold" style={{ color: '#34D399' }}>{formatRupiah(item.price * item.qty)}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => changeQty(item.productId, -1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8' }}>−</button>
                <span className="text-sm font-bold w-5 text-center" style={{ color: '#F8FAFC' }}>{item.qty}</span>
                <button onClick={() => changeQty(item.productId, 1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all"
                  style={{ background: 'rgba(5,150,105,0.2)', color: '#34D399' }}>+</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-5 pt-3 space-y-3 border-t" style={{ borderColor: 'rgba(16,185,129,0.1)' }}>

        {/* Subtotal */}
        {discountAmt > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: '#64748B' }}>Subtotal</span>
            <span className="text-sm font-semibold line-through" style={{ color: '#64748B' }}>{formatRupiah(subtotal)}</span>
          </div>
        )}

        {/* Diskon */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(16,185,129,0.1)' }}>
          <div className="flex">
            <button onClick={() => setDiscountType('nominal')}
              className="flex-1 py-2 text-xs font-semibold transition-all"
              style={{ background: discountType === 'nominal' ? 'rgba(5,150,105,0.2)' : 'rgba(255,255,255,0.03)', color: discountType === 'nominal' ? '#34D399' : '#64748B' }}>
              Rp Diskon
            </button>
            <button onClick={() => setDiscountType('percent')}
              className="flex-1 py-2 text-xs font-semibold transition-all"
              style={{ background: discountType === 'percent' ? 'rgba(5,150,105,0.2)' : 'rgba(255,255,255,0.03)', color: discountType === 'percent' ? '#34D399' : '#64748B' }}>
              % Diskon
            </button>
          </div>
          <div className="relative px-2 pb-2 pt-1">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#94A3B8' }}>
              {discountType === 'percent' ? '%' : 'Rp'}
            </span>
            <input
              type="number" min="0"
              className="w-full rounded-xl px-4 pl-8 py-2 text-sm outline-none"
              placeholder="0"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.05)', color: '#F8FAFC', border: '1px solid rgba(16,185,129,0.1)' }}
            />
          </div>
        </div>

        {/* Metode Pembayaran */}
        <div className="flex gap-2">
          {PAYMENT_METHODS.map(({ key, label, icon }) => (
            <button key={key}
              onClick={() => setPaymentMethod(key)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: paymentMethod === key ? 'rgba(5,150,105,0.25)' : 'rgba(255,255,255,0.04)',
                color: paymentMethod === key ? '#34D399' : '#64748B',
                border: `1px solid ${paymentMethod === key ? 'rgba(5,150,105,0.3)' : 'rgba(16,185,129,0.08)'}`,
              }}>
              <span className="block text-base mb-0.5">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between py-1">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>Total</span>
          <span className="font-display text-2xl font-bold" style={{ color: '#34D399' }}>{formatRupiah(total)}</span>
        </div>

        {/* Payment input */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: '#10B981' }}>Rp</span>
          <input
            type="number"
            className="w-full rounded-2xl px-4 pl-9 py-3.5 text-sm font-semibold outline-none transition-all"
            placeholder="Jumlah bayar"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(16,185,129,0.15)', color: '#F8FAFC' }}
          />
        </div>

        {change !== null && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl"
            style={{ background: 'rgba(5,150,105,0.12)', border: '1px solid rgba(5,150,105,0.2)' }}>
            <span className="text-xs font-semibold" style={{ color: '#6EE7B7' }}>Kembalian</span>
            <span className="text-sm font-bold" style={{ color: '#34D399' }}>{formatRupiah(change)}</span>
          </div>
        )}
        {shortage !== null && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl"
            style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)' }}>
            <span className="text-xs font-semibold" style={{ color: '#FCA5A5' }}>Kurang</span>
            <span className="text-sm font-bold text-red-400">{formatRupiah(shortage)}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button onClick={clearCart}
            className="w-11 h-11 flex items-center justify-center rounded-2xl transition-all shrink-0"
            style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.15)', color: '#FCA5A5' }}>
            ✕
          </button>
          <button
            onClick={handleCheckout}
            disabled={!items.length || !amountPaid || paid < total}
            className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: '#F8FAFC',
              boxShadow: items.length && paid >= total ? '0 4px 20px rgba(5,150,105,0.4)' : 'none',
            }}>
            Bayar Sekarang
          </button>
        </div>

        <button
          onClick={onAddAsDebt}
          disabled={!items.length}
          className="w-full py-3 rounded-2xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(16,185,129,0.15)', color: '#94A3B8' }}>
          Catat sebagai Hutang
        </button>
      </div>
    </div>
  );
};

export default CartPanel;
