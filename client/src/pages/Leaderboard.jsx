import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Medal, Award, User } from 'lucide-react';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/users/leaderboard');
                setUsers(res.data);
            } catch (err) {
                console.error("Error fetching leaderboard:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const getRankIcon = (index) => {
        if (index === 0) return <Trophy className="text-yellow-500" size={24} />;
        if (index === 1) return <Medal className="text-slate-400" size={24} />;
        if (index === 2) return <Award className="text-amber-700" size={24} />;
        return <span className="text-slate-400 font-bold w-6 text-center">{index + 1}</span>;
    };

    if (loading) return <div className="p-8 text-center">Loading Leaderboard...</div>;

    return (
        <div className="container max-w-2xl px-4 py-8 mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Top Contributors</h1>
                <p className="text-slate-500">Recognizing the students who help others learn.</p>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="divide-y divide-slate-100">
                    {users.map((user, index) => (
                        <div key={index} className="flex items-center p-4 hover:bg-slate-50 transition-colors">
                            <div className="w-12 flex justify-center">
                                {getRankIcon(index)}
                            </div>
                            <div className="flex items-center justify-center w-10 h-10 mr-4 text-blue-600 bg-blue-100 rounded-full">
                                <User size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-800">{user.name}</h3>
                                <p className="text-xs text-slate-500">{user.branch} • Year {user.year}</p>
                            </div>
                            <div className="font-bold text-blue-600">
                                {user.points} <span className="text-xs font-normal text-slate-400">pts</span>
                            </div>
                        </div>
                    ))}
                    {users.length === 0 && (
                        <div className="p-8 text-center text-slate-500">No data available yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
