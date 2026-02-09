"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Mic, MicOff, Maximize2, Minimize2 } from 'lucide-react';
import { sendMessageToGemini } from '@/services/geminiService';

export interface Message {
    role: 'user' | 'model';
    text: string;
    isError?: boolean;
}

// Simple text formatter component to handle bolding and lists
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
    const lines = text.split('\n');
    return (
        <div className="space-y-1">
            {lines.map((line, i) => {
                if (!line.trim()) return <div key={i} className="h-2" />; // Spacing for empty lines

                const isListItem = line.trim().startsWith('* ') || line.trim().startsWith('- ');
                const cleanLine = isListItem ? line.trim().replace(/^[\*\-] /, '') : line;

                // Split text by bold markers (**text**)
                const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

                const content = parts.map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j} className="font-bold text-current">{part.slice(2, -2)}</strong>;
                    }
                    return <span key={j}>{part}</span>;
                });

                if (isListItem) {
                    return (
                        <div key={i} className="flex gap-2 items-start pl-1">
                            <span className="text-eco-1000 font-bold mt-1.5 text-[10px]">•</span>
                            <p className="flex-1">{content}</p>
                        </div>
                    )
                }

                return <p key={i}>{content}</p>;
            })}
        </div>
    );
};

export const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: 'Hello! I\'m EcoBot. I can help you identify recyclable devices or find a drop-off point. How can I assist you today? 🌿' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isExpanded]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Convert internal message format to Gemini history format
            const history = messages.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            }));

            const responseText = await sendMessageToGemini(userMessage.text, history);

            setMessages(prev => [...prev, { role: 'model', text: responseText }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error.", isError: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toggleVoiceInput = () => {
        if (isListening) {
            setIsListening(false);
            return;
        }

        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Voice input is not supported in this browser.");
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
            inputRef.current?.focus();
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput((prev) => (prev ? prev + ' ' : '') + transcript);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.start();
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const handleClose = () => {
        setIsOpen(false);
        // Optional: reset expansion on close after a delay to smooth animation
        setTimeout(() => setIsExpanded(false), 300);
    };

    return (
        <>
            {/* Backdrop for Expanded State */}
            <div
                className={`fixed inset-0 bg-eco-950/20 backdrop-blur-[2px] z-[45] transition-opacity duration-500
          ${isOpen && isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
                onClick={() => setIsExpanded(false)}
            />

            {/* Chat Window */}
            <div
                className={`
          fixed z-[50] flex flex-col overflow-hidden transition-all duration-700 cubic-bezier(0.19, 1, 0.22, 1) bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl
          ${isExpanded
                        ? 'top-[5vh] left-[5vw] w-[90vw] h-[90vh] rounded-[3rem] origin-center'
                        : `bottom-28 right-8 w-[90vw] md:w-[450px] h-[600px] rounded-[2rem] origin-bottom-right ${isOpen ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto' : 'translate-y-12 opacity-0 scale-90 pointer-events-none'}`
                    }
        `}
            >
                {/* Header */}
                <div className={`
          flex items-center justify-between transition-all duration-300
          ${isExpanded ? 'p-6 bg-eco-900/95' : 'p-5 bg-eco-900/90'}
        `}>
                    <div className="flex items-center gap-3">
                        <div className={`
              rounded-full bg-tech-lime/20 flex items-center justify-center border border-tech-lime/30 transition-all
              ${isExpanded ? 'w-12 h-12' : 'w-10 h-10'}
            `}>
                            <Sparkles className={`${isExpanded ? 'w-6 h-6' : 'w-5 h-5'} text-tech-lime`} />
                        </div>
                        <div>
                            <h3 className={`font-display font-bold text-white leading-tight ${isExpanded ? 'text-xl' : 'text-lg'}`}>EcoBot AI</h3>
                            <p className="text-eco-200 text-xs font-sans">Powered by Gemini</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={toggleExpand}
                            className="text-eco-200 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors"
                            title={isExpanded ? "Minimize" : "Expand"}
                        >
                            {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </button>
                        <button
                            onClick={handleClose}
                            className="text-eco-200 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white/50">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`
                  p-4 rounded-2xl text-sm leading-relaxed font-sans shadow-sm transition-all duration-300
                  ${isExpanded ? 'max-w-[70%] text-base p-6' : 'max-w-[85%]'}
                  ${msg.role === 'user'
                                        ? 'bg-eco-800 text-white rounded-tr-none'
                                        : 'bg-white text-eco-900 border border-eco-100 rounded-tl-none'}
                  ${msg.isError ? 'bg-red-50 text-red-600 border-red-200' : ''}
                `}
                            >
                                <FormattedText text={msg.text} />
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-eco-100 shadow-sm flex gap-2 items-center">
                                <div className="w-2 h-2 bg-eco-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-eco-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-eco-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className={`
          bg-white/80 border-t border-eco-100
          ${isExpanded ? 'p-6' : 'p-4'}
        `}>
                    <div className="relative flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={isListening ? "Listening..." : "Ask about recycling..."}
                            className={`
                w-full bg-eco-50 border-none rounded-full text-eco-900 placeholder-eco-400 focus:ring-2 focus:ring-eco-500/50 focus:outline-none transition-all font-sans
                ${isExpanded ? 'py-4 pl-6 pr-24 text-lg' : 'py-3 pl-5 pr-20'}
                ${isListening ? 'ring-2 ring-red-400/50 bg-red-50' : ''}
              `}
                        />

                        <div className="absolute right-2 flex items-center gap-1">
                            <button
                                onClick={toggleVoiceInput}
                                className={`
                  rounded-full transition-all hover:bg-eco-100
                  ${isExpanded ? 'p-3' : 'p-2'}
                  ${isListening ? 'text-red-500 animate-pulse bg-red-100' : 'text-eco-600'}
                `}
                                title="Voice Input"
                            >
                                {isListening ? <MicOff size={isExpanded ? 22 : 18} /> : <Mic size={isExpanded ? 22 : 18} />}
                            </button>

                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className={`
                  bg-eco-600 rounded-full text-white hover:bg-eco-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:scale-105
                  ${isExpanded ? 'p-3' : 'p-2'}
                `}
                            >
                                <Send size={isExpanded ? 22 : 18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toggle Button (Fixed to bottom right) */}
            <button
                onClick={() => {
                    if (isExpanded && isOpen) {
                        setIsOpen(false);
                        setTimeout(() => setIsExpanded(false), 300);
                    } else {
                        setIsOpen(!isOpen);
                    }
                }}
                className={`
          fixed bottom-8 right-8 z-[60] group flex items-center justify-center w-20 h-20 rounded-full shadow-2xl transition-all duration-300 hover:scale-110
          ${isOpen ? 'bg-eco-800 rotate-90' : 'bg-gradient-to-br from-eco-500 to-eco-700 rotate-0'}
        `}
            >
                <span className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-75 group-hover:opacity-100 duration-1000"></span>
                {isOpen ? (
                    <X className="text-white w-10 h-10 transition-transform" />
                ) : (
                    <MessageCircle className="text-white w-10 h-10 transition-transform" />
                )}
            </button>
        </>
    );
};
