import { useState } from 'react';
import { supabase } from '../api/supabase';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
    const { user, session } = useAuth();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        branch: '',
        semester: '',
        year: '',
        category: '',
    });
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a file.");
            return;
        }
        setUploading(true);
        setError(null);

        try {
            // 1. Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { data: storageData, error: storageError } = await supabase.storage
                .from('resources')
                .upload(filePath, file);

            if (storageError) throw storageError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('resources')
                .getPublicUrl(filePath);

            // 3. Save Metadata to Backend
            // We need to send the JWT token
            const token = session.access_token;

            const resourceData = {
                ...formData,
                file_url: publicUrl,
                file_type: fileExt,
                tags: [] // TODO: Add tags input
            };

            // Assuming backend is running on port 5000 localhost for now, need a config
            // DO NOT use hardcoded localhost in real prod, but for hackathon it's ok.
            await axios.post('http://localhost:5000/api/resources', resourceData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            alert('Resource uploaded successfully! You earned 10 points.');
            navigate('/');

        } catch (err) {
            console.error(err);
            setError(err.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container max-w-2xl px-4 py-8 mx-auto">
            <div className="p-8 bg-white rounded shadow-md">
                <h2 className="mb-6 text-2xl font-bold text-slate-800">Upload Resource</h2>
                {error && <div className="p-3 mb-4 text-red-500 bg-red-100 rounded">{error}</div>}

                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium text-slate-600">Title</label>
                        <input type="text" name="title" required onChange={handleChange} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-slate-600">Description</label>
                        <textarea name="description" rows="3" onChange={handleChange} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium text-slate-600">Subject</label>
                            <input type="text" name="subject" required onChange={handleChange} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-slate-600">Category</label>
                            <select name="category" required onChange={handleChange} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500">
                                <option value="">Select</option>
                                <option value="notes">Notes</option>
                                <option value="question_paper">Question Paper</option>
                                <option value="assignment">Assignment</option>
                                <option value="project">Project</option>
                                <option value="reference">Reference</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block mb-1 font-medium text-slate-600">Branch</label>
                            <input type="text" name="branch" required onChange={handleChange} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-slate-600">Semester</label>
                            <select name="semester" required onChange={handleChange} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500">
                                <option value="">Select</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
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

                    <div className="p-4 border-2 border-dashed rounded border-slate-300 bg-slate-50">
                        <label className="block mb-2 font-medium text-slate-600">Upload File</label>
                        <input type="file" required onChange={handleFileChange} className="w-full" />
                        <p className="mt-2 text-xs text-slate-500">PDF, DOCX, IMG supported.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={uploading}
                        className="w-full py-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {uploading ? 'Uploading...' : 'Upload & Earn 10 Points'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Upload;
