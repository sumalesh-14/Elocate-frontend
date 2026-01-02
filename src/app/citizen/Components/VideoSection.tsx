"use client";
import React from "react";
import { motion } from "framer-motion";

const VideoSection: React.FC = () => {
    return (
        <section className="py-32 bg-gray-50 overflow-hidden relative">
            {/* High-Frequency Data Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_#10b981_0%,_transparent_60%)] blur-[120px]" />
                <div
                    className="absolute inset-0 opacity-[0.05] animate-pulse"
                    style={{
                        backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px)',
                        backgroundSize: '100% 4px'
                    }}
                />
            </div>

            <div className="container mx-auto px-4 relative z-20">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5 }}
                        className="relative aspect-video rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.3)] border border-emerald-500/30 group bg-black"
                    >
                        {/* Tech AI Background Video */}
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover grayscale brightness-50 contrast-125 transition-all duration-1000 group-hover:brightness-100 group-hover:grayscale-0"
                        >
                            <source src="https://cdn.pixabay.com/video/2023/10/19/185672-876250769_large.mp4" type="video/mp4" />
                        </video>

                        {/* HIGH-ENERGY SCANNERS */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                            {/* Orbital Scanners */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <motion.div
                                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                    className="w-[400px] h-[400px] border border-emerald-500/20 rounded-full border-dashed"
                                />
                                <motion.div
                                    animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                                    className="absolute w-[500px] h-[500px] border border-emerald-500/10 rounded-full"
                                />
                            </div>

                            <div className="absolute inset-0 opacity-[0.15] pointer-events-none animate-flicker"
                                style={{ backgroundImage: 'radial-gradient(#10b981 2px, transparent 2px)', backgroundSize: '40px 40px' }} />

                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8 }}
                                className="text-center relative z-10"
                            >
                                <div className="mb-10 flex justify-center relative">
                                    {/* Core Reactor Animation */}
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        className="w-32 h-32 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_30px_#10b981]"
                                    >
                                        <div className="w-20 h-20 border-4 border-emerald-500/10 border-b-emerald-400 rounded-full animate-reverse-spin" />
                                        <motion.div
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                            className="absolute w-8 h-8 bg-emerald-500 rounded-full blur-[8px]"
                                        />
                                    </motion.div>
                                </div>

                                <h2 className="text-6xl md:text-[8rem] font-black text-gray-900 font-cuprum mb-6 uppercase tracking-tighter leading-none animate-flicker">
                                    AI <span className="text-emerald-600 drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]">ENABLED</span> <br />
                                    DISPOSAL
                                </h2>

                                <div className="h-1 w-full bg-emerald-500/30 rounded-full mb-10 overflow-hidden relative">
                                    <motion.div
                                        animate={{ left: ['-100%', '100%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="absolute h-full w-[40%] bg-gradient-to-r from-transparent via-emerald-600 to-transparent"
                                    />
                                </div>

                                <p className="text-emerald-700 text-2xl md:text-3xl max-w-4xl mx-auto font-black tracking-widest uppercase leading-snug">
                                    Processing_Neural_Linked_E-Waste_Logistics...
                                </p>

                                <div className="mt-16 flex items-center justify-center gap-12 font-mono text-emerald-500/70 text-sm tracking-[0.5em] uppercase">
                                    <span className="flex items-center gap-3"><div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981] animate-ping" /> SECURE_DATA_READY</span>
                                    <span className="hidden md:flex items-center gap-3"><div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981] animate-ping" /> DIST_NODE_09_ACTIVE</span>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default VideoSection;
