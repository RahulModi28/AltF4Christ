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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-screen relative">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft className="size-4 mr-2" />
                Back to Archives
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                            <Download className="size-64 text-white" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 rounded-full bg-electric-blue/10 text-electric-blue border border-electric-blue/20 text-xs font-bold uppercase tracking-wider">
                                    {resource.category}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${resource.privacy === 'private' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-acid-green/10 text-acid-green border-acid-green/20'
                                    }`}>
                                    {resource.privacy}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-bold font-display text-white mb-6 leading-tight">
                                {resource.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-slate-400 text-sm mb-8">
                                <div className="flex items-center gap-2">
                                    <UserIcon className="size-4 text-electric-blue" />
                                    <span>{resource.users?.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="size-4 text-electric-blue" />
                                    <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="size-4 text-electric-blue" />
                                    <span>Sem {resource.semester} • Year {resource.year}</span>
                                </div>
                            </div>

                            <p className="text-slate-300 text-lg leading-relaxed mb-8 whitespace-pre-wrap">
                                {resource.description || "No description provided for this resource node."}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
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
                                    className="flex-1 flex items-center justify-center px-8 py-4 bg-electric-blue hover:bg-electric-blue/90 text-white font-bold rounded-xl neon-shadow-blue transition-all group cursor-pointer"
                                >
                                    <Download className="size-5 mr-3 group-hover:scale-110 transition-transform" />
                                    Download Resource
                                </button>
                                <button className="px-6 py-4 rounded-xl border border-white/10 hover:bg-white/5 text-white transition-colors">
                                    <Share2 className="size-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="glass-card p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold font-display text-white">
                                Neural Feedback <span className="text-slate-500 text-lg">({reviews.length})</span>
                            </h3>
                            <button
                                onClick={() => setShowReviewModal(true)}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-white transition-colors"
                            >
                                Write Review
                            </button>
                        </div>
                        <ReviewList reviews={reviews} />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Node Stats</h3>
                        <div className="flex items-center justify-between pb-4 border-b border-white/5">
                            <span className="text-slate-300">Rating</span>
                            <div className="flex items-center gap-1 text-yellow-400 font-bold">
                                <Star className="size-4 fill-current" />
                                <span>{averageRating}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-4 border-b border-white/5">
                            <span className="text-slate-300">Downloads</span>
                            <span className="text-white font-mono">{resource.download_count ?? 0}</span>
                        </div>
                        <div className="flex items-center justify-between pt-4">
                            <span className="text-slate-300">File Type</span>
                            <span className="text-white font-mono uppercase">{resource.file_type || resource.file_url?.split('.').pop()?.toUpperCase() || 'N/A'}</span>
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {resource.tags && resource.tags.length > 0 ? (
                                resource.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-300">
                                        #{tag}
                                    </span>
                                ))
                            ) : (
                                <span className="text-slate-500 text-xs text-italic">No tags data</span>
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
