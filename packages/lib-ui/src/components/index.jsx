// packages/lib-ui/src/components/index.jsx
// @warungku/lib-ui — all shared React components

import { useEffect } from 'react';

// ─── Modal ────────────────────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const w = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`bg-surface border border-border rounded-2xl p-7 w-full ${w} mx-4 animate-slide-up max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface2 border border-border text-muted hover:text-white hover:bg-border transition-all">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── Input ────────────────────────────────────────────────────────────────────
export const Input = ({ label, error, className = '', ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-xs font-semibold text-muted uppercase tracking-wider">{label}</label>}
    <input className={`input-field ${error ? 'border-danger' : ''} ${className}`} {...props} />
    {error && <span className="text-xs text-danger">{error}</span>}
  </div>
);

// ─── Badge ────────────────────────────────────────────────────────────────────
const BADGE = {
  default: 'bg-surface2 text-muted border border-border',
  accent:  'bg-accent text-black',
  success: 'bg-success/20 text-success',
  danger:  'bg-danger/20 text-danger',
  warning: 'bg-yellow-500/20 text-yellow-400',
};

export const Badge = ({ children, variant = 'default', className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${BADGE[variant]} ${className}`}>
    {children}
  </span>
);

// ─── LoadingSpinner ───────────────────────────────────────────────────────────
export const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size];
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className={`${s} border-2 border-border border-t-accent rounded-full animate-spin`} />
      {text && <p className="text-muted text-sm">{text}</p>}
    </div>
  );
};

// ─── StatCard ─────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, color = '' }) => (
  <div className="card">
    <p className="section-title mb-2">{label}</p>
    <p className={`font-display font-extrabold text-2xl ${color}`}>{value}</p>
  </div>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon = '◫', text = 'Tidak ada data', action = null }) => (
  <div className="flex flex-col items-center justify-center py-16 text-muted">
    <span className="text-5xl mb-3">{icon}</span>
    <p className="text-sm mb-4">{text}</p>
    {action}
  </div>
);
