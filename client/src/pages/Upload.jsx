import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle, Zap, HardDrive, Layers, BookOpen, Calendar, Tag } from 'lucide-react';

export default function Upload({ isEditing = false }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams(); // Get resource ID if editing
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    console.log('Upload Component Render', { isEditing, id, user, loading });

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        branch: '',
        semester: '',
        year: '',
        resource_type: 'notes',
        privacy: 'public',
        tags: ''
    });
    const [file, setFile] = useState(null);
    const [originalFileUrl, setOriginalFileUrl] = useState(null); // Keep track of existing file

    useEffect(() => {
        if (isEditing && id && user) {
            fetchResource();
        }
    }, [isEditing, id, user]);

    const fetchResource = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('resources')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            // Check ownership
            if (data.uploaded_by !== user.id) {
                setError('You do not have permission to edit this resource');
                setTimeout(() => navigate('/profile'), 2000);
                return;
            }

            setFormData({
                title: data.title,
                description: data.description || '',
                subject: data.subject,
                branch: data.branch,
                semester: data.semester?.toString() || '',
                year: data.year?.toString() || '',
                resource_type: data.resource_type || 'notes',
                privacy: data.privacy || 'public',
                tags: Array.isArray(data.tags) ? data.tags.join(', ') : ''
            });
            setOriginalFileUrl(data.file_url);
        } catch (err) {
            console.error(err);
            setError('Failed to load resource data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: File is required only for new uploads
        if (!isEditing && !file) {
            setError('Please select a file to upload');
            return;
        }

        try {
            setLoading(true);
            setError('');

            let publicUrl = originalFileUrl;
            let fileExt = isEditing && !file ? null : (file.name.split('.').pop());

            // 1. Upload new file if selected
            if (file) {
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('resources')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('resources')
                    .getPublicUrl(filePath);
                publicUrl = data.publicUrl;
            }

            // 3. Insert or Update Metadata
            const categoryMap = {
                'notes': 'notes',
                'qp': 'question_paper',
                'solution': 'assignment',
                'report': 'project',
                'material': 'reference'
            };

            const payload = {
                title: formData.title,
                description: formData.description,
                subject: formData.subject,
                branch: formData.branch,
                semester: parseInt(formData.semester),
                year: parseInt(formData.year),
                resource_type: formData.resource_type,
                category: categoryMap[formData.resource_type] || 'notes',
                privacy: formData.privacy,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                // Only update file info if a new file was uploaded
                ...(file && { file_url: publicUrl, file_type: fileExt })
            };

            if (isEditing) {
                const { error: dbError } = await supabase
                    .from('resources')
                    .update(payload)
                    .eq('id', id)
                    .eq('uploaded_by', user.id); // Extra safety

                if (dbError) throw dbError;
                setSuccess(true);
                setTimeout(() => navigate('/profile'), 2000); // Redirect back to profile
            } else {
                // Insert new
                payload.uploaded_by = user.id;
                payload.college = user.college || 'Christ University';

                const { error: dbError } = await supabase
                    .from('resources')
                    .insert([payload]);

                if (dbError) throw dbError;

                // Award Points only for new uploads
                await supabase.rpc('increment_points', {
                    user_id: user.id,
                    points_to_add: 10
                });

                setSuccess(true);
                setTimeout(() => navigate('/'), 2000);
            }

        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to save resource');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 pt-28 pb-8 relative">
            {/* Background Accents */}
            <div className="absolute top-[10%] left-[-10%] size-[500px] bg-electric-blue/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[10%] right-[-10%] size-[500px] bg-neon-violet/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative z-10">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold font-display text-white flex items-center justify-center gap-3">
                        <div className="bg-pitch-black/50 p-2 rounded-lg border border-white/10">
                            <UploadIcon className="h-8 w-8 text-electric-blue" />
                        </div>
                        {isEditing ? 'Edit Node Data' : 'Upload Node Data'}
                    </h1>
                    <p className="mt-2 text-slate-400">
                        {isEditing ? 'Modify existing knowledge entry' : 'Contribute knowledge to the neural network'}
                    </p>
                </div>

                <div className="glass-card p-8">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-400 font-medium">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="bg-acid-green/10 border border-acid-green/20 rounded-xl p-4 mb-6 flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-acid-green flex-shrink-0" />
                            <p className="text-sm text-acid-green font-medium">Data upload complete. Syncing to network...</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* File Upload Zone */}
                        <div className="group relative">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Source File</label>
                            <div className="relative border-2 border-dashed border-white/10 rounded-xl p-8 hover:border-electric-blue/50 transition-colors bg-pitch-black/30 group-hover:bg-pitch-black/50 cursor-pointer text-center">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="space-y-4">
                                    <div className="mx-auto w-16 h-16 rounded-full bg-electric-blue/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FileText className="h-8 w-8 text-electric-blue" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">
                                            {file ? file.name : 'Click to select or drag file here'}
                                        </p>
                                        <p className="text-slate-500 text-sm mt-1">PDF, PNG, JPG (Max 10MB)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Title</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                            <Tag className="h-5 w-5" />
                                        </span>
                                        <input
                                            type="text"
                                            name="title"
                                            required
                                            value={formData.title}
                                            onChange={handleChange}
                                            className="appearance-none block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-pitch-black/50 text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 focus:bg-pitch-black/80 transition-all sm:text-sm font-medium"
                                            placeholder="e.g., Data Structures Notes"
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Subject</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                            <BookOpen className="h-5 w-5" />
                                        </span>
                                        <input
                                            type="text"
                                            name="subject"
                                            required
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="appearance-none block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-pitch-black/50 text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 focus:bg-pitch-black/80 transition-all sm:text-sm font-medium"
                                            placeholder="e.g. Computer Science"
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Resource Type</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                            <Layers className="h-5 w-5" />
                                        </span>
                                        <select
                                            name="resource_type"
                                            value={formData.resource_type}
                                            onChange={handleChange}
                                            className="appearance-none block w-full pl-10 pr-10 py-3 border border-white/10 rounded-xl bg-pitch-black/50 text-white focus:outline-none focus:border-electric-blue/50 focus:bg-pitch-black/80 transition-all sm:text-sm font-medium"
                                        >
                                            <option value="notes">Notes</option>
                                            <option value="qp">Question Paper</option>
                                            <option value="solution">Solution</option>
                                            <option value="report">Project Report</option>
                                            <option value="material">Study Material</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Visibility</label>
                                    <div className="flex gap-4">
                                        <label className={`flex-1 cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${formData.privacy === 'public' ? 'border-electric-blue bg-electric-blue/10 text-white' : 'border-white/10 text-slate-500 hover:border-white/30'}`}>
                                            <input
                                                type="radio"
                                                name="privacy"
                                                value="public"
                                                checked={formData.privacy === 'public'}
                                                onChange={handleChange}
                                                className="hidden"
                                            />
                                            <span className="font-bold text-sm">Public</span>
                                        </label>
                                        <label className={`flex-1 cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${formData.privacy === 'private' ? 'border-neon-violet bg-neon-violet/10 text-white' : 'border-white/10 text-slate-500 hover:border-white/30'}`}>
                                            <input
                                                type="radio"
                                                name="privacy"
                                                value="private"
                                                checked={formData.privacy === 'private'}
                                                onChange={handleChange}
                                                className="hidden"
                                            />
                                            <span className="font-bold text-sm">Private</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tags</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                            <Tag className="h-5 w-5" />
                                        </span>
                                        <input
                                            type="text"
                                            name="tags"
                                            value={formData.tags}
                                            onChange={handleChange}
                                            className="appearance-none block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-pitch-black/50 text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 focus:bg-pitch-black/80 transition-all sm:text-sm font-medium"
                                            placeholder="e.g. loops, arrays, logic (comma separated)"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Branch</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                                <Zap className="h-5 w-5" />
                                            </span>
                                            <input
                                                type="text"
                                                name="branch"
                                                required
                                                value={formData.branch}
                                                onChange={handleChange}
                                                className="appearance-none block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-pitch-black/50 text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 focus:bg-pitch-black/80 transition-all sm:text-sm font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Semester</label>
                                        <input
                                            type="number"
                                            name="semester"
                                            required
                                            value={formData.semester}
                                            onChange={handleChange}
                                            className="appearance-none block w-full px-4 py-3 border border-white/10 rounded-xl bg-pitch-black/50 text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 focus:bg-pitch-black/80 transition-all sm:text-sm font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Academic Year</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                            <Calendar className="h-5 w-5" />
                                        </span>
                                        <input
                                            type="number"
                                            name="year"
                                            required
                                            value={formData.year}
                                            onChange={handleChange}
                                            className="appearance-none block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-pitch-black/50 text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 focus:bg-pitch-black/80 transition-all sm:text-sm font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        rows={4}
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-4 py-3 border border-white/10 rounded-xl bg-pitch-black/50 text-white placeholder-slate-600 focus:outline-none focus:border-electric-blue/50 focus:bg-pitch-black/80 transition-all sm:text-sm font-medium"
                                        placeholder="Brief description..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold uppercase tracking-wider rounded-xl text-white bg-electric-blue hover:bg-electric-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electric-blue disabled:opacity-50 neon-shadow-blue transition-all active:scale-[0.98]"
                            >
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <HardDrive className="h-5 w-5 text-white/50 group-hover:text-white transition-colors" />
                                </span>
                                {loading ? (isEditing ? 'Updating...' : 'Uploading Data...') : (isEditing ? 'Update Node' : 'Initiate Upload')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
