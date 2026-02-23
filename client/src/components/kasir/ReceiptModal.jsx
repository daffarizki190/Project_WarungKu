// client/src/components/kasir/ReceiptModal.jsx
// Modal struk transaksi — tampil setelah checkout berhasil
// Mendukung window.print() dengan CSS @media print

import { formatRupiah, formatDateTime } from '../../lib/ui';
import { useCookiePrefs } from '../../lib/ui';

const PAYMENT_LABEL = { CASH: 'Tunai', TRANSFER: 'Transfer', QRIS: 'QRIS' };

const ReceiptModal = ({ transaction, onClose }) => {
    if (!transaction) return null;

    const { shopName } = useCookiePrefs();

    const handlePrint = () => window.print();

    return (
        <>
            {/* Overlay — tersembunyi saat print */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden"
                style={{ background: 'rgba(28,20,16,0.7)', backdropFilter: 'blur(6px)' }}
            >
                <div
                    className="relative w-full max-w-sm rounded-3xl overflow-hidden animate-pop-in"
                    style={{ background: '#FFFFFF', border: '1px solid rgba(148,163,184,0.3)' }}
                >
                    {/* Header struk */}
                    <div className="text-center pt-7 pb-5 px-6" style={{ borderBottom: '1px dashed #E2E8F0' }}>
                        <div className="w-10 h-10 rounded-2xl bg-terracotta flex items-center justify-center text-white font-bold text-sm mx-auto mb-3"
                            style={{ boxShadow: '0 4px 12px rgba(5,150,105,0.4)' }}>W</div>
                        <h2 className="font-display text-xl font-bold text-ink">{shopName}</h2>
                        <p className="text-xs text-clay mt-1">Struk Pembelian</p>
                        <p className="text-xs text-clay">{formatDateTime(transaction.createdAt)}</p>
                    </div>

                    {/* Item list */}
                    <div className="px-6 py-4 space-y-2" style={{ borderBottom: '1px dashed #E2E8F0' }}>
                        {transaction.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                                <span className="text-ink font-medium truncate mr-3">
                                    {item.name} <span className="text-clay">×{item.qty}</span>
                                </span>
                                <span className="font-semibold text-ink shrink-0">{formatRupiah(item.subtotal)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="px-6 py-4 space-y-2" style={{ borderBottom: '1px dashed #E2E8F0' }}>
                        <div className="flex justify-between text-sm text-clay">
                            <span>Subtotal</span>
                            <span>{formatRupiah(transaction.total + transaction.discount)}</span>
                        </div>
                        {transaction.discount > 0 && (
                            <div className="flex justify-between text-sm text-emerald-600">
                                <span>Diskon</span>
                                <span>− {formatRupiah(transaction.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-base text-ink pt-1">
                            <span>Total</span>
                            <span className="text-terracotta">{formatRupiah(transaction.total)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-clay">
                            <span>Bayar ({PAYMENT_LABEL[transaction.paymentMethod] || 'Tunai'})</span>
                            <span>{formatRupiah(transaction.amountPaid)}</span>
                        </div>
                        {transaction.change > 0 && (
                            <div className="flex justify-between text-sm font-semibold text-ink">
                                <span>Kembalian</span>
                                <span>{formatRupiah(transaction.change)}</span>
                            </div>
                        )}
                    </div>

                    {/* Footer struk */}
                    <div className="text-center px-6 py-4 text-xs text-clay">
                        <p>Terima kasih atas pembelian Anda 🙏</p>
                        <p className="mt-0.5">#{transaction.id?.slice(0, 8).toUpperCase()}</p>
                    </div>

                    {/* Tombol aksi */}
                    <div className="flex gap-3 px-6 pb-6">
                        <button
                            onClick={handlePrint}
                            className="flex-1 btn-secondary text-sm"
                        >
                            🖨 Print Struk
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 btn-primary text-sm"
                        >
                            Selesai
                        </button>
                    </div>
                </div>
            </div>

            {/* ── CSS khusus saat print ── */}
            <style>{`
        @media print {
          body > * { display: none !important; }
          .receipt-print { display: block !important; }
        }
      `}</style>

            {/* Versi print (tampil saat window.print) */}
            <div className="receipt-print hidden fixed inset-0 bg-white p-6 text-sm text-black z-[9999]">
                <div className="text-center mb-4">
                    <h1 className="text-lg font-bold">{shopName}</h1>
                    <p>Struk Pembelian</p>
                    <p>{formatDateTime(transaction.createdAt)}</p>
                </div>
                <hr className="border-dashed mb-3" />
                {transaction.items.map((item, i) => (
                    <div key={i} className="flex justify-between mb-1">
                        <span>{item.name} ×{item.qty}</span>
                        <span>{formatRupiah(item.subtotal)}</span>
                    </div>
                ))}
                <hr className="border-dashed my-3" />
                {transaction.discount > 0 && (
                    <div className="flex justify-between mb-1">
                        <span>Diskon</span><span>− {formatRupiah(transaction.discount)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-base mb-1">
                    <span>Total</span><span>{formatRupiah(transaction.total)}</span>
                </div>
                <div className="flex justify-between mb-1">
                    <span>Bayar</span><span>{formatRupiah(transaction.amountPaid)}</span>
                </div>
                {transaction.change > 0 && (
                    <div className="flex justify-between mb-1">
                        <span>Kembalian</span><span>{formatRupiah(transaction.change)}</span>
                    </div>
                )}
                <hr className="border-dashed my-3" />
                <p className="text-center">Terima kasih 🙏</p>
            </div>
        </>
    );
};

export default ReceiptModal;
