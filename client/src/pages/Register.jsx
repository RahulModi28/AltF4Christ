import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, User, Award, BookOpen, Calendar, Zap, Lock } from 'lucide-react';

export default function Register() {
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        branch: '',
        semester: '',
        year: '',
        college: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            const { error } = await signUp(formData.email, formData.password, {
                name: formData.name,
                branch: formData.branch,
                semester: formData.semester,
                year: formData.year,
                college: formData.college
            });
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
            <div className="absolute top-[20%] right-[10%] size-[400px] bg-electric-blue/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[20%] left-[10%] size-[400px] bg-acid-green/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-md w-full space-y-8 relative z-10 p-8 glass-card">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-tr from-acid-green to-electric-blue p-[2px] mb-4">
                        <div className="h-full w-full rounded-full bg-pitch-black flex items-center justify-center">
                            <Zap className="h-8 w-8 text-acid-green" />
                        </div>
                    </div>
                    <h2 className="mt-2 text-3xl font-bold font-display text-white">
                        Initialize Identity
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Create a secure node profile
                    </p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-400 font-medium">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="group">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Designation (Name)</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                    <User className="h-5 w-5" />
                                </span>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-pitch-black/50 text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 focus:bg-pitch-black/80 transition-all sm:text-sm font-medium"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Branch</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                        <Award className="h-5 w-5" />
                                    </span>
                                    <input
                                        name="branch"
                                        type="text"
                                        required
                                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-pitch-black/50 text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 focus:bg-pitch-black/80 transition-all sm:text-sm font-medium"
                                        placeholder="CSE"
                                        value={formData.branch}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Semester</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                        <BookOpen className="h-5 w-5" />
                                    </span>
                                    <input
                                        name="semester"
                                        type="text"
                                        required
                                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-pitch-black/50 text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 focus:bg-pitch-black/80 transition-all sm:text-sm font-medium"
                                        placeholder="4"
                                        value={formData.semester}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">College / Institution</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                    <BookOpen className="h-5 w-5" />
                                </span>
                                <input
                                    name="college"
                                    type="text"
                                    required
                                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-pitch-black/50 text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 focus:bg-pitch-black/80 transition-all sm:text-sm font-medium"
                                    placeholder="Christ University"
                                    value={formData.college}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Academic Year</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                    <Calendar className="h-5 w-5" />
                                </span>
                                <input
                                    name="year"
                                    type="text"
                                    required
                                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-pitch-black/50 text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 focus:bg-pitch-black/80 transition-all sm:text-sm font-medium"
                                    placeholder="2"
                                    value={formData.year}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="appearance-none block w-full px-4 py-3 border border-white/10 rounded-xl bg-pitch-black/50 text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 focus:bg-pitch-black/80 transition-all sm:text-sm font-medium"
                                placeholder="student@university.edu"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="group">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Passkey</label>
                            <input
                                name="password"
                                type="password"
                                required
                                className="appearance-none block w-full px-4 py-3 border border-white/10 rounded-xl bg-pitch-black/50 text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 focus:bg-pitch-black/80 transition-all sm:text-sm font-medium"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold uppercase tracking-wider rounded-xl text-white bg-acid-green hover:bg-acid-green/90 text-pitch-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-acid-green disabled:opacity-50 transition-all active:scale-[0.98]"
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <Lock className="h-5 w-5 text-pitch-black/50 group-hover:text-pitch-black transition-colors" />
                            </span>
                            {loading ? 'Registering...' : 'Complete Registration'}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link to="/login" className="font-medium text-electric-blue hover:text-neon-violet transition-colors text-sm">
                            Already have branding? Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
