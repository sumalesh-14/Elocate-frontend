"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MdStar, MdCalendarToday } from "react-icons/md";
import { format } from "date-fns";
import { getToken } from "@/app/citizen/sign-in/auth";

interface Feedback {
    id: string;
    recycleRequestId: string;
    userId: string;
    rating: number;
    comment?: string;
    category: string;
    createdAt: string;
}

interface FeedbackViewProps {
    recycleRequestId: string;
    onAddFeedback?: () => void;
    onFeedbackStatus?: (hasFeedback: boolean) => void;
}

export const FeedbackView: React.FC<FeedbackViewProps> = ({ recycleRequestId, onAddFeedback, onFeedbackStatus }) => {
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const abortController = new AbortController();

        const fetchFeedback = async () => {
            try {
                const token = getToken();
                const response = await fetch(`/api/v1/feedback/request/${recycleRequestId}`, {
                    headers: {
                        ...(token && { "Authorization": `Bearer ${token}` }),
                    },
                    credentials: "include",
                    signal: abortController.signal,
                });

                if (response.status === 404) {
                    setFeedback(null);
                    if (onFeedbackStatus) onFeedbackStatus(false);
                    return;
                }

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    console.error("Feedback fetch error:", response.status, errData);
                    throw new Error(errData?.error || errData?.message || "Failed to fetch feedback");
                }

                const data = await response.json();
                setFeedback(data);
                if (onFeedbackStatus) onFeedbackStatus(true);
            } catch (err: any) {
                if (err.name === 'AbortError') return;
                console.error("Error fetching feedback:", err);
                setError(err instanceof Error ? err.message : "Failed to load feedback");
            } finally {
                setLoading(false);
            }
        };

        fetchFeedback();

        return () => {
            abortController.abort();
        };
    }, [recycleRequestId]);

    if (loading) {
        return (
            <div className="text-center py-12 bg-white/40 rounded-[32px] border-2 border-dashed border-blue-100/50 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-blue-500 font-black text-xs uppercase tracking-widest animate-pulse">Syncing Feedback...</p>
            </div>
        );
    }

    if (!feedback) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-rose-100 rounded-[32px] bg-white">
                <div className="w-16 h-16 bg-rose-50 text-rose-300 rounded-full flex items-center justify-center mb-4">
                    <MdStar className="text-3xl" />
                </div>
                <p className="text-sm font-bold text-gray-500 mb-6 leading-relaxed px-4">You haven't shared your experience for this request yet. Help us serve you better!</p>
                {onAddFeedback && (
                    <button
                        onClick={onAddFeedback}
                        className="px-8 py-4 bg-rose-600 text-white rounded-[20px] font-black uppercase tracking-widest text-[11px] hover:bg-rose-700 transition-colors shadow-xl shadow-rose-900/10 active:scale-95"
                    >
                        Share Feedback
                    </button>
                )}
            </div>
        );
    }

    const categoryLabel = feedback.category.replace(/_/g, " ");

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100"
        >
            <h4 className="text-lg font-bold text-gray-900 mb-4">Your Feedback</h4>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <MdStar
                            key={star}
                            className={`text-2xl ${
                                star <= feedback.rating ? "text-yellow-400" : "text-gray-300"
                            }`}
                        />
                    ))}
                </div>
                <span className="text-sm font-semibold text-gray-600">
                    {feedback.rating} out of 5
                </span>
            </div>

            {/* Category */}
            <div className="mb-3">
                <span className="inline-block px-3 py-1 bg-blue-200 text-blue-800 text-xs font-semibold rounded-full">
                    {categoryLabel}
                </span>
            </div>

            {/* Comment */}
            {feedback.comment && (
                <p className="text-gray-700 text-sm mb-4 leading-relaxed">{feedback.comment}</p>
            )}

            {/* Date */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <MdCalendarToday className="text-sm" />
                <span>{format(new Date(feedback.createdAt), "MMM dd, yyyy 'at' hh:mm a")}</span>
            </div>
        </motion.div>
    );
};
