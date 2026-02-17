import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Upload as UploadIcon, User, Home as HomeIcon, Trophy } from 'lucide-react';

const Navbar = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="container px-4 mx-auto">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-blue-600">
                        <span>CampusShare</span>
                    </Link>

                    <div className="flex items-center space-x-6">
                        <Link to="/" className="flex items-center space-x-1 text-slate-600 hover:text-blue-600">
                            <HomeIcon size={20} />
                            <span className="hidden sm:inline">Home</span>
                        </Link>
                        <Link to="/upload" className="flex items-center space-x-1 text-slate-600 hover:text-blue-600">
                            <UploadIcon size={20} />
                            <span className="hidden sm:inline">Upload</span>
                        </Link>
                        {/* Leaderboard link */}
                        <Link to="/leaderboard" className="flex items-center space-x-1 text-slate-600 hover:text-blue-600">
                            <Trophy size={20} />
                            <span className="hidden sm:inline">Leaderboard</span>
                        </Link>

                        <div className="relative group">
                            <button className="flex items-center space-x-1 text-slate-600 hover:text-blue-600 focus:outline-none">
                                <User size={20} />
                                <span className="hidden sm:inline">{user?.user_metadata?.name?.split(' ')[0] || 'Profile'}</span>
                            </button>
                            {/* Simple Dropdown */}
                            <div className="absolute right-0 hidden w-48 mt-2 bg-white border rounded shadow-lg group-hover:block border-slate-100">
                                <Link to="/profile" className="block px-4 py-2 text-slate-700 hover:bg-slate-50">My Profile</Link>
                                <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-red-600 hover:bg-slate-50">Logout</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
