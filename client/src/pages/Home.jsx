import { Link } from 'react-router-dom';
import { BookOpen, Shield, Cpu, Activity, Zap, FileText, Database } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen pt-20 pb-12">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute top-[-20%] right-[-10%] size-[500px] bg-electric-blue/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] left-[-10%] size-[500px] bg-neon-violet/20 rounded-full blur-[120px]"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center py-20 lg:py-32">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-glass-white border border-glass-border mb-8">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-acid-green opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-acid-green"></span>
                            </span>
                            <span className="text-xs font-bold font-display uppercase tracking-widest text-acid-green">System Online</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold font-display text-white mb-6 leading-tight">
                            Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue via-neon-violet to-electric-blue animate-gradient">Archives</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-10 font-medium">
                            Securely uplink to the academic mainframe. Access decentralized knowledge nodes and synchronize with peer networks.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link to="/register" className="px-8 py-4 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-xl font-bold font-display uppercase tracking-wider neon-shadow-blue transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Initialize
                            </Link>
                            <Link to="/resources" className="px-8 py-4 bg-glass-white hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold font-display uppercase tracking-wider transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Browse Nodes
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stat Card 1 */}
                    <Link to="/resources?category=notes" className="glass-card p-6 group hover:border-electric-blue/50 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-electric-blue/10 text-electric-blue group-hover:scale-110 transition-transform">
                                <FileText className="h-8 w-8" />
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-pitch-black/50 px-2 py-1 rounded">1.2k Files</span>
                        </div>
                        <h3 className="text-xl font-bold font-display text-white mb-1">Lecture Notes</h3>
                        <p className="text-sm text-slate-400">Classroom data logs</p>
                    </Link>

                    {/* Stat Card 2 */}
                    <Link to="/resources?category=papers" className="glass-card p-6 group hover:border-neon-violet/50 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-neon-violet/10 text-neon-violet group-hover:scale-110 transition-transform">
                                <Shield className="h-8 w-8" />
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-pitch-black/50 px-2 py-1 rounded">580 Logs</span>
                        </div>
                        <h3 className="text-xl font-bold font-display text-white mb-1">Past Papers</h3>
                        <p className="text-sm text-slate-400">Historical exam archives</p>
                    </Link>

                    {/* Stat Card 3 */}
                    <Link to="/resources?category=projects" className="glass-card p-6 group hover:border-acid-green/50 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-acid-green/10 text-acid-green group-hover:scale-110 transition-transform">
                                <Cpu className="h-8 w-8" />
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-pitch-black/50 px-2 py-1 rounded">124 Builds</span>
                        </div>
                        <h3 className="text-xl font-bold font-display text-white mb-1">Projects</h3>
                        <p className="text-sm text-slate-400">Practical implementation units</p>
                    </Link>
                </div>

                {/* Recent Uplinks Section */}
                <div className="mt-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-electric-blue flex items-center gap-2">
                            <span className="size-2 bg-electric-blue rounded-full animate-pulse"></span>
                            Recent Uplinks
                        </h2>
                        <Link to="/resources" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-colors">
                            View All Data
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="glass-card p-5 group hover:bg-white/5 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="px-2 py-1 rounded bg-electric-blue/10 border border-electric-blue/20">
                                        <span className="text-[10px] font-bold text-electric-blue uppercase tracking-tight">Public</span>
                                    </div>
                                    <div className="text-slate-500">
                                        <Database className="h-4 w-4" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold font-display text-white mb-1 leading-tight group-hover:text-electric-blue transition-colors">
                                    Quantum Physics Notes
                                </h3>
                                <p className="text-xs text-slate-400 font-medium mb-4">u/Archon-7 • 12MB</p>
                                <div className="flex gap-2">
                                    <span className="text-[10px] px-2 py-1 rounded bg-white/5 text-slate-300 font-bold uppercase tracking-wider">
                                        Physics
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
