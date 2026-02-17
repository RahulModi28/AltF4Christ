import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
    // Mock Data for UI dev (Backend not ready yet)
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        subject: '',
        branch: '',
        semester: '',
        category: ''
    });

    useEffect(() => {
        const fetchResources = async () => {
            setLoading(true);
            try {
                // Using localhost:5000 for hackathon. In prod use env var
                const res = await axios.get('http://localhost:5000/api/resources', {
                    params: filters
                });
                setResources(res.data);
            } catch (err) {
                console.error("Error fetching resources:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchResources();
    }, [filters, search]); // Re-fetch when filters change

    // Helper to clear filters
    const clearFilters = () => setFilters({ subject: '', branch: '', semester: '', category: '' });

    return (
        <div className="container px-4 py-8 mx-auto">
            {/* Search and Filters */}
            <div className="p-6 mb-8 bg-white rounded-lg shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute text-slate-400 left-3 top-3" size={20} />
                        <input
                            type="text"
                            placeholder="Search resources..."
                            className="w-full py-2 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto">
                        <select
                            className="px-4 py-2 bg-white border rounded focus:outline-none"
                            value={filters.branch}
                            onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                        >
                            <option value="">All Branches</option>
                            <option value="CSE">CSE</option>
                            <option value="ECE">ECE</option>
                            <option value="ME">ME</option>
                        </select>
                        <select
                            className="px-4 py-2 bg-white border rounded focus:outline-none"
                            value={filters.semester}
                            onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                        >
                            <option value="">All Semesters</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                        </select>
                        <select
                            className="px-4 py-2 bg-white border rounded focus:outline-none"
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        >
                            <option value="">All Categories</option>
                            <option value="notes">Notes</option>
                            <option value="question_paper">Question Paper</option>
                            <option value="assignment">Assignment</option>
                        </select>
                        <button onClick={clearFilters} className="px-4 py-2 text-sm text-red-500 hover:text-red-700 whitespace-nowrap">
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Resource Grid */}
            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : resources.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                    <p className="text-xl">No resources found.</p>
                    <p>Try adjusting your search or filters, or <Link to="/upload" className="text-blue-600 hover:underline">upload a new resource</Link>.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Map resources here */}
                    {resources.map(res => (
                        <div key={res.id} className="p-4 bg-white border rounded shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-lg text-slate-800">{res.title}</h3>
                            <p className="text-sm text-slate-500 mb-2">{res.subject} • {res.branch}</p>
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">{res.category.replace('_', ' ')}</span>
                                <Link to={`/resource/${res.id}`} className="text-blue-600 text-sm hover:underline">View Details</Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
