import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Zap, Shield, Lock } from 'lucide-react';

export default function Login() {
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            const { error } = await signIn(email, password);
            if (error) throw error;
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-[-10%] left-[-10%] size-[500px] bg-electric-blue/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] size-[500px] bg-neon-violet/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-md w-full space-y-8 relative z-10 p-8 glass-card">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-tr from-electric-blue to-neon-violet p-[2px] mb-4">
                        <div className="h-full w-full rounded-full bg-pitch-black flex items-center justify-center">
                            <Zap className="h-8 w-8 text-electric-blue" />
                        </div>
                    </div>
                    <h2 className="mt-2 text-3xl font-bold font-display text-white">
                        Access Neural Archives
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Enter credentials to decrypt secure nodes
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-400 font-medium">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="group">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                            <input
                                type="email"
                                required
                                className="appearance-none block w-full px-4 py-3 border border-white/10 rounded-xl bg-pitch-black/50 text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 focus:bg-pitch-black/80 transition-all sm:text-sm font-medium"
                                placeholder="student@university.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Passkey</label>
                            <input
                                type="password"
                                required
                                className="appearance-none block w-full px-4 py-3 border border-white/10 rounded-xl bg-pitch-black/50 text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 focus:bg-pitch-black/80 transition-all sm:text-sm font-medium"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold uppercase tracking-wider rounded-xl text-white bg-electric-blue hover:bg-electric-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electric-blue disabled:opacity-50 neon-shadow-blue transition-all active:scale-[0.98]"
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <Lock className="h-5 w-5 text-white/50 group-hover:text-white transition-colors" />
                            </span>
                            {loading ? 'Decrypting...' : 'Initialize Session'}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link to="/register" className="font-medium text-electric-blue hover:text-neon-violet transition-colors text-sm">
                            New User? Initialize Protocol
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
