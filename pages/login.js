import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Lock, User as UserIcon, Loader2, Database, ShieldCheck } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/');
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F3F4F6] text-slate-900 flex items-center justify-center p-4 selection:bg-indigo-100">
            <Head>
                <title>Login | Kathlyn</title>
            </Head>

            <div className="w-full max-w-sm">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                    <div className="mb-10 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 mb-4">
                            <Database className="w-6 h-6 text-slate-400" />
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                            Kathlyn
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            Administrator Sign In
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-red-400" />
                                <p className="text-red-500 text-xs font-medium">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ml-0.5">
                                    Identifier
                                </label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm placeholder:text-slate-400"
                                        placeholder="Username"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ml-0.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm placeholder:text-slate-400"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-black disabled:opacity-50 text-white text-sm font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ShieldCheck className="w-4 h-4 opacity-70" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                        <p className="text-slate-400 text-[10px] uppercase tracking-widest font-medium">
                            Secured by Kathlyn Control
                        </p>
                    </div>
                </div>

                <p className="text-center mt-8 text-slate-400 text-[11px] tracking-tight">
                    Access restricted to authorized personnel only.
                </p>
            </div>
        </div>
    );
}
