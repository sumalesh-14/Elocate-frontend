"use client";
import React from "react";
import { motion } from "framer-motion";

interface Feature {
  number: string;
  title: string;
  description: string;
}

const elocateFeatures: Feature[] = [
  {
    number: "01",
    title: "State-of-the-Art E-Waste Collection Network",
    description:
      "Access our extensive network of verified and certified e-waste collection facilities, ensuring safe, responsible, and environmentally-conscious disposal for all electronic devices.",
  },
  {
    number: "02",
    title: "Comprehensive Educational Resources",
    description:
      "Empower yourself with our knowledge hub containing expert insights, best practices, and the latest research on e-waste management and environmental sustainability.",
  },
  {
    number: "03",
    title: "Intuitive User Experience",
    description:
      "Navigate our sophisticated yet user-friendly platform designed for individuals, businesses, and organizations seeking efficient and effective e-waste solutions.",
  },
  {
    number: "04",
    title: "AI-Powered Smart Assistant",
    description:
      "Get instant answers to your questions with our intelligent virtual assistant, providing 24/7 access to educational resources and personalized guidance on responsible e-waste management.",
  },
  {
    number: "05",
    title: "Reward-Based Booking System",
    description:
      "Benefit from our innovative credit mechanism that incentivizes responsible disposal practices, making sustainability rewarding for both individuals and businesses.",
  },
  {
    number: "06",
    title: "Advanced Facility Management Dashboard",
    description:
      "For facility owners: gain access to our comprehensive management suite with real-time analytics, booking oversight, and integrated credit tracking—all in one streamlined interface.",
  },
];

const Features: React.FC = () => {
  return (
    <section className="py-32 bg-white relative overflow-hidden" id="features" aria-label="features">
      {/* Background Tech Net */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black text-gray-900 font-cuprum mb-6 uppercase tracking-tighter"
          >
            Next-Gen <span className="text-emerald-600">Capabilities</span>
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 120 }}
            viewport={{ once: true }}
            className="h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto rounded-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {elocateFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative bg-white/80 backdrop-blur-xl p-12 rounded-[2.5rem] border border-gray-200 hover:border-emerald-500/50 transition-all duration-500 shadow-lg hover:shadow-2xl"
            >
              {/* Card Scan Overlay */}
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/40 -translate-y-full group-hover:translate-y-[400px] transition-transform duration-[3s] ease-linear opacity-0 group-hover:opacity-100" />

              <div className="relative mb-10">
                <span className="text-7xl font-black text-emerald-100 absolute -top-8 -left-4 z-0 font-mono tracking-tighter">
                  {feature.number}
                </span>
                <div className="w-20 h-20 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 relative z-10 shadow-md group-hover:shadow-xl transition-all">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>

              <h3 className="text-3xl font-bold mb-6 font-cuprum text-gray-900 leading-tight group-hover:text-emerald-700 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed font-light">
                {feature.description}
              </p>

              {/* Data Lines */}
              <div className="mt-8 flex gap-1 opacity-30 group-hover:opacity-100 transition-opacity">
                {[1, 2, 3, 4].map(i => <div key={i} className={`h-1 flex-1 bg-emerald-500 ${i === 4 ? 'w-1/2' : ''}`} />)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
