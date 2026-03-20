"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Mic, MicOff, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { sendMessageToGemini } from '@/services/geminiService';

export interface Message {
    role: 'user' | 'model';
    text: string;
    isError?: boolean;
    suggestions?: string[];
}

// Map known paths to friendly labels
const PATH_LABELS: Record<string, string> = {
    '/': 'Home',
    '/citizen': 'Citizen Home',
    '/citizen/sign-in': 'Sign In',
    '/citizen/about': 'About',
    '/citizen/analyze': 'Analyze Device',
    '/citizen/book-recycle': 'Book Recycle',
    '/citizen/book-recycle/new': 'New Request',
    '/citizen/book-recycle/requests': 'My Requests',
    '/citizen/book-recycle/settings': 'Settings',
    '/citizen/e-facilities': 'Find Facilities',
    '/citizen/education': 'Education Lab',
    '/citizen/rules': 'Recycling Rules',
    '/citizen/support': 'Support',
    '/citizen/contactus': 'Contact Us',
    '/citizen/profile': 'My Profile',
    '/citizen/profile/edit-profile': 'Edit Profile',
    '/citizen/profile/settings': 'Profile Settings',
    '/citizen/privacypolicy': 'Privacy Policy',
    '/citizen/termsandservices': 'Terms of Service',
    '/intermediary': 'Intermediary Portal',
    '/intermediary/sign-in': 'Intermediary Sign In',
    '/intermediary/dashboard': 'Dashboard',
    '/intermediary/collections': 'Collections',
    '/intermediary/clients': 'Clients',
    '/intermediary/assign-drivers': 'Assign Drivers',
    '/intermediary/schedule': 'Schedule',
    '/intermediary/reports': 'Reports',
    '/admin': 'Admin Panel',
};

/**
 * Renders inline markdown: **bold**, `code`, `/path` as clickable pill buttons.
 * All elements are truly inline so they flow within the text without line breaks.
 */
const renderInline = (raw: string, keyPrefix: string): React.ReactNode[] => {
    const parts = raw.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, j) => {
        const key = `${keyPrefix}-${j}`;
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={key} className="font-semibold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            const inner = part.slice(1, -1);
            if (inner.startsWith('/')) {
                const label = PATH_LABELS[inner] || inner.split('/').filter(Boolean).pop() || inner;
                return (
                    <a
                        key={key}
                        href={inner}
                        className="text-eco-700 hover:text-white bg-eco-50 hover:bg-eco-600 border border-eco-300 rounded-full px-3 py-0.5 text-[1.3rem] font-medium transition-all no-underline inline-block"
                        style={{ display: 'inline-block', margin: '0 4px', whiteSpace: 'nowrap' }}
                    >
                        → {label}
                    </a>
                );
            }
            return <code key={key} className="bg-eco-100 text-eco-800 px-1 rounded text-[1.3rem] font-mono">{inner}</code>;
        }
        return <React.Fragment key={key}>{part}</React.Fragment>;
    });
};

const isNewBlockStarter = (t: string): boolean =>
    /^\d+\.\s/.test(t) ||
    /^[*\-•]\s/.test(t) ||
    /^#{1,3}\s/.test(t);

/**
 * Normalise LLM output.
 *
 * The LLM breaks sentences across multiple lines (with or without blank lines
 * between fragments). Strategy:
 *   - Blank lines are IGNORED unless they appear between two block-starters
 *     (i.e. between two separate list items / paragraphs).
 *   - Any non-block line is always merged onto the most recent non-blank output line.
 *   - A new block-starter always starts a fresh entry.
 */
const normaliseText = (raw: string): string => {
    const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    const out: string[] = [];   // final merged lines
    let pendingBlank = false;   // tracks whether we saw a blank line

    for (const line of lines) {
        const t = line.trim();

        if (!t) {
            pendingBlank = true;
            continue;
        }

        if (isNewBlockStarter(t)) {
            // New list item / heading — always a fresh line
            if (pendingBlank && out.length > 0) out.push(''); // keep paragraph gap
            out.push(t);
            pendingBlank = false;
            continue;
        }

        // Plain text / inline fragment
        if (out.length > 0 && !pendingBlank) {
            // No blank line between — always merge onto previous line
            const joiner = /^[.,!?]/.test(t) ? '' : ' ';
            out[out.length - 1] = out[out.length - 1].trimEnd() + joiner + t;
        } else if (out.length > 0 && pendingBlank) {
            // There WAS a blank line — check if previous output line is a block item
            // If so, this fragment is a continuation of that item (LLM put blank between)
            const prev = out[out.length - 1].trim();
            if (isNewBlockStarter(prev) || prev === '') {
                // Continuation of a list item across a blank line — merge
                const joiner = /^[.,!?]/.test(t) ? '' : ' ';
                out[out.length - 1] = out[out.length - 1].trimEnd() + joiner + t;
            } else {
                // Genuine paragraph break
                out.push('');
                out.push(t);
            }
            pendingBlank = false;
        } else {
            out.push(t);
            pendingBlank = false;
        }
    }

    return out.join('\n');
};

// Text formatter — handles bold, bullet lists, numbered lists, inline code, and clickable paths
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
    const normalised = normaliseText(text);
    const lines = normalised.split('\n');

    return (
        <div className="text-[1.4rem] leading-7 space-y-1.5">
            {lines.map((line, i) => {
                const t = line.trim();
                if (!t) return <div key={i} className="h-1" />;

                // Numbered list item
                const numMatch = t.match(/^(\d+)\.\s+([\s\S]+)/);
                if (numMatch) {
                    return (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '2rem 1fr', gap: '0.25rem' }}>
                            <span className="text-eco-500 font-semibold text-[1.3rem] pt-[0.3rem] text-right inline-block">{numMatch[1]}.</span>
                            <span className="inline-block">{renderInline(numMatch[2], String(i))}</span>
                        </div>
                    );
                }

                // Bullet list item
                const bulletMatch = t.match(/^[*\-•]\s+([\s\S]+)/);
                if (bulletMatch) {
                    return (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5rem 1fr', gap: '0.25rem' }}>
                            <span className="text-eco-400 text-[1.5rem] pt-[0.1rem] text-center inline-block">•</span>
                            <span className="inline-block">{renderInline(bulletMatch[1], String(i))}</span>
                        </div>
                    );
                }

                // Heading
                const headingMatch = t.match(/^#{1,3}\s+([\s\S]+)/);
                if (headingMatch) {
                    return <div key={i} className="font-semibold text-eco-800 text-[1.6rem] mt-2 mb-1">{headingMatch[1]}</div>;
                }

                // Regular paragraph
                return <div key={i}>{renderInline(t, String(i))}</div>;
            })}
        </div>
    );
};

const SESSION_KEY = 'ecobot_session_id';

export const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [input, setInput] = useState('');

    // Load session from sessionStorage on mount (clears on page refresh/tab close automatically)
    const [sessionId, setSessionId] = useState<string | undefined>(() => {
        if (typeof window === 'undefined') return undefined;
        return sessionStorage.getItem(SESSION_KEY) || undefined;
    });

    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: 'Hi there! 👋 I\'m EcoBot, your e-waste recycling assistant. Here are some things you can ask me:' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const SAMPLE_QUESTIONS = [
        '♻️ How do I recycle my old phone?',
        '🔋 Where can I drop off old batteries?',
        '💻 What happens to recycled laptops?',
        '🌿 Why is e-waste harmful to the environment?',
    ];

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
            // Only send history if no session_id yet (first message)
            const history = sessionId ? [] : messages.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            }));

            const result = await sendMessageToGemini(userMessage.text, history, sessionId);

            if (result.sessionId && !sessionId) {
                setSessionId(result.sessionId);
                sessionStorage.setItem(SESSION_KEY, result.sessionId);
            }

            setMessages(prev => [...prev, { role: 'model', text: result.text, suggestions: result.suggestions }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error.", isError: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSampleQuestion = (question: string) => {
        setInput(question);
        inputRef.current?.focus();
    };

    const handleSuggestionClick = (question: string) => {
        setInput(question);
        inputRef.current?.focus();
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

    const handleRefresh = () => {
        if (isLoading) return;
        setSessionId(undefined);
        sessionStorage.removeItem(SESSION_KEY);
        setMessages([
            { role: 'model', text: 'Hi there! 👋 I\'m EcoBot, your e-waste recycling assistant. Here are some things you can ask me:' }
        ]);
        setInput('');
        if (isListening) setIsListening(false);
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
                style={{ zIndex: 9998 }}
                className={`fixed inset-0 bg-eco-950/20 backdrop-blur-[2px] transition-opacity duration-500
          ${isOpen && isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
                onClick={() => setIsExpanded(false)}
            />

            {/* Chat Window */}
            <div
                style={{ zIndex: 9999 }}
                className={`
          fixed flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl origin-bottom-right
          ${!isOpen ? 'translate-y-12 opacity-0 scale-90 pointer-events-none' : 'translate-y-0 opacity-100 scale-100 pointer-events-auto'}
          ${isExpanded
                        ? 'bottom-[5vh] right-[5vw] w-[90vw] h-[90vh] max-h-[90vh] rounded-[3rem]'
                        : 'bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[600px] max-h-[80vh] rounded-[2rem]'
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
                            <Sparkles className={`${isExpanded ? 'w-7 h-7' : 'w-6 h-6'} text-tech-lime`} />
                        </div>
                        <div>
                            <h3 className={`font-display font-bold text-white leading-tight ${isExpanded ? 'text-[2.6rem]' : 'text-[1.8rem]'}`}>EcoBot AI</h3>
                            <p className="text-eco-200 text-[1.2rem] font-outfit">Powered by Gemini</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            suppressHydrationWarning
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className={`text-eco-200 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Start new chat"
                        >
                            <RefreshCw size={18} />
                        </button>
                        <button
                            suppressHydrationWarning
                            onClick={toggleExpand}
                            className="text-eco-200 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors"
                            title={isExpanded ? "Minimize" : "Expand"}
                        >
                            {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </button>
                        <button
                            suppressHydrationWarning
                            onClick={handleClose}
                            className="text-eco-200 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gradient-to-b from-eco-50/30 to-white/60">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                            {/* Role label */}
                            <span className={`text-[1.1rem] font-medium px-2 ${msg.role === 'user' ? 'text-eco-400' : 'text-eco-500'}`}>
                                {msg.role === 'user' ? 'You' : 'EcoBot'}
                            </span>

                            {/* Bubble */}
                            <div
                                className={`
                  px-4 py-3 rounded-2xl shadow-sm font-outfit w-fit
                  ${isExpanded ? 'max-w-[75%]' : msg.role === 'user' ? 'max-w-[85%]' : 'max-w-[90%]'}
                  ${msg.role === 'user'
                                        ? 'bg-eco-700 text-white rounded-tr-sm self-end text-right'
                                        : 'bg-white text-eco-900 border border-eco-100 rounded-tl-sm'}
                  ${msg.isError ? 'bg-red-50 text-red-600 border-red-200' : ''}
                `}
                            >
                                <FormattedText text={msg.text} />
                            </div>

                            {/* Suggestion chips below bot messages */}
                            {msg.role === 'model' && msg.suggestions && msg.suggestions.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-1 w-full">
                                    {msg.suggestions.map((s, si) => (
                                        <button
                                            key={si}
                                            suppressHydrationWarning
                                            onClick={() => handleSuggestionClick(s)}
                                            className="text-[1.2rem] text-eco-700 bg-white hover:bg-eco-600 hover:text-white border border-eco-300 rounded-full px-4 py-2 transition-all font-outfit shadow-sm hover:shadow active:scale-95 text-left"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Sample questions — shown only before any user message */}
                    {!messages.some(m => m.role === 'user') && (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {SAMPLE_QUESTIONS.map((q, i) => (
                                <button
                                    key={i}
                                    suppressHydrationWarning
                                    onClick={() => handleSampleQuestion(q)}
                                    className="text-[1.2rem] text-eco-700 bg-white hover:bg-eco-600 hover:text-white border border-eco-300 rounded-full px-4 py-2 transition-all font-outfit shadow-sm hover:shadow active:scale-95"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex items-start gap-1.5">
                            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-eco-100 shadow-sm flex gap-1.5 items-center">
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
                            suppressHydrationWarning
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={isListening ? "Listening..." : "Ask about recycling..."}
                            className={`
                w-full bg-eco-50 border-none rounded-full text-eco-900 placeholder-eco-400 focus:ring-2 focus:ring-eco-500/50 focus:outline-none transition-all font-outfit
                ${isExpanded ? 'py-5 pl-7 pr-24 text-[1.8rem]' : 'py-3.5 pl-6 pr-20 text-[1.4rem] md:text-[1.5rem]'}
                ${isListening ? 'ring-2 ring-red-400/50 bg-red-50' : ''}
              `}
                        />

                        <div className="absolute right-2 flex items-center gap-1">
                            <button
                                suppressHydrationWarning
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
                                suppressHydrationWarning
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
                style={{ zIndex: 10000 }}
                suppressHydrationWarning
                onClick={() => {
                    if (isExpanded && isOpen) {
                        setIsOpen(false);
                        setTimeout(() => setIsExpanded(false), 300);
                    } else {
                        setIsOpen(!isOpen);
                    }
                }}
                className={`
          fixed bottom-8 right-8 group flex items-center justify-center w-20 h-20 rounded-full shadow-2xl transition-all duration-300 hover:scale-110
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
