import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle, Zap, HardDrive, Layers, BookOpen, Calendar, Tag, Loader2 } from 'lucide-react';

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

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const getFileExtension = (file) => {
        if (!file) return null;
        return file.name.split('.').pop().toUpperCase();
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
                'material': 'reference',
                'prompt': 'prompt'
            };

            const payload = {
                title: formData.title,
                description: formData.description,
                subject: formData.subject,
                semester: parseInt(formData.semester),
                year: parseInt(formData.year),
                resource_type: formData.resource_type,
                category: categoryMap[formData.resource_type] || 'notes',
                privacy: formData.privacy,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                // Auto-tag with user's academic details
                branch: user.branch,
                department: user.department,
                college: user.college || 'Christ University',
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
        <div className="max-w-6xl mx-auto px-4 pt-32 pb-12 relative min-h-screen flex text-slate-300">
            {/* Engaging Dynamic Background */}
            <div className="fixed inset-0 bg-pitch-black z-[-3]"></div>
            <div className="fixed inset-0 bg-grid opacity-[0.15] z-[-2] pointer-events-none"></div>
            <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-electric-blue/20 rounded-full blur-[120px] pointer-events-none animate-float z-[-1]"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-neon-violet/20 rounded-full blur-[120px] pointer-events-none animate-float-delayed z-[-1]"></div>
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-pitch-black/50 to-pitch-black z-[-1] pointer-events-none"></div>

            <div className="w-full relative z-10 flex flex-col">
                <div className="mb-10 text-left border-b border-white/10 pb-6 flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-display font-semibold text-white tracking-tight flex items-center gap-3">
                            <UploadIcon className="h-7 w-7 text-slate-400" />
                            {isEditing ? 'Edit Knowledge Node' : 'Upload Resource Data'}
                        </h1>
                        <p className="mt-2 text-sm text-slate-500 max-w-xl">
                            {isEditing ? 'Update the metadata and source files for your existing contribution to the network.' : 'Contribute verified academic materials to the central database. Ensure all metadata is accurate for optimal indexing.'}
                        </p>
                    </div>
                </div>

                <div className="w-full">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-400 font-medium">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-8 flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                            <p className="text-sm text-emerald-400 font-medium">Data transmission complete. Navigating...</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-10">

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* Left Column (5 columns wide) */}
                            <div className="lg:col-span-5 flex flex-col gap-6">

                                {/* Title */}
                                <div className="group flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Title</label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-4 text-slate-500 pointer-events-none">
                                            <Tag className="h-4 w-4" />
                                        </div>
                                        <input
                                            type="text"
                                            name="title"
                                            required
                                            value={formData.title}
                                            onChange={handleChange}
                                            className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-white/30 focus:bg-white/[0.04] transition-all placeholder:text-slate-600"
                                            placeholder="Prompt For CIA Python Mini Project"
                                        />
                                    </div>
                                </div>

                                {/* Subject */}
                                <div className="group flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subject</label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-4 text-slate-500 pointer-events-none">
                                            <BookOpen className="h-4 w-4" />
                                        </div>
                                        <input
                                            type="text"
                                            name="subject"
                                            required
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-white/30 focus:bg-white/[0.04] transition-all placeholder:text-slate-600"
                                            placeholder="e.g. Computer Science"
                                        />
                                    </div>
                                </div>

                                {/* Resource Type */}
                                <div className="group flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resource Type</label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-4 text-slate-500 pointer-events-none">
                                            <Layers className="h-4 w-4" />
                                        </div>
                                        <select
                                            name="resource_type"
                                            value={formData.resource_type}
                                            onChange={handleChange}
                                            className="w-full appearance-none bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-white/30 focus:bg-white/[0.04] transition-all cursor-pointer"
                                        >
                                            <option value="notes" className="bg-pitch-black">Notes</option>
                                            <option value="qp" className="bg-pitch-black">Question Paper</option>
                                            <option value="solution" className="bg-pitch-black">Solution</option>
                                            <option value="report" className="bg-pitch-black">Project Report</option>
                                            <option value="material" className="bg-pitch-black">Study Material</option>
                                            <option value="prompt" className="bg-pitch-black">Prompt</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Visibility Toggle */}
                                <div className="group flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Visibility</label>
                                    <div className="flex gap-4">
                                        <label className={`flex-1 cursor-pointer border rounded-xl p-2.5 flex items-center justify-center transition-all ${formData.privacy === 'public' ? 'border-blue-500/50 bg-blue-500/10 text-white' : 'border-white/10 text-slate-500 hover:border-white/20 bg-white/[0.01]'}`}>
                                            <input
                                                type="radio"
                                                name="privacy"
                                                value="public"
                                                checked={formData.privacy === 'public'}
                                                onChange={handleChange}
                                                className="hidden"
                                            />
                                            <span className="font-semibold text-sm">Public</span>
                                        </label>
                                        <label className={`flex-1 cursor-pointer border rounded-xl p-2.5 flex items-center justify-center transition-all ${formData.privacy === 'private' ? 'border-slate-400/50 bg-slate-500/10 text-white' : 'border-white/10 text-slate-500 hover:border-white/20 bg-white/[0.01]'}`}>
                                            <input
                                                type="radio"
                                                name="privacy"
                                                value="private"
                                                checked={formData.privacy === 'private'}
                                                onChange={handleChange}
                                                className="hidden"
                                            />
                                            <span className="font-semibold text-sm">Private</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="group flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tags</label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-4 text-slate-500 pointer-events-none">
                                            <Tag className="h-4 w-4" />
                                        </div>
                                        <input
                                            type="text"
                                            name="tags"
                                            value={formData.tags}
                                            onChange={handleChange}
                                            className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-white/30 focus:bg-white/[0.04] transition-all placeholder:text-slate-600"
                                            placeholder="e.g. loops, arrays, logic (comma separated)"
                                        />
                                    </div>
                                </div>

                            </div>

                            {/* Right Column (7 columns wide) */}
                            <div className="lg:col-span-7 flex flex-col gap-6">

                                <div className="grid grid-cols-2 gap-6">
                                    {/* Semester */}
                                    <div className="group flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Semester</label>
                                        <input
                                            type="number"
                                            name="semester"
                                            required
                                            min="1"
                                            max="10"
                                            value={formData.semester}
                                            onChange={handleChange}
                                            className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-white/30 focus:bg-white/[0.04] transition-all"
                                        />
                                    </div>

                                    {/* Academic Year */}
                                    <div className="group flex flex-col gap-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Academic Year</label>
                                        <div className="relative flex items-center">
                                            <div className="absolute left-4 text-slate-500 pointer-events-none">
                                                <Calendar className="h-4 w-4" />
                                            </div>
                                            <input
                                                type="number"
                                                name="year"
                                                required
                                                min="2000"
                                                value={formData.year}
                                                onChange={handleChange}
                                                className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-white/30 focus:bg-white/[0.04] transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="group flex flex-col gap-2 flex-grow">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full h-full min-h-[160px] bg-white/[0.02] border border-white/10 rounded-xl py-4 px-4 text-white text-sm focus:outline-none focus:border-white/30 focus:bg-white/[0.04] transition-all placeholder:text-slate-600 resize-none"
                                        placeholder="Brief description of the material..."
                                    />
                                </div>

                            </div>
                        </div>

                        {/* File Upload Zone spanning full width at bottom */}
                        <div className="mt-6 pt-8 border-t border-white/5">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Attachment Source</label>
                            <label className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/20 transition-all cursor-pointer overflow-hidden group">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                {file ? (
                                    <div className="flex flex-col items-center z-0 text-center px-4">
                                        <div className="p-3 bg-white/5 rounded-full mb-3 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                                            <FileText className="h-8 w-8 text-blue-400" />
                                        </div>
                                        <p className="text-sm font-medium text-white truncate max-w-xs">{file.name}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-slate-300">
                                                {getFileExtension(file)}
                                            </span>
                                            <span className="text-xs text-slate-500 font-medium">{formatFileSize(file.size)}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center z-0">
                                        <div className="p-4 bg-white/[0.02] rounded-full mb-4 group-hover:bg-white/[0.05] transition-colors">
                                            <HardDrive className="h-8 w-8 text-slate-500 group-hover:text-slate-300 transition-colors" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-300">Click to fetch local file, or drag and drop</p>
                                        <p className="text-xs text-slate-500 mt-1">Supports PDF, DOCX, ZIP, PNG, JPG (Max 10MB)</p>
                                    </div>
                                )}
                            </label>
                        </div>

                        {/* Submit Action */}
                        <div className="pt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl text-sm font-bold tracking-wide text-white bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 transition-all"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
                                ) : (
                                    <UploadIcon className="h-4 w-4 text-slate-300 group-hover:animate-bounce-subtle" />
                                )}
                                {isEditing ? 'Save Changes' : 'Upload Resource'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
