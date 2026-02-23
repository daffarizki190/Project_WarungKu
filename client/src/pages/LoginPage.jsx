import { useState } from 'react';
import { useAuthStore } from '../lib/stores/auth';
import { LoadingSpinner } from '../lib/ui';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, loginKasir, loading, error } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(username, password);
    };

    const handleLoginKasir = async () => {
        await loginKasir();
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: '#022C22' }}>

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, #34D399 0px, #34D399 2px, transparent 2px, transparent 24px)',
                    backgroundSize: '34px 34px',
                }} />

            <div className="w-full max-w-sm animate-fade-up z-10">

                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4"
                        style={{ boxShadow: '0 8px 32px rgba(5,150,105,0.4)' }}>W</div>
                    <h1 className="font-display text-4xl font-bold text-white mb-2">WarungKu</h1>
                    <p className="text-emerald-300/80 text-sm tracking-widest uppercase">Admin Login Area</p>
                </div>

                <div className="card !rounded-[2rem] p-8 !bg-white/5 backdrop-blur-xl border border-white/10" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-emerald-100/70 ml-1 uppercase tracking-wider">Username</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all font-medium"
                                placeholder="Masukkan username"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-emerald-100/70 ml-1 uppercase tracking-wider">Kata Sandi</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all font-medium"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 mt-4 rounded-2xl font-bold text-emerald-950 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{
                                background: 'linear-gradient(135deg, #6EE7B7, #34D399)',
                                boxShadow: loading ? 'none' : '0 8px 24px rgba(52,211,153,0.3)'
                            }}
                        >
                            {loading ? <LoadingSpinner size="sm" color="text-emerald-950" /> : 'MASUK SEBAGAI ADMIN'}
                        </button>
                    </form>

                    <div className="relative mt-8 mb-6 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                        <span className="relative z-10 bg-[#063327] px-4 text-xs font-medium text-emerald-200/50 uppercase tracking-widest">ATAU</span>
                    </div>

                    <button
                        type="button"
                        onClick={handleLoginKasir}
                        disabled={loading}
                        className="w-full py-4 rounded-2xl font-bold text-emerald-100 border border-emerald-500/30 bg-emerald-900/40 hover:bg-emerald-800/50 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        MASUK SEBAGAI KASIR
                    </button>
                </div>

                <p className="text-center text-emerald-500/50 text-xs mt-8">Versi 1.4.0 • Keamanan JWT Diaktifkan</p>
            </div>
        </div>
    );
};

export default LoginPage;
