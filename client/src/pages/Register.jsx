import { useState } from 'react';
import { supabase } from '../api/supabase';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        branch: '',
        semester: '',
        year: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    name: formData.name,
                    branch: formData.branch,
                    semester: formData.semester,
                    year: formData.year
                }
            }
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // User created, trigger will handle profile creation
            alert('Registration successful! Please login.');
            navigate('/login');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold text-center text-slate-800">Register</h2>
                {error && <div className="p-3 text-red-500 bg-red-100 rounded">{error}</div>}
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium text-slate-600">Full Name</label>
                        <input type="text" name="name" required onChange={handleChange} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-slate-600">Email</label>
                        <input type="email" name="email" required onChange={handleChange} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-slate-600">Password</label>
                        <input type="password" name="password" required onChange={handleChange} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium text-slate-600">Branch</label>
                            <input type="text" name="branch" required onChange={handleChange} placeholder="e.g. CSE" className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-slate-600">Year</label>
                            <select name="year" required onChange={handleChange} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500">
                                <option value="">Select</option>
                                <option value="1">1st</option>
                                <option value="2">2nd</option>
                                <option value="3">3rd</option>
                                <option value="4">4th</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-slate-600">Semester</label>
                        <select name="semester" required onChange={handleChange} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500">
                            <option value="">Select</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <p className="text-center text-slate-600">
                    Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
