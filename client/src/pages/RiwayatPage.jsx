// client/src/pages/RiwayatPage.jsx — redesigned

import { useEffect } from 'react';
import { useTransactionStore } from '../lib/stores/transaction';
import { LoadingSpinner, StatCard, formatRupiah, formatDateTime } from '../lib/ui';

const TYPE = {
  SALE: { label: 'Penjualan', bg: '#F0FDF4', color: '#059669', dot: '#059669', border: '#BBF7D0' },
  DEBT_PAYMENT: { label: 'Pelunasan', bg: '#FFF7ED', color: '#D97706', dot: '#D97706', border: '#FED7AA' },
};

const RiwayatPage = () => {
  const { transactions, summary, loading, fetchTransactions } = useTransactionStore();
  useEffect(() => {
    fetchTransactions();
    const onFocus = () => fetchTransactions();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchTransactions]);

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard label="Transaksi Hari Ini" value={summary.transactionCount} color="text-terracotta" icon="📊" />
          <StatCard label="Pendapatan Hari Ini" value={formatRupiah(summary.totalRevenue)} color="text-emerald-600" icon="💰" />
          <StatCard label="Hutang Masuk" value={formatRupiah(summary.totalDebt || 0)} color="text-amber-600" icon="📋" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="deco-rule mb-2" />
          <h2 className="font-display text-xl font-bold text-ink">Semua Transaksi</h2>
        </div>
        <span className="pill bg-sand text-clay border border-sand-dark font-semibold">
          {transactions.length} transaksi
        </span>
      </div>

      {loading ? <LoadingSpinner text="Memuat riwayat..." /> : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-clay">
          <div className="w-16 h-16 rounded-3xl bg-sand flex items-center justify-center text-2xl mb-4">📜</div>
          <p className="text-sm font-medium">Belum ada transaksi</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {transactions.map((tx, i) => {
            const cfg = TYPE[tx.type] || TYPE.SALE;
            return (
              <div key={tx.id} className="card flex items-center gap-4 animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                {/* Type indicator */}
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}` }}>
                  <span className="text-sm font-bold" style={{ color: cfg.color }}>
                    {tx.type === 'SALE' ? '₺' : '✓'}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="pill text-[10px] font-bold border"
                      style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
                      {cfg.label}
                    </span>
                    <p className="text-sm text-ink font-medium truncate">
                      {tx.items.map((i) => `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ''}`).join(', ')}
                    </p>
                  </div>
                  <p className="text-xs text-clay">{formatDateTime(tx.createdAt)}</p>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <p className="font-display font-bold text-xl text-emerald-600">+{formatRupiah(tx.total)}</p>
                  {tx.type === 'SALE' && tx.change > 0 && (
                    <p className="text-xs text-clay mt-0.5">Kembalian {formatRupiah(tx.change)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RiwayatPage;
