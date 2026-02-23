// client/src/components/hutang/DebtForm.jsx — redesigned

import { useState, useEffect } from 'react';
import { Input } from '../../lib/ui';

const INIT = { customerName: '', amount: '', description: '', dueDate: '' };

const DebtForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) setForm({ ...INIT, ...initialData });
  }, [initialData]);

  const validate = () => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = 'Nama wajib diisi';
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Jumlah harus lebih dari 0';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, amount: Number(form.amount) });
  };

  const set = (f) => (e) => {
    setForm((p) => ({ ...p, [f]: e.target.value }));
    if (errors[f]) setErrors((p) => ({ ...p, [f]: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input label="Nama Pelanggan" placeholder="contoh: Pak Budi" value={form.customerName} onChange={set('customerName')} error={errors.customerName} autoFocus />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Jumlah Hutang (Rp)" type="number" placeholder="0" min="1" value={form.amount} onChange={set('amount')} error={errors.amount} />
        <Input label="Jatuh Tempo" type="date" value={form.dueDate} onChange={set('dueDate')} />
      </div>
      <Input label="Keterangan (opsional)" placeholder="Mie goreng + es teh..." value={form.description} onChange={set('description')} />
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 btn-secondary">Batal</button>
        <button type="submit" disabled={loading} className="flex-1 btn-primary">
          {loading ? 'Menyimpan...' : 'Catat Hutang'}
        </button>
      </div>
    </form>
  );
};

export default DebtForm;
