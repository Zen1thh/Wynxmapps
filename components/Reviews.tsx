import React, { useEffect, useRef } from 'react';
import { Card } from './ui/Card';
import { MOCK_REVIEWS } from '../constants';
import gsap from 'gsap';
import { Star, ThumbsUp, AlertCircle, Check, X } from 'lucide-react';

export const Reviews: React.FC = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
    }, []);

    return (
        <div ref={containerRef} className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Review Moderation</h2>
            
            <div className="grid grid-cols-1 gap-4">
                {MOCK_REVIEWS.map((review) => (
                    <Card key={review.id} className="border-l-4 border-l-blue-500">
                        <div className="flex flex-col md:flex-row gap-4 justify-between">
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center justify-between md:justify-start gap-4">
                                    <h3 className="font-bold text-white">{review.userName}</h3>
                                    <span className="text-xs text-slate-500">{review.date}</span>
                                </div>
                                <div className="flex items-center gap-1 text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-slate-700" : ""} />
                                    ))}
                                    <span className="text-xs text-slate-400 ml-2">({review.rating}.0)</span>
                                </div>
                                <p className="text-sm text-slate-300 italic">"{review.comment}"</p>
                                <div className="text-xs text-blue-400 mt-2">
                                    Station: {review.stationName}
                                </div>
                            </div>
                            
                            <div className="flex md:flex-col items-center justify-end gap-2 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                                <div className={`px-2 py-1 rounded text-xs font-bold w-full text-center mb-2 ${
                                    review.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400' :
                                    review.status === 'Flagged' ? 'bg-red-500/10 text-red-400' : 'bg-slate-500/10 text-slate-400'
                                }`}>
                                    {review.status}
                                </div>
                                <div className="flex gap-2 w-full justify-center">
                                    <button className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 p-2 rounded-lg flex justify-center transition-colors" title="Approve">
                                        <Check size={16} />
                                    </button>
                                    <button className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg flex justify-center transition-colors" title="Reject">
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};