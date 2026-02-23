// client/src/lib/ui/utils/index.js

export const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n ?? 0);

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');

export const getCategoryColor = (cat) => ({
  Makanan: 'bg-orange-50 text-orange-700 border border-orange-200',
  Minuman: 'bg-sky-50 text-sky-700 border border-sky-200',
  Rokok:   'bg-red-50 text-red-700 border border-red-200',
  Snack:   'bg-amber-50 text-amber-700 border border-amber-200',
  Lainnya: 'bg-purple-50 text-purple-700 border border-purple-200',
}[cat] || 'bg-sand text-clay border border-sand-dark');
