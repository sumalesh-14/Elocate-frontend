"use client";
import React, { useEffect } from "react";
import { MdCheckCircle, MdClose } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

interface ToastProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    autoHideDuration?: number;
}

const Toast: React.FC<ToastProps> = ({
    isOpen,
    onClose,
    title,
    message,
    autoHideDuration = 10000,
}) => {
    useEffect(() => {
        if (isOpen && autoHideDuration) {
            const timer = setTimeout(() => {
                onClose();
            }, autoHideDuration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoHideDuration, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed top-36 right-4 z-[9999]"
                >
                    <div className="w-full max-w-lg">
                        <div className="bg-white border-l-4 border-[#22c55e] shadow-lg rounded-r-lg">
                            <div className="p-6 pl-6 flex items-center gap-5">
                                <div className="shrink-0 text-[#22c55e]">
                                    <MdCheckCircle className="text-5xl" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-[#0d1b12] text-xl">
                                        {title}
                                    </h3>
                                    <p className="text-[#22c55e] text-lg mt-1">
                                        {message}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="shrink-0 text-gray-400 hover:text-[#22c55e] px-2"
                                >
                                    <MdClose className="text-xl" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
