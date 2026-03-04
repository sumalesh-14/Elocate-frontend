import React from "react";
import { MdCheckCircle, MdClose, MdFileDownload, MdFullscreen, MdFullscreenExit } from "react-icons/md";
import SuccessReceiptTemplate from "./SuccessReceiptTemplate";
import { generateReceiptPDF } from "@/lib/utils/generatePDF";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    formData?: any;
    requestId?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
    isOpen,
    onClose,
    title = "Success!",
    message = "Your request has been processed successfully.",
    formData,
    requestId,
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent scroll when maximized
    useEffect(() => {
        if (isMaximized) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMaximized]);

    const handleDownload = async () => {
        if (!formData) return;
        setIsGenerating(true);
        const success = await generateReceiptPDF(requestId || 'NEW', formData);
        setIsGenerating(false);
    };

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full mx-auto px-6 md:px-12 py-10 animate-fadeIn my-auto">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <MdClose className="text-2xl" />
                </button>

                {/* Check icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                        <MdCheckCircle className="text-green-500 text-5xl" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-4">
                    {title}
                </h2>

                {/* Message */}
                <p className="text-base md:text-lg text-gray-600 text-center leading-relaxed mb-6">
                    {message}
                </p>

                {/* Receipt Preview */}
                {formData && (
                    <div className="mb-8 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50 shadow-inner group relative">
                        {/* Maximize Button */}
                        <button
                            onClick={() => setIsMaximized(true)}
                            className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur shadow-sm rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-white transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2 font-bold text-xs"
                        >
                            <MdFullscreen size={20} />
                            Maximize View
                        </button>

                        <div className="max-h-[400px] overflow-y-auto p-4 md:p-8 scrollbar-thin">
                            <SuccessReceiptTemplate
                                id={requestId || 'NEW'}
                                formData={formData}
                                userName={formData.contactName || 'Valued User'}
                                date={new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            />
                        </div>
                    </div>
                )}

                {/* Maximized Overlay */}
                {isMaximized && (
                    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center p-4 md:p-10 animate-fadeIn overflow-hidden">
                        <div className="w-full max-w-5xl flex justify-between items-center mb-6 pb-6 border-b border-slate-100">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Receipt Intelligence View</h3>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Full Document Fidelity</p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleDownload}
                                    disabled={isGenerating}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    <MdFileDownload size={22} />
                                    {isGenerating ? "Generating..." : "Download PDF"}
                                </button>
                                <button
                                    onClick={() => setIsMaximized(false)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-3 rounded-xl transition-all"
                                >
                                    <MdFullscreenExit size={28} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 w-full overflow-y-auto flex justify-center pb-20 scrollbar-thin">
                            <div className="bg-white shadow-2xl rounded-sm border border-slate-100">
                                <SuccessReceiptTemplate
                                    id={requestId || 'NEW'}
                                    formData={formData}
                                    userName={formData.contactName || 'Valued User'}
                                    date={new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    {formData && (
                        <button
                            onClick={handleDownload}
                            disabled={isGenerating}
                            className="flex-1 bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-bold py-4 px-6 rounded-xl shadow-sm transition-all text-lg flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <MdFileDownload className="text-2xl" />
                            {isGenerating ? "Generating..." : "Download PDF"}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all text-lg"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default SuccessModal;
