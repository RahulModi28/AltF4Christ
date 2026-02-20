import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Download, Search, Filter, Book, Calendar, User, FileText, Cpu, Shield, Database, Lock, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function ResourceList() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filters, setFilters] = useState({
        search: '',
        semester: '',
        year: '',
        category: '',
        branch: '',
        sort: 'latest'
    });

    const { user } = useAuth(); // Get current user

    const fetchResources = async () => {
        try {
            setLoading(true);

            // Base query with joins
            if (!user?.department) return; // Wait for context
            let query = supabase
                .from('resources')
                .select(`
                  *,
                  users (
                    name,
                    college
                  )
                `)
                .eq('department', user.department);

            // Apply filters
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
            if (filters.branch) {
                query = query.eq('branch', filters.branch);
            }

            // Apply Sorting
            if (filters.sort === 'oldest') {
                query = query.order('created_at', { ascending: true });
            } else {
                // Default to latest
                query = query.order('created_at', { ascending: false });
            }

            const { data, error } = await query;

            if (error) throw error;

            // Client-side filtering for Privacy Access Control
            // RLS is better, but for this Hackathon scope, client-side filtering with a clear visual logic is acceptable prototype
            // Logic: Show if Public OR (Private AND Same College) OR (My Upload)
            const filteredData = data.filter(resource => {
                const isPublic = resource.privacy === 'public';
                const isMine = resource.user_id === user?.id;
                const isSameCollege = resource.users?.college === user?.college;

                // Handle missing privacy field gracefully (default to public if undefined)
                const privacy = resource.privacy || 'public';

                return privacy === 'public' || isMine || (privacy === 'private' && isSameCollege);
            });

            setResources(filteredData);
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
        if (!category) return <Database className="h-4 w-4" />;
        switch (category) {
            case 'notes': return <FileText className="h-4 w-4" />;
            case 'project': return <Cpu className="h-4 w-4" />;
            case 'question_paper': return <Shield className="h-4 w-4" />;
            default: return <Database className="h-4 w-4" />;
        }
    };

    const handleDownload = async (fileUrl, title, resourceId) => {
        try {
            // Increment download count in database
            if (resourceId) {
                supabase.rpc('increment_download_count', { resource_id: resourceId }).then(() => { });
            }

            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = title || 'download';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (err) {
            console.error('Download failed:', err);
            window.open(fileUrl, '_blank');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 min-h-screen relative text-slate-300">
            {/* Engaging Dynamic Background */}
            <div className="fixed inset-0 bg-pitch-black z-[-3]"></div>
            <div className="fixed inset-0 bg-grid opacity-[0.15] z-[-2] pointer-events-none"></div>
            <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-electric-blue/20 rounded-full blur-[120px] pointer-events-none animate-float z-[-1]"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-neon-violet/20 rounded-full blur-[120px] pointer-events-none animate-float-delayed z-[-1]"></div>
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-pitch-black/50 to-pitch-black z-[-1] pointer-events-none"></div>
            <div className="mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-glass-white border border-glass-border mb-4">
                    <span className="size-2 rounded-full bg-electric-blue animate-pulse"></span>
                    <span className="text-xs font-bold font-display uppercase tracking-widest text-electric-blue">Database Access</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold font-display text-white mb-4">
                    Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-neon-violet">Archives</span>
                </h1>
                <p className="text-slate-400 max-w-2xl">
                    Search and download academic resource nodes. All files are scanning for integrity.
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
                                <option value="">All {filterType === 'category' ? 'Categories' : filterType + 's'}</option>
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
                                        <option value="prompt">Prompt</option>
                                    </>
                                )}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <Filter className="h-4 w-4 text-slate-500" />
                            </div>
                        </div>
                    ))}

                    {/* Sort Option */}
                    <div className="relative">
                        <select
                            name="sort"
                            value={filters.sort || 'latest'}
                            onChange={handleFilterChange}
                            className="block w-full pl-3 pr-10 py-3 text-base border border-white/10 bg-pitch-black/50 text-white focus:outline-none focus:border-electric-blue/50 focus:bg-pitch-black/80 sm:text-sm rounded-xl appearance-none capitalize transition-all"
                        >
                            <option value="latest">Latest</option>
                            <option value="oldest">Oldest</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <Filter className="h-4 w-4 text-slate-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Resource Grid */}
            {!loading && resources.length > 0 && (
                <div className="flex items-center justify-between mb-6 animate-fade-in">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {resources.length} resource{resources.length !== 1 ? 's' : ''} found
                    </span>
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="glass-card p-6 space-y-4" style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className="flex justify-between">
                                <div className="skeleton h-6 w-24 rounded-full"></div>
                                <div className="skeleton h-5 w-16 rounded-full"></div>
                            </div>
                            <div className="skeleton h-6 w-3/4 rounded-lg"></div>
                            <div className="space-y-2">
                                <div className="skeleton h-4 w-full rounded"></div>
                                <div className="skeleton h-4 w-2/3 rounded"></div>
                            </div>
                            <div className="flex justify-between pt-4 border-t border-white/5">
                                <div className="skeleton h-4 w-20 rounded"></div>
                                <div className="skeleton h-4 w-16 rounded"></div>
                            </div>
                            <div className="skeleton h-11 w-full rounded-xl"></div>
                        </div>
                    ))}
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
                    {resources.map((resource, index) => (
                        <div key={resource.id} className="glass-card-interactive p-6 flex flex-col group animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}>
                            <div className="flex items-center justify-between mb-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${(resource.category || 'other') === 'notes' ? 'bg-electric-blue/10 text-electric-blue border-electric-blue/20' :
                                    (resource.category || 'other') === 'question_paper' ? 'bg-neon-violet/10 text-neon-violet border-neon-violet/20' :
                                        'bg-acid-green/10 text-acid-green border-acid-green/20'
                                    }`}>
                                    {getCategoryIcon(resource.category)}
                                    {resource.category ? resource.category.replace('_', ' ') : 'Uncategorized'}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${(resource.privacy || 'public') === 'private'
                                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                        : 'bg-acid-green/10 text-acid-green border-acid-green/20'
                                        }`}>
                                        {(resource.privacy || 'public') === 'private' ? <Lock className="size-3" /> : <Globe className="size-3" />}
                                        {(resource.privacy || 'public') === 'private' ? 'Private' : 'Public'}
                                    </span>
                                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {resource.created_at ? new Date(resource.created_at).toLocaleDateString() : 'Unknown Date'}
                                    </span>
                                </div>
                            </div>

                            <Link to={`/resource/${resource.id}`} className="block">
                                <h3 className="text-lg font-bold font-display text-white mb-2 line-clamp-1 group-hover:text-electric-blue transition-colors" title={resource.title}>
                                    {resource.title}
                                </h3>
                            </Link>
                            <p className="text-sm text-slate-400 line-clamp-2 mb-6 flex-grow whitespace-pre-wrap">
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

                            <button
                                onClick={() => handleDownload(resource.file_url, resource.title, resource.id)}
                                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-xl text-xs font-bold font-display uppercase tracking-widest text-white bg-electric-blue hover:bg-electric-blue/90 neon-shadow-blue transition-all group-hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download File
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
