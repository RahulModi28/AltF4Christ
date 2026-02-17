import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Download, Search, Filter, Book, Calendar, User, FileText, Cpu, Shield, Database } from 'lucide-react';

export default function ResourceList() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filters, setFilters] = useState({
        search: '',
        semester: '',
        year: '',
        category: ''
    });

    const fetchResources = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('resources')
                .select(`
          *,
          users (
            name
          )
        `)
                .order('created_at', { ascending: false });

            if (filters.search) {
                query = query.ilike('title', `%${filters.search}%`);
            }
            if (filters.semester) {
                query = query.eq('semester', filters.semester);
            }
            if (filters.year) {
                query = query.eq('year', filters.year);
            }
            if (filters.category) {
                query = query.eq('category', filters.category);
            }

            const { data, error } = await query;

            if (error) throw error;
            setResources(data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch resources');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'notes': return <FileText className="h-4 w-4" />;
            case 'project': return <Cpu className="h-4 w-4" />;
            case 'question_paper': return <Shield className="h-4 w-4" />;
            default: return <Database className="h-4 w-4" />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-screen">
            <div className="mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-glass-white border border-glass-border mb-4">
                    <span className="size-2 rounded-full bg-electric-blue animate-pulse"></span>
                    <span className="text-xs font-bold font-display uppercase tracking-widest text-electric-blue">Database Access</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold font-display text-white mb-4">
                    Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-neon-violet">Archives</span>
                </h1>
                <p className="text-slate-400 max-w-2xl">
                    Search and downlink academic resource nodes. All files are scanning for integrity.
                </p>
            </div>

            {/* Search and Filters */}
            <div className="glass-card p-6 mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Filter className="h-24 w-24 text-white" />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4 relative z-10">
                    <div className="relative group search-glow rounded-xl transition-all">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-500 group-focus-within:text-electric-blue transition-colors" />
                        </div>
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-pitch-black/50 text-white placeholder-slate-500 focus:outline-none focus:border-electric-blue/50 focus:bg-pitch-black/80 transition-all font-medium"
                            placeholder="Search nodes..."
                        />
                    </div>

                    {['semester', 'year', 'category'].map((filterType) => (
                        <div key={filterType} className="relative">
                            <select
                                name={filterType}
                                value={filters[filterType]}
                                onChange={handleFilterChange}
                                className="block w-full pl-3 pr-10 py-3 text-base border border-white/10 bg-pitch-black/50 text-white focus:outline-none focus:border-electric-blue/50 focus:bg-pitch-black/80 sm:text-sm rounded-xl appearance-none capitalize transition-all"
                            >
                                <option value="">All {filterType}s</option>
                                {filterType === 'semester' && [1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                    <option key={sem} value={sem}>Semester {sem}</option>
                                ))}
                                {filterType === 'year' && [1, 2, 3, 4].map(year => (
                                    <option key={year} value={year}>Year {year}</option>
                                ))}
                                {filterType === 'category' && (
                                    <>
                                        <option value="notes">Notes</option>
                                        <option value="question_paper">Question Paper</option>
                                        <option value="assignment">Assignment</option>
                                        <option value="project">Project</option>
                                        <option value="reference">Reference Book</option>
                                    </>
                                )}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <Filter className="h-4 w-4 text-slate-500" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Resource Grid */}
            {loading ? (
                <div className="flex justify-center py-24">
                    <div className="relative">
                        <div className="size-16 rounded-full border-4 border-white/10 border-t-electric-blue animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="size-8 rounded-full bg-electric-blue/20 blur-xl animate-pulse"></div>
                        </div>
                    </div>
                </div>
            ) : error ? (
                <div className="text-center py-12 px-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                    <p className="text-red-400 font-bold font-display">System Error: {error}</p>
                </div>
            ) : resources.length === 0 ? (
                <div className="text-center py-24">
                    <div className="inline-flex p-6 rounded-full bg-white/5 border border-white/10 mb-6">
                        <Database className="h-12 w-12 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold font-display text-white">No data nodes found</h3>
                    <p className="mt-2 text-slate-500">Adjust filter parameters to expand search range.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {resources.map((resource) => (
                        <div key={resource.id} className="glass-card p-6 flex flex-col group hover:border-electric-blue/30 transition-all hover:translate-y-[-2px]">
                            <div className="flex items-center justify-between mb-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${resource.category === 'notes' ? 'bg-electric-blue/10 text-electric-blue border-electric-blue/20' :
                                        resource.category === 'question_paper' ? 'bg-neon-violet/10 text-neon-violet border-neon-violet/20' :
                                            'bg-acid-green/10 text-acid-green border-acid-green/20'
                                    }`}>
                                    {getCategoryIcon(resource.category)}
                                    {resource.category.replace('_', ' ')}
                                </span>
                                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(resource.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold font-display text-white mb-2 line-clamp-1 group-hover:text-electric-blue transition-colors" title={resource.title}>
                                {resource.title}
                            </h3>
                            <p className="text-sm text-slate-400 line-clamp-2 mb-6 flex-grow">
                                {resource.description}
                            </p>

                            <div className="flex items-center justify-between text-xs font-medium text-slate-500 pt-4 border-t border-white/5 mb-4">
                                <div className="flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5" />
                                    <span className="text-slate-300">{resource.users?.name || 'Unknown'}</span>
                                </div>
                                <div className="px-2 py-0.5 rounded bg-white/5">
                                    Sem {resource.semester} • Y{resource.year}
                                </div>
                            </div>

                            <a
                                href={resource.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-xl text-xs font-bold font-display uppercase tracking-widest text-white bg-electric-blue hover:bg-electric-blue/90 neon-shadow-blue transition-all group-hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Downlink File
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
