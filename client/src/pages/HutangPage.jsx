// client/src/pages/HutangPage.jsx — redesigned

import { useState, useEffect, useCallback } from 'react';
import { useDebtStore } from '../lib/stores/debt';
import { Modal, LoadingSpinner, Badge, StatCard, useModal, formatRupiah, formatDate, getInitials } from '../lib/ui';
import DebtForm from '../components/hutang/DebtForm';

const HutangPage = ({ onToast }) => {
  const { debts, stats, loading, fetchDebts, createDebt, markAsPaid, deleteDebt } = useDebtStore();
  const formModal = useModal();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [formLoad, setFormLoad] = useState(false);

  useEffect(() => {
    fetchDebts();
    const onFocus = () => fetchDebts();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchDebts]);

  const filtered = debts
    .filter((d) => status === 'all' || (status === 'unpaid' && !d.isPaid) || (status === 'paid' && d.isPaid))
    .filter((d) => d.customerName.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = useCallback(async (data) => {
    setFormLoad(true);
    try { await createDebt(data); onToast('Hutang dicatat'); formModal.close(); }
    catch (err) { onToast(err.message, 'error'); }
    finally { setFormLoad(false); }
  }, [createDebt, formModal, onToast]);

  const handlePay = useCallback(async (id) => {
    if (!window.confirm('Tandai sebagai lunas?')) return;
    try { await markAsPaid(id); onToast('Hutang dilunasi'); }
    catch (err) { onToast(err.message, 'error'); }
  }, [markAsPaid, onToast]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Hapus catatan hutang ini?')) return;
    try { await deleteDebt(id); onToast('Data dihapus'); }
    catch (err) { onToast(err.message, 'error'); }
  }, [deleteDebt, onToast]);

  const handleShareWa = useCallback((d) => {
    const text = `Informasi Nota WarungKu\n--------------------------------\nAtas nama: *${d.customerName}*\n\nRincian belanja:\n${d.description || '-'}\n\n*Total Tagihan Masuk: Rp ${d.amount.toLocaleString('id-ID')}*\n${d.dueDate ? `Jatuh tempo: ${new Date(d.dueDate).toLocaleDateString('id-ID')}\n` : ''}\nTerima kasih atas kunjungannya! 😊`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }, []);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total Hutang" value={formatRupiah(stats.totalUnpaid)} color="text-red-600" icon="💸" />
        <StatCard label="Belum Lunas" value={`${stats.unpaidCount} orang`} color="text-amber-600" icon="⏳" />
        <StatCard label="Sudah Lunas" value={`${stats.paidCount} orang`} color="text-emerald-600" icon="✓" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-clay text-sm">⌕</span>
          <input className="w-full input-field pl-10" placeholder="Cari nama pelanggan..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {/* Filter pills + tombol catat: baris kedua di mobile */}
        <div className="flex gap-2 flex-wrap items-center">
          {[['all', 'Semua'], ['unpaid', 'Belum Lunas'], ['paid', 'Lunas']].map(([v, l]) => (
            <button key={v} onClick={() => setStatus(v)}
              className="px-3 py-2 rounded-2xl text-xs font-semibold border transition-all"
              style={{
                background: status === v ? '#059669' : '#FFFFFF',
                color: status === v ? '#F8FAFC' : '#64748B',
                border: `1px solid ${status === v ? '#047857' : '#E2E8F0'}`,
              }}>
              {l}
            </button>
          ))}
          <button onClick={() => formModal.open()} className="btn-primary ml-auto sm:ml-0">+ Catat Hutang</button>
        </div>
      </div>

      {/* List */}
      {loading ? <LoadingSpinner text="Memuat hutang..." /> : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-clay">
          <div className="w-16 h-16 rounded-3xl bg-sand flex items-center justify-center text-2xl mb-4">📋</div>
          <p className="text-sm font-medium">{debts.length === 0 ? 'Belum ada catatan hutang' : 'Tidak ada hasil'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d, i) => (
            <div key={d.id} className="card animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
              {/* Baris atas: avatar + info + nominal */}
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background: d.isPaid ? '#F0FDF4' : '#FEF2F2',
                    color: d.isPaid ? '#059669' : '#DC2626',
                    border: `2px solid ${d.isPaid ? '#BBF7D0' : '#FECACA'}`,
                  }}>
                  {getInitials(d.customerName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-semibold text-ink text-sm">{d.customerName}</p>
                    <Badge variant={d.isPaid ? 'success' : 'danger'}>{d.isPaid ? 'Lunas' : 'Belum Lunas'}</Badge>
                  </div>
                  <p className="text-xs text-clay truncate">
                    {d.description || '—'} · {formatDate(d.createdAt)}
                    {d.dueDate && ` · Tempo: ${formatDate(d.dueDate)}`}
                  </p>
                  {d.paidAt && <p className="text-xs text-emerald-600 font-medium mt-0.5">Dilunasi {formatDate(d.paidAt)}</p>}
                </div>
                <p className={`font-display font-bold text-base sm:text-xl shrink-0 ${d.isPaid ? 'text-clay line-through' : 'text-red-600'}`}>
                  {formatRupiah(d.amount)}
                </p>
              </div>
              {/* Baris bawah: tombol aksi */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-sand items-stretch">
                {!d.isPaid && (
                  <button onClick={() => handlePay(d.id)} className="btn-success flex-1 text-xs py-2">✓ Lunas</button>
                )}
                <button onClick={() => handleShareWa(d)} className="flex-1 btn-primary bg-[#25D366] hover:bg-[#1DA851] text-xs py-2 flex items-center justify-center gap-1 shrink-0" title="Kirim Info via WhatsApp">
                  <span>📱 WA</span>
                </button>
                <button onClick={() => handleDelete(d.id)} className="btn-danger text-xs py-2 px-4 shrink-0">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={formModal.isOpen} onClose={formModal.close} title="Catat Hutang Baru">
        <DebtForm onSubmit={handleSubmit} onCancel={formModal.close} loading={formLoad} />
      </Modal>
    </div>
  );
};

export default HutangPage;
