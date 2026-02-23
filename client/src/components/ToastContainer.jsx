// client/src/components/ToastContainer.jsx — redesigned

const STYLE = {
  success: { bg: 'rgba(5,150,105,0.95)', icon: '✓', color: '#FFF' },
  error: { bg: 'rgba(220,38,38,0.95)', icon: '!', color: '#FFF' },
  info: { bg: 'rgba(2,44,34,0.95)', icon: 'ℹ', color: '#F8FAFC' },
};

const ToastContainer = ({ toasts, onRemove }) => (
  <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-[999] pointer-events-none">
    {toasts.map((t) => {
      const s = STYLE[t.type] || STYLE.success;
      return (
        <div key={t.id} onClick={() => onRemove(t.id)}
          className="animate-pop-in flex items-center gap-3 px-5 py-3.5 rounded-2xl cursor-pointer pointer-events-auto"
          style={{
            background: s.bg,
            color: s.color,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">{s.icon}</span>
          <span className="text-sm font-semibold">{t.message}</span>
        </div>
      );
    })}
  </div>
);

export default ToastContainer;
