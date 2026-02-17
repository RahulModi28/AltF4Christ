import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, BookOpen, Star, Trophy, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
    const { user, session } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = session.access_token;
                const res = await axios.get('http://localhost:5000/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfile(res.data);
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchProfile();
    }, [user, session]);

    if (loading) return <div className="p-8 text-center">Loading Profile...</div>;
    if (!profile) return <div className="p-8 text-center">Profile not found.</div>;

    return (
        <div className="container max-w-4xl px-4 py-8 mx-auto">
            {/* Header Card */}
            <div className="p-8 mb-8 bg-white rounded-lg shadow-md">
                <div className="flex flex-col items-center gap-6 md:flex-row">
                    <div className="flex items-center justify-center w-24 h-24 text-blue-600 bg-blue-100 rounded-full">
                        <User size={48} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-slate-800">{profile.name}</h1>
                        <p className="text-slate-500">{profile.branch} • Sem {profile.semester} • Year {profile.year}</p>
                        <div className="flex items-center justify-center gap-2 mt-2 text-sm text-slate-400 md:justify-start">
                            <Calendar size={14} /> Joined {new Date(profile.created_at).toLocaleDateString()}
                        </div>
                    </div>
                    <div className="flex flex-col items-center p-4 rounded bg-yellow-50 text-yellow-700 min-w-[120px]">
                        <Trophy size={24} className="mb-1" />
                        <span className="text-2xl font-bold">{profile.points}</span>
                        <span className="text-xs uppercase tracking-wide">Points</span>
                    </div>
                </div>
            </div>

            {/* Uploads Section */}
            <h2 className="mb-4 text-xl font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="text-blue-600" /> My Uploads
            </h2>

            {profile.uploads && profile.uploads.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {profile.uploads.map(upload => (
                        <div key={upload.id} className="p-4 border rounded bg-white hover:shadow-sm transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-slate-800 truncate pr-2">{upload.title}</h3>
                                <span className="text-xs bg-slate-100 px-2 py-1 rounded capitalize">{upload.category}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-500 mt-3">
                                <div className="flex items-center gap-1">
                                    <Star size={14} className="text-yellow-500 fill-current" />
                                    {upload.average_rating.toFixed(1)}
                                </div>
                                <div>{upload.download_count} Downloads</div>
                                <Link to={`/resource/${upload.id}`} className="ml-auto text-blue-600 hover:underline text-xs">View</Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-8 text-center bg-slate-50 rounded border border-dashed border-slate-300 text-slate-500">
                    You haven't uploaded any resources yet. <Link to="/upload" className="text-blue-600 hover:underline">Start sharing!</Link>
                </div>
            )}
        </div>
    );
};

export default Profile;
