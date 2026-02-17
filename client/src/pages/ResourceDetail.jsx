import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Download, Star, FileText, User, Calendar } from 'lucide-react';

const ResourceDetail = () => {
    const { id } = useParams();
    const { user, session } = useAuth();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [rating, setRating] = useState(0);

    useEffect(() => {
        const fetchResource = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/resources/${id}`);
                setResource(res.data);
            } catch (err) {
                console.error("Error fetching resource:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchResource();
    }, [id]);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/resources/${id}/download`);
            const { file_url } = res.data;

            // Trigger download
            const link = document.createElement('a');
            link.href = file_url;
            link.target = '_blank';
            link.download = resource.title; // Might not work for cross-origin, but tries
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Update local count
            setResource(prev => ({ ...prev, download_count: (prev.download_count || 0) + 1 }));

        } catch (err) {
            console.error("Download failed:", err);
            alert("Failed to get download link.");
        } finally {
            setDownloading(false);
        }
    };

    const handleRate = async (value) => {
        if (!user) return alert("Please login to rate.");
        try {
            const token = session.access_token;
            const res = await axios.post(`http://localhost:5000/api/resources/${id}/rate`,
                { value },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setResource(prev => ({ ...prev, average_rating: res.data.new_average }));
            alert("Rating submitted!");
        } catch (err) {
            console.error(err);
            if (err.response?.status === 400 && err.response?.data?.error === 'Already rated') {
                alert("You have already rated this resource.");
            } else {
                alert("Failed to submit rating.");
            }
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!resource) return <div className="p-8 text-center">Resource not found.</div>;

    return (
        <div className="container max-w-4xl px-4 py-8 mx-auto">
            <div className="overflow-hidden bg-white rounded-lg shadow-md">
                <div className="p-6 text-white bg-blue-600">
                    <h1 className="mb-2 text-3xl font-bold">{resource.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-blue-100">
                        <span className="flex items-center gap-1"><FileText size={18} /> {resource.subject}</span>
                        <span>•</span>
                        <span>{resource.branch} (Sem {resource.semester})</span>
                        <span>•</span>
                        <span className="capitalize">{resource.category}</span>
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex flex-col gap-8 md:flex-row">
                        {/* Main Content */}
                        <div className="flex-1">
                            <h2 className="mb-4 text-xl font-semibold text-slate-800">Description</h2>
                            <p className="mb-6 leading-relaxed text-slate-600">{resource.description || "No description provided."}</p>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <Star fill="currentColor" size={24} />
                                    <span className="text-xl font-bold">{resource.average_rating ? resource.average_rating.toFixed(1) : 'New'}</span>
                                    <span className="text-sm text-slate-400">/ 5</span>
                                </div>
                                <div className="text-sm text-slate-500">
                                    {resource.download_count} Downloads
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <span className="font-medium text-slate-700">Rate this:</span>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        onClick={() => handleRate(star)}
                                        className="text-slate-300 hover:text-yellow-500 focus:outline-none transition-colors"
                                    >
                                        <Star size={24} fill={star <= rating ? "currentColor" : "none"} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar / Actions */}
                        <div className="w-full md:w-64">
                            <div className="p-4 mb-4 border rounded bg-slate-50 border-slate-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex items-center justify-center w-10 h-10 text-blue-600 bg-blue-100 rounded-full">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{resource.users?.name || 'Anonymous'}</p>
                                        <p className="text-xs text-slate-500">Uploader</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Calendar size={14} />
                                    {new Date(resource.created_at).toLocaleDateString()}
                                </div>
                            </div>

                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="flex items-center justify-center w-full gap-2 py-3 font-bold text-white transition-colors bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                <Download size={20} />
                                {downloading ? 'Processing...' : 'Download File'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceDetail;
