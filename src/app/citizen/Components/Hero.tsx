"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import hero from "../../../../public/e-waste-recycling.jpeg";
import { FaPlay } from "react-icons/fa";

const solutions = [
  "Recycling Revolution",
  "Sustainable Disposal",
  "Smart Facility Finder",
];

const solutionVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};


const HeroSection: React.FC = () => {
  const [currentSolution, setCurrentSolution] = useState(solutions[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSolution((prev) => {
        const currentIndex = solutions.indexOf(prev);
        const nextIndex = (currentIndex + 1) % solutions.length;
        return solutions[nextIndex];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []); // Remove currentSolution from dependencies

  return (
    <section className="relative min-h-[95vh] flex items-center pt-32 overflow-hidden bg-white" id="home" aria-label="hero">
      {/* Futuristic Green Background Video */}
      <div className="absolute inset-0 z-0 opacity-10">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="https://cdn.pixabay.com/video/2021/04/12/70860-538805601_large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white" />
      </div>

      {/* Emerald Scanning Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.08] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '35px 35px' }}>
      </div>

      {/* High-Velocity Scanning Line */}
      <motion.div
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[2px] bg-emerald-400 shadow-[0_0_20px_#10b981] z-0 pointer-events-none"
      />

      {/* Pulsing Emerald Orbs */}
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-[150px] animate-pulse pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="lg:w-1/2 text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-sm mb-8 uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-flicker"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
              </span>
              E-WASTE: RECYCLE
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-black mb-8 font-cuprum text-gray-900 leading-none tracking-tighter">
              GENX <span className="text-emerald-600 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">ELOCATE</span> <br />
              <motion.span
                className="text-emerald-700 text-4xl md:text-5xl font-mono uppercase italic"
                variants={solutionVariants}
                initial="initial"
                animate="animate"
                key={currentSolution}
              >
                {'>'} {currentSolution}
              </motion.span>
            </h1>

            <p className="text-xl text-gray-700 max-w-xl leading-relaxed mb-12 font-light">
              Deploying autonomous neural networks for global e-waste redistribution.
              <span className="text-emerald-600 block mt-4 font-bold tracking-widest uppercase text-sm border-l-2 border-emerald-600 pl-4 py-1">
                Zero Waste Protocol Initiated
              </span>
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-6">
              <Link
                href="/citizen/e-facilities"
                className="group relative px-10 py-5 bg-emerald-600 text-white font-black rounded-xl transition-all overflow-hidden shadow-xl hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                <span className="relative z-10 flex items-center gap-2">
                  E-FACILITIES SCAN<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </span>
              </Link>
              <Link
                href="/citizen/recycle"
                className="px-10 py-5 bg-white border-2 border-emerald-600 text-emerald-700 font-black rounded-xl hover:bg-emerald-50 transition-all shadow-md tracking-widest"
              >
                BOOK RECYCLE
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: 25 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.5, delay: 0.3 }}
            className="lg:w-1/2 relative perspective-1000"
          >
            <div className="relative z-10 w-fit mx-auto rounded-[3.5rem] bg-emerald-950/40 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_0_60px_rgba(16,185,129,0.3)] group overflow-hidden">
              {/* Emerald HUD Outlines */}
              <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-emerald-400/60 z-20 animate-pulse" />
              <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-emerald-400/60 z-20 animate-pulse" />

              <Image
                src={hero}
                alt="ELocate AI Hero"
                width={500}
                height={500}
                className="rounded-[3rem] object-cover mix-blend-screen brightness-125 grayscale-[0.2] transition-transform duration-1000 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-emerald-500/10 z-10 group-hover:bg-transparent transition-colors duration-500" />
            </div>

            {/* E-Waste Stats Card */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -right-4 z-20 bg-white backdrop-blur-xl p-8 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.3)] border-2 border-emerald-500 max-w-[300px]"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-black text-emerald-600 text-lg uppercase leading-none">E-Waste Recycled</h4>
                  <p className="text-[10px] text-gray-600 mt-1 font-mono tracking-widest">THIS MONTH: 2.4 TONS</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '78%' }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                    className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]"
                  />
                </div>
                <p className="text-[9px] text-emerald-600 font-mono text-right tracking-[2px] font-bold">GOAL: 78% COMPLETE</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
