import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Trash2, Edit, FileText, Zap, Award, BookOpen, User, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [resources, setResources] = useState([]);
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        if (user) {
            fetchUserResources();
        }
    }, [user]);

    const fetchUserResources = async () => {
        try {
            const { data, error } = await supabase
                .from('resources')
                .select('*')
                .eq('uploaded_by', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setResources(data || []);
        } catch (error) {
            console.error('Error fetching resources:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (resourceId) => {
        if (!confirm('Are you sure you want to delete this resource? This cannot be undone.')) return;

        setDeleting(resourceId);
        try {
            // Delete file from storage (optional, or rely on cascade if you delete row)
            // But resources table has file_url, extracting path is tricky unless we stored path.
            // For now, just delete the row. storage objects might become orphaned but that's okay for MVP.
            // Actually, we should try to delete the file if possible, but let's stick to row delete for now.

            const { error } = await supabase
                .from('resources')
                .delete()
                .eq('id', resourceId);

            if (error) throw error;

            setResources(resources.filter(r => r.id !== resourceId));
        } catch (error) {
            console.error('Error deleting resource:', error);
            alert('Failed to delete resource');
        } finally {
            setDeleting(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader className="h-8 w-8 text-electric-blue animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 relative">
            {/* Background Accents */}
            <div className="absolute top-[20%] right-[10%] size-[400px] bg-electric-blue/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[20%] left-[10%] size-[400px] bg-neon-violet/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                {/* User Stats Card */}
                <div className="lg:col-span-1">
                    <div className="glass-card p-6 sticky top-24">
                        <div className="flex flex-col items-center text-center">
                            <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-electric-blue to-neon-violet p-[2px] mb-4">
                                <div className="h-full w-full rounded-full bg-pitch-black flex items-center justify-center">
                                    <User className="h-10 w-10 text-white" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold font-display text-white">{user?.name}</h2>
                            <p className="text-electric-blue font-medium">{user?.college || 'Christ University'}</p>

                            <div className="mt-6 w-full grid grid-cols-2 gap-4">
                                <div className="bg-pitch-black/50 p-3 rounded-xl border border-white/5">
                                    <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Uploads</div>
                                    <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                                        <Zap className="h-4 w-4 text-acid-green" />
                                        {resources.length}
                                    </div>
                                </div>
                                <div className="bg-pitch-black/50 p-3 rounded-xl border border-white/5">
                                    <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Points</div>
                                    <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                                        <Award className="h-4 w-4 text-neon-violet" />
                                        {user?.points || 0}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 w-full text-left space-y-3">
                                <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-white/5">
                                    <span className="text-slate-400">Branch</span>
                                    <span className="text-white font-medium">{user?.branch || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-white/5">
                                    <span className="text-slate-400">Semester</span>
                                    <span className="text-white font-medium">{user?.semester || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-white/5">
                                    <span className="text-slate-400">Year</span>
                                    <span className="text-white font-medium">{user?.year || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* My Resources List */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold font-display text-white">My Contributions</h3>
                        <Link to="/upload" className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
                            <Zap className="h-4 w-4" />
                            New Upload
                        </Link>
                    </div>

                    {resources.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                            <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-white mb-2">No contributions yet</h3>
                            <p className="text-slate-400 max-w-sm mx-auto mb-6">
                                Start uploading notes, question papers, and other resources to earn points and help others.
                            </p>
                            <Link to="/upload" className="text-electric-blue hover:text-white transition-colors">
                                Upload your first resource &rarr;
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {resources.map((resource) => (
                                <div key={resource.id} className="glass-card p-4 hover:border-electric-blue/30 transition-all flex items-start gap-4 group">
                                    <div className="h-12 w-12 rounded-lg bg-electric-blue/10 flex items-center justify-center border border-electric-blue/20 flex-shrink-0">
                                        <FileText className="h-6 w-6 text-electric-blue" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="text-white font-medium truncate pr-4">{resource.title}</h4>
                                                <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                                                    <span className="capitalize px-2 py-0.5 rounded-full bg-white/5 text-xs border border-white/5">
                                                        {resource.resource_type || resource.category}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{resource.subject}</span>
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/edit/${resource.id}`}
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(resource.id)}
                                                    disabled={deleting === resource.id}
                                                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    {deleting === resource.id ? <Loader className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <span className={`w-2 h-2 rounded-full ${resource.privacy === 'private' ? 'bg-neon-violet' : 'bg-acid-green'}`}></span>
                                                <span className="capitalize">{resource.privacy || 'public'}</span>
                                            </div>
                                            <div>{new Date(resource.created_at).toLocaleDateString()}</div>
                                            <div>{Array.isArray(resource.tags) && resource.tags.join(', ')}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
