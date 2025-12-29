import React from "react";
import { MdCheckCircle, MdClose } from "react-icons/md";

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
    isOpen,
    onClose,
    title = "Success!",
    message = "Your request has been processed successfully.",
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full mx-4 px-12 py-10 animate-fadeIn">
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
                <p className="text-base md:text-lg text-gray-600 text-center leading-relaxed mb-8">
                    {message}
                </p>

                {/* Done button */}
                <button
                    onClick={onClose}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all text-lg"
                >
                    Done
                </button>
            </div>
        </div>
    );
};

export default SuccessModal;
