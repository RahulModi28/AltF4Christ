import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Upload, Search, User, Zap } from 'lucide-react';

export default function Navbar() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 inset-x-0 bg-pitch-black/80 backdrop-blur-2xl border-b border-white/5 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo Area */}
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className="size-10 rounded-full p-[1.5px] bg-gradient-to-tr from-electric-blue via-neon-violet to-acid-green group-hover:animate-spin-slow transition-all">
                                    <div className="size-full rounded-full bg-pitch-black flex items-center justify-center">
                                        <Zap className="h-5 w-5 text-electric-blue fill-current" />
                                    </div>
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 size-2.5 bg-acid-green rounded-full border-2 border-pitch-black animate-pulse"></div>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold font-display tracking-tight text-white leading-none">CampusResources</h1>
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <span className="text-electric-blue">●</span> Online
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Actions */}
                    <div className="flex items-center gap-6">
                        {user ? (
                            <>
                                <div className="hidden md:flex items-center gap-6">
                                    <Link to="/resources" className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
                                        <Search className="h-4 w-4" />
                                        Browse
                                    </Link>
                                    <Link to="/upload" className="bg-electric-blue hover:bg-electric-blue/90 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all neon-shadow-blue group">
                                        <Upload className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                                        <span className="text-xs font-bold font-display uppercase tracking-wider">Upload</span>
                                    </Link>
                                </div>

                                {/* User Profile */}
                                <div className="flex items-center gap-4 pl-6 border-l border-white/5">
                                    <Link to="/profile" className="flex items-center gap-4 group">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-sm font-bold text-white font-display group-hover:text-electric-blue transition-colors">{user.name || 'Student'}</p>
                                            <p className="text-[10px] font-bold text-acid-green uppercase tracking-wider">{user.points || 0} PTS</p>
                                        </div>
                                        <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-electric-blue group-hover:border-electric-blue/50 transition-colors">
                                            <User className="h-5 w-5" />
                                        </div>
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="text-slate-500 hover:text-neon-violet transition-colors"
                                        title="Sign Out"
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                                    Login
                                </Link>
                                <Link to="/register" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
