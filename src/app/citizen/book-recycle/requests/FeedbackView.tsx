"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MdStar, MdCalendarToday } from "react-icons/md";
import { format } from "date-fns";

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
}

export const FeedbackView: React.FC<FeedbackViewProps> = ({ recycleRequestId }) => {
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const response = await fetch(`/api/v1/feedback/request/${recycleRequestId}`, {
                    credentials: "include",
                });

                if (response.status === 404) {
                    setFeedback(null);
                    return;
                }

                if (!response.ok) {
                    throw new Error("Failed to fetch feedback");
                }

                const data = await response.json();
                setFeedback(data);
            } catch (err) {
                console.error("Error fetching feedback:", err);
                setError(err instanceof Error ? err.message : "Failed to load feedback");
            } finally {
                setLoading(false);
            }
        };

        fetchFeedback();
    }, [recycleRequestId]);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
            </div>
        );
    }

    if (!feedback) {
        return null;
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
