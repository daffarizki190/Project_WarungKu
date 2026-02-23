// client/src/pages/PelangganPage.jsx

import { useState, useEffect, useCallback } from 'react';
import { useCustomerStore } from '../lib/stores/customer';
import { Modal, LoadingSpinner, useModal, getInitials } from '../lib/ui';

const CustomerForm = ({ customer, onSubmit, onCancel, loading }) => {
    const [form, setForm] = useState({
        name: customer?.name || '',
        phone: customer?.phone || '',
        address: customer?.address || '',
    });

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-clay mb-2 uppercase tracking-wide">Nama Pelanggan *</label>
                <input className="input-field" placeholder="Nama lengkap" value={form.name} onChange={set('name')} autoFocus />
            </div>
            <div>
                <label className="block text-xs font-semibold text-clay mb-2 uppercase tracking-wide">Nomor HP</label>
                <input className="input-field" type="tel" placeholder="08xx-xxxx-xxxx" value={form.phone} onChange={set('phone')} />
            </div>
            <div>
                <label className="block text-xs font-semibold text-clay mb-2 uppercase tracking-wide">Alamat</label>
                <textarea className="input-field resize-none" rows={2} placeholder="Alamat tinggal (opsional)" value={form.address} onChange={set('address')} />
            </div>
            <div className="flex gap-3 pt-2">
                <button type="button" onClick={onCancel} className="btn-secondary flex-1">Batal</button>
                <button type="submit" disabled={!form.name.trim() || loading} className="btn-primary flex-1">
                    {loading ? 'Menyimpan...' : customer ? 'Perbarui' : 'Simpan'}
                </button>
            </div>
        </form>
    );
};

const PelangganPage = ({ onToast }) => {
    const { customers, loading, fetchCustomers, createCustomer, updateCustomer, deleteCustomer } = useCustomerStore();
    const formModal = useModal();
    const [search, setSearch] = useState('');
    const [formLoad, setFormLoad] = useState(false);

    useEffect(() => {
        fetchCustomers();
        const onFocus = () => fetchCustomers();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [fetchCustomers]);

    const filtered = customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

    const handleSubmit = useCallback(async (data) => {
        setFormLoad(true);
        try {
            formModal.data
                ? await updateCustomer(formModal.data.id, data)
                : await createCustomer(data);
            onToast(formModal.data ? 'Data pelanggan diperbarui' : 'Pelanggan ditambahkan');
            formModal.close();
        } catch (err) { onToast(err.message, 'error'); }
        finally { setFormLoad(false); }
    }, [formModal, createCustomer, updateCustomer, onToast]);

    const handleDelete = useCallback(async (id, name) => {
        if (!window.confirm(`Hapus pelanggan "${name}"?`)) return;
        try { await deleteCustomer(id); onToast('Pelanggan dihapus'); }
        catch (err) { onToast(err.message, 'error'); }
    }, [deleteCustomer, onToast]);

    return (
        <div className="space-y-5">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-clay text-sm">⌕</span>
                    <input className="w-full input-field pl-10" placeholder="Cari nama pelanggan..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <button onClick={() => formModal.open(null)} className="btn-primary w-full sm:w-auto shrink-0">+ Tambah Pelanggan</button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-sm text-clay">
                <span className="pill bg-sand text-clay border border-sand-dark font-semibold">
                    {customers.length} pelanggan
                </span>
                {search && <span>Menampilkan {filtered.length} hasil</span>}
            </div>

            {loading ? <LoadingSpinner text="Memuat data pelanggan..." /> : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-clay">
                    <div className="w-16 h-16 rounded-3xl bg-sand flex items-center justify-center text-2xl mb-4">👥</div>
                    <p className="text-sm font-medium mb-4">
                        {customers.length === 0 ? 'Belum ada data pelanggan' : 'Tidak ada hasil pencarian'}
                    </p>
                    {customers.length === 0 && (
                        <button onClick={() => formModal.open(null)} className="btn-primary">+ Tambah Pelanggan</button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((c, i) => (
                        <div key={c.id} className="card animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                            <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                                    style={{ background: 'rgba(5,150,105,0.1)', color: '#059669', border: '2px solid rgba(5,150,105,0.2)' }}>
                                    {getInitials(c.name)}
                                </div>
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-ink">{c.name}</p>
                                    {c.phone && (
                                        <a href={`tel:${c.phone}`} className="text-xs text-clay hover:text-terracotta transition-colors">
                                            📱 {c.phone}
                                        </a>
                                    )}
                                    {c.address && <p className="text-xs text-clay mt-0.5 truncate">📍 {c.address}</p>}
                                </div>
                                {/* Action buttons */}
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => formModal.open(c)} className="btn-edit text-xs py-2 px-3">Edit</button>
                                    <button onClick={() => handleDelete(c.id, c.name)} className="btn-danger text-xs py-2 px-3">Hapus</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={formModal.isOpen} onClose={formModal.close} title={formModal.data ? 'Edit Pelanggan' : 'Pelanggan Baru'}>
                <CustomerForm customer={formModal.data} onSubmit={handleSubmit} onCancel={formModal.close} loading={formLoad} />
            </Modal>
        </div>
    );
};

export default PelangganPage;
