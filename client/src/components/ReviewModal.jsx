import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Star, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ReviewModal({ resourceId, onClose, onReviewSubmitted }) {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a star rating');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const { error } = await supabase
                .from('reviews')
                .upsert({
                    user_id: user.id,
                    resource_id: resourceId,
                    rating,
                    comment
                });

            if (error) throw error;

            onReviewSubmitted();
            onClose();
        } catch (err) {
            console.error(err);
            setError('Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-card w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                    <X className="h-5 w-5" />
                </button>

                <h2 className="text-2xl font-bold font-display text-white mb-6">Rate Resource</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="focus:outline-none transition-transform hover:scale-110"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                            >
                                <Star
                                    className={`h-8 w-8 ${(hoverRating || rating) >= star
                                            ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                                            : 'text-slate-600'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Review (Optional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full h-32 px-4 py-3 bg-pitch-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-electric-blue/50 transition-colors resize-none"
                            placeholder="Share your thoughts about this resource..."
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 px-4 bg-electric-blue hover:bg-electric-blue/90 text-white font-bold rounded-xl transition-all disabled:opacity-50 neon-shadow-blue"
                    >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            </div>
        </div>
    );
}
