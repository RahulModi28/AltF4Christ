import { Star, User } from 'lucide-react';

export default function ReviewList({ reviews }) {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500">
                No reviews yet. Be the first to review!
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <div key={review.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="size-8 rounded-full bg-gradient-to-br from-electric-blue to-neon-violet flex items-center justify-center text-white font-bold text-xs">
                                {review.users?.name?.[0] || 'U'}
                            </div>
                            <span className="font-bold text-white text-sm">{review.users?.name || 'Anonymous'}</span>
                        </div>
                        <span className="text-xs text-slate-500">
                            {new Date(review.created_at).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`size-4 ${star <= review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-slate-600'
                                    }`}
                            />
                        ))}
                    </div>

                    <p className="text-slate-300 text-sm">{review.comment}</p>
                </div>
            ))}
        </div>
    );
}
