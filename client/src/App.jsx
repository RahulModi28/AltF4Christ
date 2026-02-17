import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import ResourceDetail from './pages/ResourceDetail';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user && !localStorage.getItem('sb-access-token')) {
        // Basic check, AuthContext will handle true state.
        // For now, redirect if no user.
        // Ideally we wait for loading.
        return <Navigate to="/login" />;
    }
    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
                    <Navbar />
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route path="/" element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        } />
                        <Route path="/upload" element={
                            <ProtectedRoute>
                                <Upload />
                            </ProtectedRoute>
                        } />
                        <Route path="/resource/:id" element={
                            <ProtectedRoute>
                                <ResourceDetail />
                            </ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        } />
                        <Route path="/leaderboard" element={
                            <ProtectedRoute>
                                <Leaderboard />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
