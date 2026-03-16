"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { MdStar, MdClose, MdSend } from "react-icons/md";
import { toast } from "react-toastify";

interface FeedbackFormProps {
    recycleRequestId: string;
    userId: string;
    onClose: () => void;
    onSubmitSuccess: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
    recycleRequestId,
    userId,
    onClose,
    onSubmitSuccess,
}) => {
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [comment, setComment] = useState<string>("");
    const [category, setCategory] = useState<string>("OVERALL_EXPERIENCE");
    const [loading, setLoading] = useState(false);

    const categories = [
        { value: "SERVICE_QUALITY", label: "Service Quality" },
        { value: "FACILITY_CLEANLINESS", label: "Facility Cleanliness" },
        { value: "DRIVER_BEHAVIOR", label: "Driver Behavior" },
        { value: "REWARD_ACCURACY", label: "Reward Accuracy" },
        { value: "OVERALL_EXPERIENCE", label: "Overall Experience" },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/v1/feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    recycleRequestId,
                    rating,
                    comment: comment || null,
                    category,
                }),
                credentials: "include",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to submit feedback");
            }

            toast.success("Thank you for your feedback!");
            onSubmitSuccess();
            onClose();
        } catch (error) {
            console.error("Feedback submission error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to submit feedback");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Share Your Feedback</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <MdClose className="text-2xl text-gray-600" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            How would you rate your experience?
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <MdStar
                                        className={`text-4xl transition-colors ${
                                            star <= (hoverRating || rating)
                                                ? "text-yellow-400"
                                                : "text-gray-300"
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Feedback Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                        >
                            {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Additional Comments (Optional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value.slice(0, 1000))}
                            placeholder="Share your thoughts..."
                            maxLength={1000}
                            rows={4}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {comment.length}/1000 characters
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || rating === 0}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            <MdSend className="text-lg" />
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};
