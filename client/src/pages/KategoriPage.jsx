// client/src/pages/KategoriPage.jsx

import { useState, useEffect, useCallback } from 'react';
import { useCategoryStore } from '../lib/stores/category';
import { useAuthStore } from '../lib/stores/auth';
import { Modal, LoadingSpinner, useModal } from '../lib/ui';

const PRESET_COLORS = [
    '#059669', '#10B981', '#D97706', '#2563EB',
    '#7C3AED', '#DB2777', '#0891B2', '#65A30D',
];

const KategoriForm = ({ category, onSubmit, onCancel, loading }) => {
    const [name, setName] = useState(category?.name || '');
    const [color, setColor] = useState(category?.color || '#059669');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSubmit({ name: name.trim(), color });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-clay mb-2 uppercase tracking-wide">Nama Kategori</label>
                <input className="input-field" placeholder="Contoh: Minuman" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </div>
            <div>
                <label className="block text-xs font-semibold text-clay mb-2 uppercase tracking-wide">Warna</label>
                <div className="flex gap-2 flex-wrap">
                    {PRESET_COLORS.map((c) => (
                        <button key={c} type="button"
                            onClick={() => setColor(c)}
                            className="w-8 h-8 rounded-xl transition-all"
                            style={{
                                background: c,
                                outline: color === c ? `3px solid ${c}` : 'none',
                                outlineOffset: '2px',
                                transform: color === c ? 'scale(1.15)' : 'scale(1)',
                            }}
                        />
                    ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-clay">Atau pilih sendiri:</span>
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-sand cursor-pointer" />
                    <span className="text-xs font-mono text-clay">{color}</span>
                </div>
            </div>
            <div className="flex gap-3 pt-2">
                <button type="button" onClick={onCancel} className="btn-secondary flex-1">Batal</button>
                <button type="submit" disabled={!name.trim() || loading} className="btn-primary flex-1">
                    {loading ? 'Menyimpan...' : category ? 'Perbarui' : 'Tambah'}
                </button>
            </div>
        </form>
    );
};

const KategoriPage = ({ onToast }) => {
    const { categories, loading, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategoryStore();
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'admin';
    const formModal = useModal();
    const [formLoad, setFormLoad] = useState(false);

    useEffect(() => {
        fetchCategories();
        const onFocus = () => fetchCategories();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [fetchCategories]);

    const handleSubmit = useCallback(async (data) => {
        setFormLoad(true);
        try {
            formModal.data
                ? await updateCategory(formModal.data.id, data)
                : await createCategory(data);
            onToast(formModal.data ? 'Kategori diperbarui' : 'Kategori ditambahkan');
            formModal.close();
        } catch (err) { onToast(err.message, 'error'); }
        finally { setFormLoad(false); }
    }, [formModal, createCategory, updateCategory, onToast]);

    const handleDelete = useCallback(async (id, name) => {
        if (!window.confirm(`Hapus kategori "${name}"?`)) return;
        try { await deleteCategory(id); onToast('Kategori dihapus'); }
        catch (err) { onToast(err.message, 'error'); }
    }, [deleteCategory, onToast]);

    return (
        <div className="space-y-5">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="deco-rule mb-2" />
                    <h2 className="font-display text-xl font-bold text-ink">Kategori Produk</h2>
                    <p className="text-xs text-clay mt-0.5">Kelola kategori untuk mengorganisir produk</p>
                </div>
                {isAdmin && (
                    <button onClick={() => formModal.open(null)} className="btn-primary">+ Tambah Kategori</button>
                )}
            </div>

            {loading ? <LoadingSpinner text="Memuat kategori..." /> : categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-clay">
                    <div className="w-16 h-16 rounded-3xl bg-sand flex items-center justify-center text-2xl mb-4">🏷️</div>
                    <p className="text-sm font-medium mb-4">Belum ada kategori</p>
                    {isAdmin && (
                        <button onClick={() => formModal.open(null)} className="btn-primary">+ Tambah Kategori</button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat, i) => (
                        <div key={cat.id} className="card flex items-center gap-4 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                            {/* Color swatch */}
                            <div className="w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center text-white text-xl font-bold"
                                style={{ background: cat.color || '#059669' }}>
                                {cat.name[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-ink">{cat.name}</p>
                                <p className="text-xs text-clay font-mono">{cat.color}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                {isAdmin && (
                                    <>
                                        <button onClick={() => formModal.open(cat)} className="btn-edit text-xs py-2 px-3">Edit</button>
                                        <button onClick={() => handleDelete(cat.id, cat.name)} className="btn-danger text-xs py-2 px-3">Hapus</button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={formModal.isOpen} onClose={formModal.close} title={formModal.data ? 'Edit Kategori' : 'Kategori Baru'}>
                <KategoriForm category={formModal.data} onSubmit={handleSubmit} onCancel={formModal.close} loading={formLoad} />
            </Modal>
        </div>
    );
};

export default KategoriPage;
