import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Download, Share2, Star, Clock, User as UserIcon, Calendar, ArrowLeft } from 'lucide-react';
import ReviewList from '../components/ReviewList';
import ReviewModal from '../components/ReviewModal';

export default function ResourceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resource, setResource] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReviewModal, setShowReviewModal] = useState(false);

    // Mock data for fallback if DB fails
    const mockReviews = [
        { id: 1, rating: 5, comment: 'Excellent resource!', created_at: new Date().toISOString(), users: { name: 'Demo User' } }
    ];

    const fetchResource = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('resources')
                .select(`
                    *,
                    users (
                        name,
                        college
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            setResource(data);

            // Fetch reviews (Wrapped in try-catch to handle missing table)
            try {
                const { data: reviewData, error: reviewError } = await supabase
                    .from('reviews')
                    .select(`
                        *,
                        users (
                            name
                        )
                    `)
                    .eq('resource_id', id)
                    .order('created_at', { ascending: false });

                if (reviewError) throw reviewError;
                setReviews(reviewData);
            } catch (ReviewErr) {
                console.warn("Reviews table might not exist, using mock data for demo.");
                // setReviews(mockReviews); // Uncomment to force mock data
                setReviews([]);
            }

        } catch (err) {
            console.error(err);
            // Handle 404
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResource();
    }, [id]);

    if (loading) return <div className="text-white text-center py-20">Loading Node Details...</div>;
    if (!resource) return <div className="text-white text-center py-20">Resource Node Not Found</div>;

    const averageRating = reviews.length
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : 'New';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 min-h-screen relative text-slate-300">
            {/* Engaging Dynamic Background */}
            <div className="fixed inset-0 bg-pitch-black z-[-3]"></div>
            <div className="fixed inset-0 bg-grid opacity-[0.15] z-[-2] pointer-events-none"></div>
            <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-electric-blue/10 rounded-full blur-[120px] pointer-events-none animate-float z-[-1]"></div>

            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-slate-400 hover:text-white mb-8 transition-colors group w-fit animate-fade-in-up"
            >
                <div className="p-2 rounded-lg bg-white/5 mr-3 group-hover:bg-white/10 transition-colors border border-white/5 group-hover:border-white/10">
                    <ArrowLeft className="size-4" />
                </div>
                <span className="font-bold uppercase tracking-wider text-xs">Back to Archives</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content (Left Column) */}
                <div className="lg:col-span-8 space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                    {/* Hero Header Card */}
                    <div className="glass-card p-8 md:p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                            <Download className="size-64 text-white" />
                        </div>

                        <div className="relative z-10">
                            {/* Tags/Badges */}
                            <div className="flex items-center gap-3 mb-6">
                                <span className="px-3 py-1.5 rounded-md bg-electric-blue/10 text-electric-blue border border-electric-blue/20 text-[10px] font-bold uppercase tracking-widest">
                                    {resource.category?.replace('_', ' ') || 'Resource'}
                                </span>
                                <span className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest border ${resource.privacy === 'private' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-acid-green/10 text-acid-green border-acid-green/20'
                                    }`}>
                                    {resource.privacy || 'Public'}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-5xl lg:text-5xl font-bold font-display text-white mb-8 leading-[1.2] tracking-tight">
                                {resource.title}
                            </h1>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-white/10">
                                <div className="space-y-1.5">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                        <UserIcon className="size-3" />
                                        Author
                                    </div>
                                    <div className="text-sm font-medium text-white line-clamp-1" title={resource.users?.name}>
                                        {resource.users?.name || 'Unknown'}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                        <Calendar className="size-3" />
                                        Date Added
                                    </div>
                                    <div className="text-sm font-medium text-white">
                                        {new Date(resource.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                        <Clock className="size-3" />
                                        Semester
                                    </div>
                                    <div className="text-sm font-medium text-white">
                                        Semester {resource.semester || 'N/A'}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                        <Download className="size-3" />
                                        Downloads
                                    </div>
                                    <div className="text-sm font-medium text-white font-mono">
                                        {resource.download_count ?? 0}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="glass-card p-8 md:p-10">
                        <h2 className="text-xs font-bold text-electric-blue uppercase tracking-widest mb-6 flex items-center gap-2">
                            <span className="size-2 bg-electric-blue rounded-full"></span>
                            About this node
                        </h2>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                                {resource.description || "No description provided for this resource node."}
                            </p>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="glass-card p-8 md:p-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
                            <div>
                                <h3 className="text-2xl font-bold font-display text-white mb-2">
                                    Neural Feedback
                                </h3>
                                <p className="text-sm text-slate-400">Read what other peers think about this data node.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                                    <Star className="size-4 text-yellow-400 fill-current" />
                                    <span className="font-bold text-white">{averageRating}</span>
                                    <span className="text-slate-500 text-sm">({reviews.length})</span>
                                </div>
                                <button
                                    onClick={() => setShowReviewModal(true)}
                                    className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                                >
                                    Write Review
                                </button>
                            </div>
                        </div>
                        <ReviewList reviews={reviews} />
                    </div>
                </div>

                {/* Sidebar (Right Column) */}
                <div className="lg:col-span-4 space-y-6 animate-fade-in-up lg:sticky lg:top-32 lg:self-start lg:max-h-[calc(100vh-8rem)] overflow-y-auto pb-4 custom-scrollbar" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>

                    {/* Action Hub */}
                    <div className="glass-card p-6 neon-shadow-blue border-electric-blue/30 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 relative z-10">Primary Action</h3>

                        <button
                            onClick={async () => {
                                // Increment download count
                                supabase.rpc('increment_download_count', { resource_id: id }).then(() => {
                                    setResource(prev => prev ? { ...prev, download_count: (prev.download_count ?? 0) + 1 } : prev);
                                });
                                // Download file
                                try {
                                    const response = await fetch(resource.file_url);
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = resource.title || 'download';
                                    document.body.appendChild(a);
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    a.remove();
                                } catch {
                                    window.open(resource.file_url, '_blank');
                                }
                            }}
                            className="w-full relative z-10 flex flex-col items-center justify-center p-6 mb-4 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-xl transition-all group-hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        >
                            <Download className="size-8 mb-3" />
                            <span className="font-bold font-display tracking-widest uppercase text-sm">Download Source</span>
                            <span className="text-[10px] text-white/70 mt-1 uppercase tracking-wider font-medium">Secure Connection</span>
                        </button>

                        <button className="w-full relative z-10 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 hover:bg-white/5 text-white transition-colors font-bold text-sm tracking-wide">
                            <Share2 className="size-4 text-slate-400" />
                            Share Link
                        </button>
                    </div>

                    {/* Stats Dashboard */}
                    <div className="glass-card p-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Technical Specs</h3>

                        <div className="space-y-4">
                            <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-white/5 border border-white/5">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">File Type</span>
                                <span className="text-sm font-bold text-white uppercase">
                                    {resource.file_type || resource.file_url?.split('.').pop()?.toUpperCase() || 'UNKNOWN'}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-white/5 border border-white/5">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Year</span>
                                <span className="text-sm font-bold text-white">
                                    {resource.year || 'N/A'}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-white/5 border border-white/5">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Department</span>
                                <span className="text-sm font-bold text-white leading-snug">
                                    {resource.department || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="glass-card p-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Indexed Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {resource.tags && resource.tags.length > 0 ? (
                                resource.tags.map(tag => (
                                    <span key={tag} className="px-2.5 py-1.5 bg-electric-blue/10 hover:bg-electric-blue/20 transition-colors border border-electric-blue/20 rounded-md text-[10px] font-bold uppercase tracking-widest text-electric-blue cursor-default">
                                        {tag}
                                    </span>
                                ))
                            ) : (
                                <span className="text-slate-500 text-xs italic bg-white/5 px-3 py-2 rounded-lg border border-white/5 w-full text-center">No structural tags found</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showReviewModal && (
                <ReviewModal
                    resourceId={id}
                    onClose={() => setShowReviewModal(false)}
                    onReviewSubmitted={fetchResource}
                />
            )}
        </div>
    );
}
