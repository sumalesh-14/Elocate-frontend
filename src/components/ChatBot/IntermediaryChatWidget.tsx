"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, Mic, MicOff, Maximize2, Minimize2, RefreshCw } from "lucide-react";
import { sendMessageToGemini } from "@/services/geminiService";
import { FormattedText, INTERMEDIARY_PATH_LABELS } from "./chatUtils";

export interface Message {
    role: "user" | "model";
    text: string;
    isError?: boolean;
    suggestions?: string[];
}

const INTERMEDIARY_PILL =
    "text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-300 rounded-full px-3 py-0.5 text-[1.3rem] font-medium transition-all no-underline inline-block";

const SESSION_KEY = "intermediary_chat_session_id";

export const IntermediaryChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [input, setInput] = useState("");
    const [sessionId, setSessionId] = useState<string | undefined>(() => {
        if (typeof window === "undefined") return undefined;
        return sessionStorage.getItem(SESSION_KEY) || undefined;
    });
    const [messages, setMessages] = useState<Message[]>([
        { role: "model", text: "Welcome to the Ops Center. 👋 I'm your **Compliance & Logistics Co-Pilot**. I can help you with CPCB rules, driver management, and report analysis. How can I assist your facility today?" },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const SAMPLE_QUESTIONS = [
        "📋 What are the Form-2 filing requirements?",
        "🚛 How do I optimize driver assignments?",
        "📊 Explain the Financials report trends.",
        "⚖️ CPCB E-Waste Rules 2022 summary.",
    ];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen, isExpanded]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMessage: Message = { role: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        try {
            const history = sessionId
                ? []
                : messages.map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] }));

            // Read facility and user context from localStorage (set at login)
            // facilityId is stored directly at login, but fall back to nested user object if missing
            let facilityId: string | undefined = undefined;
            let userId: string | undefined = undefined;
            if (typeof window !== "undefined") {
                facilityId = localStorage.getItem("facilityId") || undefined;
                userId = localStorage.getItem("id") || undefined;

                // Fallback: parse from the full user object stored at login
                if (!facilityId) {
                    try {
                        const stored = JSON.parse(localStorage.getItem("user") || "{}");
                        // UserProfileResponse structure: { user: { facilityId: "..." } }
                        facilityId = stored?.user?.facilityId || stored?.facilityId || undefined;
                        if (facilityId) {
                            // Cache it for next time
                            localStorage.setItem("facilityId", facilityId);
                        }
                    } catch { /* ignore parse errors */ }
                }
            }

            console.log("[Ops Co-Pilot] facilityId:", facilityId, "userId:", userId);

            const result = await sendMessageToGemini(userMessage.text, history, sessionId, "intermediary", facilityId, userId);
            if (result.sessionId && !sessionId) {
                setSessionId(result.sessionId);
                sessionStorage.setItem(SESSION_KEY, result.sessionId);
            }
            setMessages((prev) => [...prev, { role: "model", text: result.text, suggestions: result.suggestions }]);
        } catch {
            setMessages((prev) => [...prev, { role: "model", text: "Sorry, I encountered an error.", isError: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const toggleVoiceInput = () => {
        if (isListening) { setIsListening(false); return; }
        if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
            alert("Voice input is not supported in this browser."); return;
        }
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SR();
        recognition.lang = "en-US"; recognition.interimResults = false; recognition.maxAlternatives = 1;
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => { setIsListening(false); inputRef.current?.focus(); };
        recognition.onresult = (e: any) => setInput((prev) => (prev ? prev + " " : "") + e.results[0][0].transcript);
        recognition.onerror = () => setIsListening(false);
        recognition.start();
    };

    const handleRefresh = () => {
        if (isLoading) return;
        setSessionId(undefined);
        sessionStorage.removeItem(SESSION_KEY);
        setMessages([{ role: "model", text: "Welcome to the Ops Center. 👋 I'm your **Compliance & Logistics Co-Pilot**. I can help you with CPCB rules, driver management, and report analysis. How can I assist your facility today?" }]);
        setInput("");
        if (isListening) setIsListening(false);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                style={{ zIndex: 9998 }}
                className={`fixed inset-0 bg-emerald-950/20 backdrop-blur-[2px] transition-opacity duration-500 ${isOpen && isExpanded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={() => setIsExpanded(false)}
            />

            {/* Chat Window */}
            <div
                style={{ zIndex: 9999 }}
                className={`fixed flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] bg-white/90 backdrop-blur-xl shadow-2xl origin-bottom-right border border-emerald-200
          ${!isOpen ? "translate-y-12 opacity-0 scale-90 pointer-events-none" : "translate-y-0 opacity-100 scale-100 pointer-events-auto"}
          ${isExpanded ? "bottom-[5vh] right-[5vw] w-[90vw] h-[90vh] max-h-[90vh] rounded-[3rem]" : "bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[600px] max-h-[80vh] rounded-[2rem]"}`}
            >
                {/* Header */}
                <div className={`flex items-center justify-between transition-all duration-300 ${isExpanded ? "p-6 bg-emerald-700/95" : "p-5 bg-emerald-700/90"}`}>
                    <div className="flex items-center gap-3">
                        <div className={`rounded-full bg-emerald-400/20 flex items-center justify-center border border-emerald-400/30 transition-all ${isExpanded ? "w-12 h-12" : "w-10 h-10"}`}>
                            <Sparkles className={`${isExpanded ? "w-7 h-7" : "w-6 h-6"} text-emerald-400`} />
                        </div>
                        <div>
                            <h3 className={`font-display font-bold text-white leading-tight ${isExpanded ? "text-[2.6rem]" : "text-[1.8rem]"}`}>Ops Co-Pilot</h3>
                            <p className="text-emerald-200/70 text-[1.2rem] font-medium tracking-wide">Facility Operations & Compliance</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button suppressHydrationWarning onClick={handleRefresh} disabled={isLoading} className={`text-emerald-200 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`} title="Start new chat"><RefreshCw size={18} /></button>
                        <button suppressHydrationWarning onClick={() => setIsExpanded(!isExpanded)} className="text-emerald-200 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors" title={isExpanded ? "Minimize" : "Expand"}>{isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}</button>
                        <button suppressHydrationWarning onClick={() => { setIsOpen(false); setTimeout(() => setIsExpanded(false), 300); }} className="text-emerald-200 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors"><X size={20} /></button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gradient-to-b from-emerald-50/30 to-white/80">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col gap-1.5 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                            <span className={`text-[1.1rem] font-medium px-2 ${msg.role === "user" ? "text-emerald-500" : "text-emerald-600"}`}>
                                {msg.role === "user" ? "You" : "Ops Co-Pilot"}
                            </span>
                            <div className={`px-4 py-3 rounded-2xl shadow-sm font-outfit w-fit
                ${isExpanded ? "max-w-[75%]" : msg.role === "user" ? "max-w-[85%]" : "max-w-[90%]"}
                ${msg.role === "user" ? "bg-emerald-600 text-white rounded-tr-sm self-end text-right" : "bg-white text-gray-800 border border-emerald-100 rounded-tl-sm"}
                ${msg.isError ? "bg-red-50 text-red-600 border-red-200" : ""}`}>
                                <FormattedText
                                    text={msg.text}
                                    pathLabels={INTERMEDIARY_PATH_LABELS}
                                    pillClassName={INTERMEDIARY_PILL}
                                    numberColor="text-emerald-600"
                                    bulletColor="text-emerald-500"
                                    headingColor="text-emerald-800"
                                />
                            </div>
                            {msg.role === "model" && msg.suggestions && msg.suggestions.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-1 w-full">
                                    {msg.suggestions.map((s, si) => (
                                        <button key={si} suppressHydrationWarning onClick={() => { setInput(s); inputRef.current?.focus(); }}
                                            className="text-[1.2rem] text-emerald-700 bg-white hover:bg-emerald-600 hover:text-white border border-emerald-300 rounded-full px-4 py-2 transition-all font-outfit shadow-sm hover:shadow active:scale-95 text-left">
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {!messages.some((m) => m.role === "user") && (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {SAMPLE_QUESTIONS.map((q, i) => (
                                <button key={i} suppressHydrationWarning onClick={() => { setInput(q); inputRef.current?.focus(); }}
                                    className="text-[1.2rem] text-emerald-700 bg-white hover:bg-emerald-600 hover:text-white border border-emerald-300 rounded-full px-4 py-2 transition-all font-outfit shadow-sm hover:shadow active:scale-95">
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex items-start gap-1.5">
                            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-emerald-100 shadow-sm flex gap-1.5 items-center">
                                {[0, 150, 300].map((d) => <div key={d} className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className={`bg-white/80 border-t border-emerald-100 ${isExpanded ? "p-6" : "p-4"}`}>
                    <div className="relative flex items-center gap-2">
                        <input suppressHydrationWarning ref={inputRef} type="text" value={input}
                            onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyPress}
                            placeholder={isListening ? "Listening..." : "Ask about operations..."}
                            className={`w-full bg-emerald-50 border-none rounded-full text-emerald-900 placeholder-emerald-400 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none transition-all font-outfit
                ${isExpanded ? "py-5 pl-7 pr-24 text-[1.8rem]" : "py-3.5 pl-6 pr-20 text-[1.4rem] md:text-[1.5rem]"}
                ${isListening ? "ring-2 ring-red-400/50 bg-red-50" : ""}`}
                        />
                        <div className="absolute right-2 flex items-center gap-1">
                            <button suppressHydrationWarning onClick={toggleVoiceInput}
                                className={`rounded-full transition-all hover:bg-emerald-100 ${isExpanded ? "p-3" : "p-2"} ${isListening ? "text-red-500 animate-pulse bg-red-100" : "text-emerald-400"}`}
                                title="Voice Input">
                                {isListening ? <MicOff size={isExpanded ? 22 : 18} /> : <Mic size={isExpanded ? 22 : 18} />}
                            </button>
                            <button suppressHydrationWarning onClick={handleSend} disabled={isLoading || !input.trim()}
                                className={`bg-emerald-600 rounded-full text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:scale-105 ${isExpanded ? "p-3" : "p-2"}`}>
                                <Send size={isExpanded ? 22 : 18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toggle Button */}
            <button style={{ zIndex: 10000 }} suppressHydrationWarning
                onClick={() => { if (isExpanded && isOpen) { setIsOpen(false); setTimeout(() => setIsExpanded(false), 300); } else { setIsOpen(!isOpen); } }}
                className={`fixed bottom-8 right-8 group flex items-center justify-center w-20 h-20 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${isOpen ? "bg-emerald-800 rotate-90" : "bg-gradient-to-br from-emerald-500 to-emerald-700 rotate-0"}`}>
                <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-75 group-hover:opacity-100 duration-1000" />
                {isOpen ? <X className="text-white w-10 h-10 transition-transform" /> : <MessageCircle className="text-white w-10 h-10 transition-transform" />}
            </button>
        </>
    );
};
