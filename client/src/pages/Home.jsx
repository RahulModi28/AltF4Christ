import { Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { BookOpen, Shield, Cpu, Activity, Zap, FileText, Database, ChevronRight, ArrowUpRight, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import LiquidEther from '../components/LiquidEther';

export default function Home() {
    const { user } = useAuth();
    const [recentResources, setRecentResources] = useState([]);
    const [stats, setStats] = useState({ notes: 0, papers: 0, projects: 0 });

    useEffect(() => {
        fetchRecentResources();
        fetchStats();
    }, []);

    const fetchRecentResources = async () => {
        if (!user?.department) return; // Wait for user context
        const { data } = await supabase
            .from('resources')
            .select('*, users(name)')
            .eq('department', user.department)
            .order('created_at', { ascending: false })
            .limit(4);
        if (data) setRecentResources(data);
    };

    const fetchStats = async () => {
        if (!user?.department) return; // Wait for user context
        const { count: notesCount } = await supabase.from('resources').select('*', { count: 'exact', head: true }).eq('department', user.department).eq('category', 'notes');
        const { count: papersCount } = await supabase.from('resources').select('*', { count: 'exact', head: true }).eq('department', user.department).eq('category', 'question_paper');
        const { count: projectsCount } = await supabase.from('resources').select('*', { count: 'exact', head: true }).eq('department', user.department).eq('category', 'project');
        setStats({
            notes: notesCount || 0,
            papers: papersCount || 0,
            projects: projectsCount || 0,
        });
    };

    if (user) {
        return <Navigate to="/resources" replace />;
    }

    return (
        <div className="min-h-screen pt-28 pb-12 relative overflow-hidden">
            {/* Liquid Ether Background */}
            <div className="absolute inset-0 z-0">
                <LiquidEther
                    colors={['#5227FF', '#FF9FFC', '#B19EEF']}
                    mouseForce={30}
                    cursorSize={150}
                    isViscous={true}
                    viscous={25}
                    dt={0.02}
                />
                {/* Overlay to ensure text readability */}
                <div className="absolute inset-0 bg-pitch-black/20 pointer-events-none"></div>
            </div>

            {/* Hero Section */}
            <div className="relative z-10">

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center py-20 lg:py-32">
                        {/* Status Badge */}
                        <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-glass-white border border-glass-border mb-8 hover:border-electric-blue/30 transition-colors cursor-default">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-acid-green opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-acid-green"></span>
                            </span>
                            <span className="text-xs font-bold font-display uppercase tracking-widest text-acid-green">System Online</span>
                            <span className="text-xs text-slate-600">•</span>
                            <span className="text-xs font-medium text-slate-500">{stats.notes + stats.papers + stats.projects} resources available</span>
                        </div>

                        {/* Title */}
                        <h1 className="animate-fade-in-up text-5xl md:text-7xl lg:text-8xl font-bold font-display text-white mb-6 leading-tight" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                            Neural{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue via-neon-violet to-electric-blue animate-gradient bg-[length:200%_auto]">
                                Archives
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="animate-fade-in-up max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-12 font-medium leading-relaxed" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                            Access the academic mainframe. Download knowledge nodes and synchronize with peer networks.
                        </p>

                        {/* CTA Buttons */}
                        <div className="animate-fade-in-up flex flex-col sm:flex-row justify-center gap-4" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                            <Link to="/register" className="group px-8 py-4 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-xl font-bold font-display uppercase tracking-wider neon-shadow-blue transition-all hover:scale-105 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
                                <Zap className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                Get Started
                                <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                            </Link>
                            <Link to="/resources" className="group px-8 py-4 bg-glass-white hover:bg-white/10 border border-white/10 hover:border-white/25 text-white rounded-xl font-bold font-display uppercase tracking-wider transition-all hover:scale-105 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
                                <Activity className="h-5 w-5 group-hover:animate-bounce-subtle" />
                                Browse Notes
                                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stat Card 1 - Notes */}
                    <div className="glass-card-interactive p-6 group animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-electric-blue/10 text-electric-blue group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <FileText className="h-8 w-8" />
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-pitch-black/50 px-2.5 py-1 rounded-lg border border-white/5">
                                {stats.notes} Files
                            </span>
                        </div>
                        <h3 className="text-xl font-bold font-display text-white mb-1 group-hover:text-electric-blue transition-colors">Lecture Notes</h3>
                        <p className="text-sm text-slate-400">Classroom data logs</p>
                        <div className="mt-4 h-0.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-electric-blue to-electric-blue/50 rounded-full transition-all group-hover:w-full w-2/3"></div>
                        </div>
                    </div>

                    {/* Stat Card 2 - Papers */}
                    <div className="glass-card-interactive p-6 group animate-fade-in-up" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-neon-violet/10 text-neon-violet group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <Shield className="h-8 w-8" />
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-pitch-black/50 px-2.5 py-1 rounded-lg border border-white/5">
                                {stats.papers} Logs
                            </span>
                        </div>
                        <h3 className="text-xl font-bold font-display text-white mb-1 group-hover:text-neon-violet transition-colors">Past Papers</h3>
                        <p className="text-sm text-slate-400">Historical exam archives</p>
                        <div className="mt-4 h-0.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-neon-violet to-neon-violet/50 rounded-full transition-all group-hover:w-full w-1/2"></div>
                        </div>
                    </div>

                    {/* Stat Card 3 - Projects */}
                    <div className="glass-card-interactive p-6 group animate-fade-in-up" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-acid-green/10 text-acid-green group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <Cpu className="h-8 w-8" />
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-pitch-black/50 px-2.5 py-1 rounded-lg border border-white/5">
                                {stats.projects} Builds
                            </span>
                        </div>
                        <h3 className="text-xl font-bold font-display text-white mb-1 group-hover:text-acid-green transition-colors">Projects</h3>
                        <p className="text-sm text-slate-400">Practical implementation units</p>
                        <div className="mt-4 h-0.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-acid-green to-acid-green/50 rounded-full transition-all group-hover:w-full w-1/3"></div>
                        </div>
                    </div>
                </div>

                {/* Recent Uploads Section */}
                <div className="mt-16 animate-fade-in-up" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-electric-blue flex items-center gap-2">
                            <span className="size-2 bg-electric-blue rounded-full animate-pulse"></span>
                            Recent Uploads
                        </h2>
                        <Link to="/resources" className="group text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1">
                            View All
                            <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {recentResources.length > 0 ? recentResources.map((resource, i) => (
                            <div key={resource.id} className="glass-card-interactive p-5 group" style={{ animationDelay: `${0.8 + i * 0.1}s` }}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-2 py-1 rounded-lg border ${(resource.privacy || 'public') === 'private'
                                        ? 'bg-red-500/10 border-red-500/20'
                                        : 'bg-electric-blue/10 border-electric-blue/20'
                                        }`}>
                                        <span className={`text-[10px] font-bold uppercase tracking-tight ${(resource.privacy || 'public') === 'private' ? 'text-red-500' : 'text-electric-blue'
                                            }`}>
                                            {(resource.privacy || 'public') === 'private' ? 'Private' : 'Public'}
                                        </span>
                                    </div>
                                    <div className="text-slate-500 group-hover:text-electric-blue transition-colors">
                                        <Database className="h-4 w-4" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold font-display text-white mb-1 leading-tight group-hover:text-electric-blue transition-colors line-clamp-2">
                                    {resource.title}
                                </h3>
                                <p className="text-xs text-slate-400 font-medium mb-4">
                                    {resource.users?.name || 'Unknown'} • Sem {resource.semester}
                                </p>
                                <div className="flex gap-2">
                                    <span className="text-[10px] px-2 py-1 rounded-lg bg-white/5 text-slate-300 font-bold uppercase tracking-wider border border-white/5">
                                        {resource.category ? resource.category.replace('_', ' ') : 'Other'}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            [1, 2, 3, 4].map((i) => (
                                <div key={i} className="glass-card p-5 space-y-4">
                                    <div className="flex justify-between">
                                        <div className="skeleton h-6 w-16 rounded-lg"></div>
                                        <div className="skeleton h-4 w-4 rounded"></div>
                                    </div>
                                    <div className="skeleton h-5 w-3/4 rounded"></div>
                                    <div className="skeleton h-3 w-1/2 rounded"></div>
                                    <div className="skeleton h-5 w-16 rounded-lg"></div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
