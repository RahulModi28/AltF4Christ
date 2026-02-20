import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, User, BookOpen, Calendar, Zap, Lock, Eye, EyeOff, ArrowRight, Loader2, Mail, MapPin, GraduationCap, Building2, ChevronDown } from 'lucide-react';

// ─── Christ University Course Data (from official tables) ──────────────────────
const COURSE_DATA = {
    'Bangalore Central Campus': {
        'School of Arts, Humanities and Social Sciences': [
            'Bachelor of Arts Communication and Media, English and Psychology',
            'Bachelor of Arts Economics, Political Science, Sociology',
            'Bachelor of Arts History, Economics, Political Science',
            'Bachelor of Arts Journalism, Psychology, English',
            'Bachelor of Arts Music-Western Classical, Psychology, English',
            'Bachelor of Arts Performing Arts, English, Psychology',
            'Bachelor of Arts Psychology, Sociology, Economics',
            'Bachelor of Arts Psychology, Sociology, English',
            'Bachelor of Arts Theatre Studies, English and Psychology',
            'Bachelor of Arts (Philosophy)'
        ],
        'School of Sciences': [
            'Bachelor of Computer Applications (BCA)',
            'Bachelor of Science Biotechnology, Chemistry, Botany',
            'Bachelor of Science Biotechnology, Chemistry, Zoology',
            'Bachelor of Science Chemistry, Botany, Zoology',
            'Bachelor of Science Computer Science, Mathematics, Electronics',
            'Bachelor of Science Computer Science, Mathematics, Statistics',
            'Bachelor of Science Economics, Mathematics, Statistics',
            'Bachelor of Science Physics, Chemistry, Mathematics',
            'Bachelor of Science Physics, Mathematics, Electronics'
        ],
        'School of Commerce, Finance, Accountancy, Business and Management': [
            'Bachelor of Commerce (BCom)',
            'Bachelor of Commerce (Morning)',
            'Bachelor of Commerce (Honours)',
            'Bachelor of Commerce (Strategic Finance Honours)',
            'Bachelor of Commerce (Finance and Accountancy)',
            'Bachelor of Commerce (International Finance)',
            'Bachelor of Commerce (Professional)',
            'Bachelor of Business Administration (BBA) - Finance and Accountancy',
            'Bachelor of Business Administration (BBA)',
            'Bachelor of Business Administration (BBA) Decision Science (Industry Integrated)',
            'Bachelor of Hotel Management (BHM)'
        ],
        'School of Law': [
            'Bachelor of Law (BA, LLB) (Honours)',
            'Bachelor of Law (BBA, LLB) (Honours)'
        ],
        'School of Education': [
            'Bachelor of Education (BEd)'
        ]
    },
    'Bangalore Yeshwanthpur Campus': {
        'School of Arts, Humanities and Social Sciences': [
            'Bachelor of Arts (Communication and Media, Psychology)',
            'Bachelor of Arts (Psychology, Economics)',
            'Bachelor of Arts (Psychology, English)',
            'Bachelor of Arts Economics (Honours)',
            'Bachelor of Science Psychology (Honours)'
        ],
        'School of Sciences': [
            'Bachelor of Computer Applications (BCA)',
            'Bachelor of Science (Computer Science, Mathematics)',
            'Bachelor of Science (Economics, Mathematics)'
        ],
        'School of Business and Management': [
            'Bachelor of Business Administration (BBA)',
            'Bachelor of Business Administration (BBA) - Finance and Accountancy',
            'Bachelor of Business Administration (BBA) - Finance and Economics',
            'Bachelor of Business Administration (BBA) - Finance and International Business',
            'Bachelor of Business Administration (BBA) - Finance and Marketing Analytics',
            'Bachelor of Business Administration (BBA) - Honours'
        ],
        'School of Commerce, Finance, Accountancy': [
            'Bachelor of Commerce (BCom)',
            'Bachelor of Commerce (Honours)',
            'Bachelor of Commerce (Finance and Accountancy)'
        ]
    },
    'Bangalore Kengeri Campus': {
        'School of Engineering and Technology': [
            'BTech in (Computer Science and Engineering - Artificial Intelligence and Machine Learning)',
            'BTech in (Computer Science and Engineering - Data Science)',
            'BTech in (Computer Science and Engineering - IoT)',
            'BTech in Automobile Engineering',
            'BTech in Civil Engineering',
            'BTech in Computer Science and Engineering',
            'BTech in Electrical and Electronics Engineering',
            'BTech in Electronics and Communication Engineering',
            'BTech in Electronics and Computer Engineering (with Spl. in Artificial Intelligence & Machine Learning)',
            'BTech in Information Technology',
            'BTech in Mechanical Engineering',
            'BTech in Robotics and Mechatronics',
            'BTech in Civil Engineering (Construction Engineering and Management) (with Spl. in AI & ML)',
            'BTech in Artificial Intelligence and Machine Learning'
        ],
        'School of Engineering and Technology (Lateral Entry)': [
            'BTech in (Computer Science and Engineering - Artificial Intelligence and Machine Learning) - (Lateral Entry)',
            'BTech in (Computer Science and Engineering - Data Science) - (Lateral Entry)',
            'BTech in (Computer Science and Engineering - IoT) - (Lateral Entry)',
            'BTech in Automobile Engineering (Lateral Entry)',
            'BTech in Civil Engineering (Lateral Entry)',
            'BTech in Computer Science and Engineering (Lateral Entry)',
            'BTech in Electrical and Electronics Engineering (Lateral Entry)',
            'BTech in Electronics and Communication Engineering (Lateral Entry)',
            'BTech in Electronics and Computer Engineering (with Spl. in Artificial Intelligence & Machine Learning) - (Lateral Entry)',
            'BTech in Information Technology (Lateral Entry)',
            'BTech in Mechanical Engineering (Lateral Entry)',
            'BTech in Robotics and Mechatronics - (Lateral Entry)',
            'BTech in Civil Engineering (Construction Engineering and Management) (with Spl. in AI & ML) - (Lateral Entry)'
        ],
        'School of Business and Management': [
            'Bachelor of Business Administration (BBA)'
        ],
        'School of Social Sciences': [
            'Bachelor of Science Psychology (Honours)'
        ],
        'School of Architecture': [
            'Bachelor of Architecture (BArch)'
        ]
    },
    'Bangalore Bannerghatta Road Campus': {
        'School of Arts, Humanities and Social Sciences': [
            'Bachelor of Arts (Political Science Honours)',
            'Bachelor of Arts Economics (Honours)',
            'Bachelor of Arts English (Honours)',
            'Bachelor of Arts Journalism (Honours)',
            'Bachelor of Arts Liberal Arts',
            'Bachelor of Science Psychology (Honours)',
            'Bachelor of Arts Economics, Media Studies, Political Science',
            'Bachelor of Arts English, Political Science, History'
        ],
        'School of Business and Management': [
            'Bachelor of Business Administration (BBA) - Finance and International Business',
            'Bachelor of Business Administration (BBA) - Honours',
            'Bachelor of Business Administration (BBA) - (Tourism and Travel Management)'
        ]
    }
};

// ─── Custom Select Component ─────────────────────────────────────────────────
function SelectField({ label, icon: Icon, name, value, onChange, options, placeholder, disabled }) {
    return (
        <div className="group">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
            <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none z-10">
                    <Icon className="h-5 w-5" />
                </span>
                <select
                    name={name}
                    required
                    className="input-field pl-10 pr-10 appearance-none cursor-pointer"
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    style={{ color: value ? 'white' : '#64748b' }}
                >
                    <option value="" disabled>{placeholder}</option>
                    {options.map((opt) => (
                        <option key={opt} value={opt} style={{ color: 'white', backgroundColor: '#0a0a0f' }}>
                            {opt}
                        </option>
                    ))}
                </select>
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 pointer-events-none">
                    <ChevronDown className="h-4 w-4" />
                </span>
            </div>
        </div>
    );
}

// ─── Main Registration Component ─────────────────────────────────────────────
export default function Register() {
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        campus: '',
        department: '',
        program: '',
        semester: '',
        year: '',
    });

    // ─── Cascading options ───────────────────────────────────────────────
    const campuses = Object.keys(COURSE_DATA);

    const departments = useMemo(() => {
        if (!formData.campus) return [];
        return Object.keys(COURSE_DATA[formData.campus] || {});
    }, [formData.campus]);

    const programs = useMemo(() => {
        if (!formData.campus || !formData.department) return [];
        return COURSE_DATA[formData.campus]?.[formData.department] || [];
    }, [formData.campus, formData.department]);

    const semesters = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];

    // ─── Handlers ────────────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };
            // Reset dependent fields on cascade change
            if (name === 'campus') {
                updated.department = '';
                updated.program = '';
            }
            if (name === 'department') {
                updated.program = '';
            }
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            const { error } = await signUp(formData.email, formData.password, {
                name: formData.name,
                campus: formData.campus,
                department: formData.department,
                branch: formData.program,       // stored as branch for backward compat
                semester: formData.semester,
                year: formData.year,
                college: 'Christ University',
            });
            if (error) throw error;
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const canProceedStep1 = formData.name && formData.campus && formData.department && formData.program;
    const canProceedStep2 = formData.semester && formData.year;

    return (
        <div className="min-h-screen flex items-center justify-center pt-28 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid opacity-30"></div>
            <div className="absolute top-[20%] right-[10%] size-[500px] bg-electric-blue/15 rounded-full blur-[150px] animate-float pointer-events-none"></div>
            <div className="absolute bottom-[20%] left-[10%] size-[500px] bg-acid-green/15 rounded-full blur-[150px] animate-float-delayed pointer-events-none"></div>

            <div className="max-w-md w-full relative z-10 animate-fade-in-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-6">
                        <div className="size-20 rounded-full p-[2px] bg-gradient-to-tr from-acid-green to-electric-blue animate-spin-slow">
                            <div className="size-full rounded-full bg-pitch-black flex items-center justify-center">
                                <Zap className="h-10 w-10 text-acid-green fill-current" />
                            </div>
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white font-display mb-2">Initialize Identity</h2>
                    <p className="text-sm text-slate-500 font-medium">Create a secure node profile</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center gap-2 mb-8 px-4">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex-1 flex items-center gap-2">
                            <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-acid-green' : 'bg-white/10'
                                }`}></div>
                        </div>
                    ))}
                </div>

                {/* Form */}
                <div className="glass-card p-8 neon-shadow-green">
                    {error && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6 animate-scale-in">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Step 1: Personal & Academic Info */}
                        {step === 1 && (
                            <div className="space-y-4 animate-fade-in-up">
                                <h3 className="text-xs font-bold text-acid-green uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="size-5 rounded-full bg-acid-green/10 flex items-center justify-center text-acid-green text-[10px]">1</span>
                                    Academic Profile
                                </h3>

                                {/* Full Name */}
                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                            <User className="h-5 w-5" />
                                        </span>
                                        <input name="name" type="text" required className="input-field pl-10" placeholder="John Doe" value={formData.name} onChange={handleChange} />
                                    </div>
                                </div>

                                {/* Campus */}
                                <SelectField
                                    label="Campus"
                                    icon={MapPin}
                                    name="campus"
                                    value={formData.campus}
                                    onChange={handleChange}
                                    options={campuses}
                                    placeholder="Select your campus"
                                />

                                {/* Department */}
                                <SelectField
                                    label="Department"
                                    icon={Building2}
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    options={departments}
                                    placeholder={formData.campus ? 'Select your department' : 'Select campus first'}
                                    disabled={!formData.campus}
                                />

                                {/* Program */}
                                <SelectField
                                    label="Program"
                                    icon={GraduationCap}
                                    name="program"
                                    value={formData.program}
                                    onChange={handleChange}
                                    options={programs}
                                    placeholder={formData.department ? 'Select your program' : 'Select department first'}
                                    disabled={!formData.department}
                                />

                                <button
                                    type="button"
                                    disabled={!canProceedStep1}
                                    onClick={() => setStep(2)}
                                    className="group w-full flex justify-center items-center gap-2 py-3.5 px-4 bg-acid-green hover:bg-acid-green/90 text-pitch-black rounded-xl text-sm font-bold font-display uppercase tracking-wider transition-all neon-shadow-green hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
                                >
                                    Continue
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        )}

                        {/* Step 2: Semester & Year */}
                        {step === 2 && (
                            <div className="space-y-4 animate-fade-in-up">
                                <h3 className="text-xs font-bold text-acid-green uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="size-5 rounded-full bg-acid-green/10 flex items-center justify-center text-acid-green text-[10px]">2</span>
                                    Course Details
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <SelectField
                                        label="Semester"
                                        icon={BookOpen}
                                        name="semester"
                                        value={formData.semester}
                                        onChange={handleChange}
                                        options={semesters}
                                        placeholder="Sem"
                                    />
                                    <SelectField
                                        label="Year"
                                        icon={Calendar}
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        options={years}
                                        placeholder="Year"
                                    />
                                </div>

                                {/* Summary of selections */}
                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Your Selections</p>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs">
                                            <MapPin className="h-3 w-3 text-acid-green flex-shrink-0" />
                                            <span className="text-slate-400 truncate">{formData.campus}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <Building2 className="h-3 w-3 text-electric-blue flex-shrink-0" />
                                            <span className="text-slate-400 truncate">{formData.department}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <GraduationCap className="h-3 w-3 text-neon-violet flex-shrink-0" />
                                            <span className="text-slate-400 truncate">{formData.program}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setStep(1)} className="flex-1 py-3.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-bold font-display uppercase tracking-wider transition-all active:scale-95">
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!canProceedStep2}
                                        onClick={() => setStep(3)}
                                        className="group flex-1 flex justify-center items-center gap-2 py-3.5 px-4 bg-acid-green hover:bg-acid-green/90 text-pitch-black rounded-xl text-sm font-bold font-display uppercase tracking-wider transition-all neon-shadow-green hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
                                    >
                                        Continue
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Credentials */}
                        {step === 3 && (
                            <div className="space-y-4 animate-fade-in-up">
                                <h3 className="text-xs font-bold text-acid-green uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="size-5 rounded-full bg-acid-green/10 flex items-center justify-center text-acid-green text-[10px]">3</span>
                                    Credentials
                                </h3>
                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                            <Mail className="h-5 w-5" />
                                        </span>
                                        <input name="email" type="email" required className="input-field pl-10" placeholder="student@christuniversity.in" value={formData.email} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Passkey</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                            <Lock className="h-5 w-5" />
                                        </span>
                                        <input
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            className="input-field pl-10 pr-12"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setStep(2)} className="flex-1 py-3.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-bold font-display uppercase tracking-wider transition-all active:scale-95">
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="group flex-[2] flex justify-center items-center gap-2 py-3.5 px-4 bg-acid-green hover:bg-acid-green/90 text-pitch-black rounded-xl text-sm font-bold font-display uppercase tracking-wider transition-all neon-shadow-green hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        {loading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Lock className="h-4 w-4" />
                                                Complete Registration
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <span className="text-sm text-slate-500 mr-1">Already a node?</span>
                        <Link to="/login" className="text-sm font-bold text-electric-blue hover:text-neon-violet transition-colors">
                            Reconnect →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
