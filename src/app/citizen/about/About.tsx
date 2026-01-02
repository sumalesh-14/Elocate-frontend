"use client";
/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import aboutHero from "../../../assets/about_hero.png";

const About = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-50 animated-pulse" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-teal-100 rounded-full blur-3xl opacity-50" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 text-center lg:text-left"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm mb-6 uppercase tracking-widest shadow-sm">
                Our Journey
              </span>
              <h1 className="text-5xl md:text-7xl font-bold mb-8 font-cuprum text-gray-900 leading-tight">
                Pioneering <span className="text-emerald-600">Sustainability</span> through Technology
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl leading-relaxed mb-10">
                At ELocate, we believe that the solution to our planet's growing e-waste crisis lies at the intersection of environmental consciousness and digital innovation.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <Link
                  href="/citizen/contactus"
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-xl hover:shadow-emerald-200 hover:-translate-y-1"
                >
                  Join the Movement
                </Link>
                <Link
                  href="/citizen/e-facilities"
                  className="px-8 py-4 bg-white border-2 border-emerald-100 text-emerald-700 font-bold rounded-2xl hover:bg-emerald-50 transition-all flex items-center gap-2 group"
                >
                  Find Facilities
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:w-1/2 relative"
            >
              <div className="relative z-10 bg-white/30 backdrop-blur-sm p-4 rounded-[2rem] border border-white shadow-2xl overflow-hidden group">
                <Image
                  src={aboutHero}
                  alt="ELocate Innovation"
                  width={600}
                  height={600}
                  className="rounded-3xl object-cover transform transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              {/* Decorative Card */}
              <div className="absolute -bottom-10 -right-6 z-20 bg-white p-6 rounded-2xl shadow-xl border border-emerald-50 hidden md:block max-w-[240px] animate-bounce-slow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="font-bold text-gray-800">Mission Driven</span>
                </div>
                <p className="text-xs text-gray-500">Connecting millions to certified e-waste recyclers daily.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 bg-emerald-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-5 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,100 Q25,0 50,100 T100,100" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 font-cuprum">Understanding the Impact</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { val: "1.7M+", label: "Metric Tons Generated", sub: "Annual E-waste in India" },
              { val: "500+", label: "Certified Facilities", sub: "Nationwide Network" },
              { val: "24/7", label: "Smart Locating", sub: "Always Here to Help" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="text-5xl md:text-6xl font-extrabold text-emerald-400 mb-4 font-cuprum">{stat.val}</div>
                <div className="text-xl font-bold mb-2">{stat.label}</div>
                <div className="text-emerald-200/60 text-sm">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Cards */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-cuprum mb-6">Our Core Philosophy</h2>
            <div className="w-24 h-1 bg-emerald-500 mx-auto rounded-full" />
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Mission Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 group hover:border-emerald-200 transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-8 transform transition-transform group-hover:rotate-12">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold mb-6 font-cuprum text-gray-900">Our Mission</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                To bridge the critical gap in e-waste management by providing a transparent, accessible, and user-centric platform that empowers every citizen and organization to dispose of electronics responsibly.
              </p>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-emerald-600 p-10 rounded-[2.5rem] shadow-xl shadow-emerald-200 text-white group hover:translate-y-[-8px] transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-8 transform transition-transform group-hover:-rotate-12">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold mb-6 font-cuprum">Our Vision</h3>
              <p className="text-lg text-emerald-50 leading-relaxed">
                Creating a future where zero electronic waste ends up in landfills. We envision a circular economy in India where every component is valued, every toxic material is handled safely, and every device has a second life.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-emerald max-w-none text-gray-700 text-center">
            <h2 className="text-4xl font-bold text-gray-900 font-cuprum mb-10">The ELocate Story</h2>
            <p className="text-2xl font-medium text-emerald-800 leading-relaxed mb-12 italic">
              "ELocate was born from an urgent environmental need. We saw a growing crisis and felt a responsibility to act."
            </p>
            <div className="space-y-8 text-lg leading-relaxed text-gray-600 text-left bg-gray-50 p-8 md:p-12 rounded-[2rem] border border-gray-100">
              <p>
                India's rapid digital transformation has brought immense growth but also a hidden cost—a surge in electronic waste. Despite government efforts, the gap between generation and formal collection remained vast.
              </p>
              <p>
                Our platform was engineered to simplify the complex. By aggregating certified facility data, implementing real-time tracking, and providing educational resources, we've transformed e-waste disposal from a hurdle into a seamless digital experience.
              </p>
              <p>
                Today, ELocate stands as a testament to what's possible when technology is harnessed for the planet. We're more than just a tool; we're a community of environmental stewards building a legacy of responsibility for future generations.
              </p>
            </div>

            <div className="mt-16 bg-white p-8 rounded-2xl border-2 border-emerald-50 shadow-lg inline-flex flex-col items-center">
              <span className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-2">Developed By</span>
              <h4 className="text-2xl font-bold text-gray-900 font-cuprum">Team BIT</h4>
              <p className="text-gray-500 mt-2">Bannari Amman Institute of Technology</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-emerald-600 py-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-4xl font-bold text-white mb-8 font-cuprum">Ready to Make an Impact?</h2>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              href="/citizen/contactus"
              className="px-10 py-4 bg-white text-emerald-700 font-bold rounded-2xl hover:bg-emerald-50 transition-all shadow-xl"
            >
              Collaborate With Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
