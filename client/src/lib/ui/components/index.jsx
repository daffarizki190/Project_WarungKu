// client/src/lib/ui/components/index.jsx — redesigned

import { useEffect } from 'react';

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const w = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' }[size] || 'max-w-md';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(28,20,16,0.55)', backdropFilter: 'blur(10px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`bg-cream w-full ${w} rounded-4xl animate-pop-in overflow-hidden`}
        style={{ boxShadow: '0 32px 80px rgba(28,20,16,0.25), 0 0 0 1px rgba(196,162,120,0.2)' }}>
        <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-sand">
          <div>
            <div className="deco-rule mb-2" />
            <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-sand flex items-center justify-center text-clay hover:bg-sand-dark transition-all text-sm font-bold">
            ✕
          </button>
        </div>
        <div className="px-7 py-6">{children}</div>
      </div>
    </div>
  );
};

export const Input = ({ label, error, className = '', ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-xs font-semibold text-clay uppercase tracking-wider">{label}</label>}
    <input className={`input-field ${error ? 'border-red-300 focus:border-red-400' : ''} ${className}`} {...props} />
    {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
  </div>
);

const BADGE_STYLES = {
  default: 'bg-sand text-clay border border-sand-dark',
  accent:  'bg-terracotta/10 text-terracotta border border-terracotta/20',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  danger:  'bg-red-50 text-red-600 border border-red-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
};

export const Badge = ({ children, variant = 'default', className = '' }) => (
  <span className={`pill font-semibold ${BADGE_STYLES[variant] || BADGE_STYLES.default} ${className}`}>
    {children}
  </span>
);

export const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const s = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }[size] || 'w-8 h-8';
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className={`${s} rounded-full border-2 border-sand-dark border-t-terracotta animate-spin`} />
      {text && <p className="text-clay text-sm font-medium">{text}</p>}
    </div>
  );
};

export const StatCard = ({ label, value, color = 'text-ink', icon = null }) => (
  <div className="card group">
    <div className="flex items-start justify-between mb-3">
      <p className="section-title">{label}</p>
      {icon && <span className="text-xl opacity-40">{icon}</span>}
    </div>
    <p className={`font-display text-3xl font-bold leading-none ${color}`}>{value}</p>
  </div>
);

export const EmptyState = ({ icon = '◫', text = 'Tidak ada data', action = null }) => (
  <div className="flex flex-col items-center justify-center py-20 text-clay">
    <div className="w-16 h-16 rounded-3xl bg-sand flex items-center justify-center text-2xl mb-4">{icon}</div>
    <p className="text-sm font-medium mb-5">{text}</p>
    {action}
  </div>
);
