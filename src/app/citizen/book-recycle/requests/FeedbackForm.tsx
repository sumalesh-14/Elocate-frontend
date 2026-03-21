"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { MdStar, MdClose, MdSend, MdExpandMore } from "react-icons/md";
import { toast } from "react-toastify";
import { getToken } from "@/app/citizen/sign-in/auth";

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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Prevent background scrolling when modal is open
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

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
            const token = getToken();
            const response = await fetch(`/api/v1/feedback?userId=${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { "Authorization": `Bearer ${token}` }),
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

    if (!mounted) return null;

    const modalContent = (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[99999] p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-[32px] shadow-2xl max-w-2xl w-full p-10 relative overflow-hidden"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>

                {/* Header */}
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">Share Your Experience</h2>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Help us improve</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-rose-50 hover:text-rose-600 text-gray-400 rounded-[16px] transition-all"
                    >
                        <MdClose className="text-2xl" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    {/* Rating */}
                    <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100 flex flex-col items-center justify-center">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
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
                                    className="transition-transform hover:scale-125 focus:outline-none"
                                >
                                    <MdStar
                                        className={`text-5xl transition-colors ${
                                            star <= (hoverRating || rating)
                                                ? "text-yellow-400 drop-shadow-md"
                                                : "text-gray-200"
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category */}
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                                Feedback Category
                            </label>
                            <div className="relative">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-[20px] font-bold text-gray-700 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer pr-12"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                                <MdExpandMore className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 text-2xl pointer-events-none" />
                            </div>
                        </div>

                        {/* Comment */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                                <span>Additional Comments (Optional)</span>
                                <span className={comment.length >= 1000 ? "text-rose-500" : "text-gray-400"}>{comment.length}/1000</span>
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value.slice(0, 1000))}
                                placeholder="Share additional thoughts, suggestions, or areas of improvement..."
                                maxLength={1000}
                                rows={4}
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-[24px] font-bold text-gray-700 outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-[0.4] px-6 py-5 bg-white border-2 border-gray-100 text-gray-500 font-black uppercase tracking-widest text-[11px] rounded-[24px] hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || rating === 0}
                            className="flex-1 px-6 py-5 bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] rounded-[24px] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-3"
                        >
                            <MdSend className="text-xl" />
                            {loading ? "Transmitting..." : "Submit Experience"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );

    return createPortal(modalContent, document.body);
};
