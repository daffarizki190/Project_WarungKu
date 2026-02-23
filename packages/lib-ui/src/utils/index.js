// packages/lib-ui/src/utils/index.js
// @warungku/lib-ui — formatting utilities

export const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n ?? 0);

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');

export const getCategoryColor = (cat) => ({
  Makanan: 'bg-orange-500/20 text-orange-400',
  Minuman: 'bg-blue-500/20 text-blue-400',
  Rokok:   'bg-red-500/20 text-red-400',
  Snack:   'bg-yellow-500/20 text-yellow-400',
}[cat] || 'bg-gray-500/20 text-gray-400');
