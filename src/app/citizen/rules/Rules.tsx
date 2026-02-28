"use client";
/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import { news, notifications, report } from "../data/Notifications";
import Head from "next/head";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const Rules = () => {
  const [openChapters, setOpenChapters] = useState<{ [key: number]: boolean }>({});

  const toggleChapter = (id: number) => {
    setOpenChapters(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <Head>
        <title>Rules & Regulations | ELocate</title>
        <meta
          name="description"
          content="Stay informed about the latest e-waste management regulations in India. Access official notifications, industry news, and compliance requirements."
        />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative pt-48 pb-20 px-4 bg-white overflow-hidden">
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
            <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/40 to-white" />
          </div>

          {/* Emerald Scanning Grid */}
          <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
          </div>

          {/* High-Velocity Scanning Line */}
          <motion.div
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[1px] bg-emerald-400/50 shadow-[0_0_15px_#10b981] z-0 pointer-events-none"
          />

          {/* Pulsing Emerald Orbs */}
          <div className="absolute top-1/4 left-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none" />
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-emerald-600/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />

          <div className="container mx-auto max-w-6xl relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-black mb-6 font-cuprum tracking-tight text-gray-900 leading-none">
              Regulatory <span className="text-emerald-600 drop-shadow-sm">Framework</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Navigating India's E-Waste (Management) Rules, 2026. <br className="hidden md:block" /> Stay compliant, stay informed, and help us build a greener future.
            </p>
          </div>
        </section>

        {/* Official Notification Context */}
        <section className="py-12 px-4 -mt-10">
          <div className="container mx-auto max-w-5xl">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 mb-16">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-8 border-b border-gray-100 gap-6">
                <div>
                  <span className="inline-block px-4 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm mb-4">
                    OFFICIAL NOTIFICATION
                  </span>
                  <h2 className="text-3xl font-bold text-gray-900 font-cuprum">
                    Ministry of Environment, Forest and Climate Change
                  </h2>
                  <p className="text-gray-500 mt-1">EP Division | Dated: 16th March, 2026</p>
                </div>
                <div className="bg-emerald-50 px-6 py-4 rounded-xl border border-emerald-100">
                  <p className="text-emerald-800 font-bold text-xl uppercase tracking-wider">S.O. 1047(E)</p>
                  <p className="text-emerald-600 text-sm font-medium">Notification Ref</p>
                </div>
              </div>

              <div className="text-gray-700 leading-relaxed">
                <p className="text-lg mb-10">
                  In exercise of the powers conferred by section 6, 8 and 25 of the Environment (Protection) Act, 1986 (29 of 1986), the Central Government hereby establishes comprehensive guidelines for the responsible management, handling, and disposal of electronic waste across India:
                </p>

                <div className="space-y-12">
                  {/* CHAPTER I */}
                  <div>
                    <button
                      onClick={() => toggleChapter(1)}
                      className="w-full flex items-center justify-between text-left group focus:outline-none"
                    >
                      <h3 className="text-2xl font-bold text-emerald-700 flex items-center gap-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white text-sm shadow-md">1</span>
                        CHAPTER I: PRELIMINARY PROVISIONS
                      </h3>
                      <motion.div
                        animate={{ rotate: openChapters[1] ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-emerald-600 group-hover:text-emerald-800"
                      >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {openChapters[1] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                          className="overflow-hidden"
                        >
                          <div className="grid gap-6 pl-12 pt-8">
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 transition-all hover:shadow-lg hover:bg-white">
                              <p className="font-bold text-gray-900 mb-3 text-lg">1. Short title and commencement.</p>
                              <div className="space-y-2 text-gray-600">
                                <p className="flex gap-2">
                                  <span className="text-emerald-600 font-bold">(1)</span>
                                  These rules may be called the E-Waste (Management) Rules, 2026.
                                </p>
                                <p className="flex gap-2">
                                  <span className="text-emerald-600 font-bold">(2)</span>
                                  They shall come into force on the date of their publication in the Official Gazette.
                                </p>
                              </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 transition-all hover:shadow-lg hover:bg-white">
                              <p className="font-bold text-gray-900 mb-4 text-lg">2. Definitions.</p>
                              <p className="text-gray-600 mb-4 italic">In these rules, unless the context otherwise requires:</p>
                              <ul className="grid md:grid-cols-2 gap-4 list-none p-0 m-0">
                                <li className="flex gap-4 text-sm bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 font-bold text-xs">a</span>
                                  <span className="text-gray-700"><strong>"Act"</strong> means the Environment (Protection) Act, 1986.</span>
                                </li>
                                <li className="flex gap-4 text-sm bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 font-bold text-xs">b</span>
                                  <span className="text-gray-700"><strong>"Appliance"</strong> means household electrical or electronic equipment.</span>
                                </li>
                                <li className="flex gap-4 text-sm bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 font-bold text-xs">c</span>
                                  <span className="text-gray-700"><strong>"Authorized dismantler"</strong> means entity authorized by SPCB.</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* CHAPTER II */}
                  <div>
                    <button
                      onClick={() => toggleChapter(2)}
                      className="w-full flex items-center justify-between text-left group focus:outline-none"
                    >
                      <h3 className="text-2xl font-bold text-emerald-700 flex items-center gap-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white text-sm shadow-md">2</span>
                        CHAPTER II: PRODUCER RESPONSIBILITIES
                      </h3>
                      <motion.div
                        animate={{ rotate: openChapters[2] ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-emerald-600 group-hover:text-emerald-800"
                      >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {openChapters[2] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                          className="overflow-hidden"
                        >
                          <div className="grid gap-6 pl-12 pt-8">
                            <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100/50 transition-all hover:shadow-lg hover:bg-emerald-50">
                              <p className="font-bold text-gray-900 mb-3 text-lg">3. Extended Producer Responsibility (EPR)</p>
                              <p className="text-gray-700 leading-relaxed">Every producer shall be responsible for establishing a system to collect, refurbish, recycle or dispose of e-waste generated from their products in an environmentally sound manner.</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 transition-all hover:shadow-lg hover:bg-white text-center md:text-left">
                                <p className="font-bold text-emerald-600 mb-2 uppercase text-xs tracking-widest font-cuprum">Rule 4</p>
                                <p className="font-bold text-gray-900 mb-3 text-lg">Consumer Collection</p>
                                <p className="text-gray-600 text-sm">Producers must establish dedicated collection centers and provide clear return procedures for end-of-life products.</p>
                              </div>
                              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 transition-all hover:shadow-lg hover:bg-white text-center md:text-left">
                                <p className="font-bold text-emerald-600 mb-2 uppercase text-xs tracking-widest font-cuprum">Rule 5</p>
                                <p className="font-bold text-gray-900 mb-3 text-lg">Recycling Targets</p>
                                <p className="text-gray-600 text-sm">Achieve specific recycling targets detailed in Schedule II or face financial penalties from the CPCB.</p>
                              </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 transition-all hover:shadow-lg hover:bg-white">
                              <p className="font-bold text-emerald-600 mb-2 uppercase text-xs tracking-widest font-cuprum text-center md:text-left">Rule 6 & 10</p>
                              <p className="font-bold text-gray-900 mb-3 text-lg text-center md:text-left">Labeling & Compliance</p>
                              <p className="text-gray-600 text-sm text-center md:text-left">All products must clearly label hazardous substances. Unauthorized handling, dismantling, or recycling of e-waste is strictly prohibited and punishable by law.</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Resources Grid */}
            <div className="mb-20">
              <h2 className="text-4xl font-bold text-center mb-12 font-cuprum text-gray-900">Information Resources</h2>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Official Notifications Column */}
                <div className="flex flex-col gap-6">
                  <h3 className="text-xl font-bold text-emerald-700 flex items-center gap-2 mb-2 px-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Official Notifications
                  </h3>
                  {notifications.map((notif) => (
                    <a
                      key={notif.id}
                      href={notif.Link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block bg-gray-50 hover:bg-emerald-600 border border-gray-200 hover:border-emerald-500 p-6 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
                    >
                      <h4 className="font-bold text-gray-900 group-hover:text-white mb-2 line-clamp-2 transition-colors">{notif.title}</h4>
                      <p className="text-sm text-gray-600 group-hover:text-emerald-100 mb-4 transition-colors">{(notif as any).description}</p>
                      <span className="inline-flex items-center text-emerald-600 group-hover:text-white text-sm font-semibold transition-colors">
                        View Document <span className="ml-1 transform group-hover:translate-x-1 transition-transform">→</span>
                      </span>
                    </a>
                  ))}
                </div>

                {/* News Column */}
                <div className="flex flex-col gap-6">
                  <h3 className="text-xl font-bold text-emerald-700 flex items-center gap-2 mb-2 px-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 2v4a2 2 0 002 2h4" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h10M7 16h10" />
                    </svg>
                    Industry News
                  </h3>
                  {news.map((item) => (
                    <a
                      key={item.id}
                      href={item.Link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block bg-gray-50 hover:bg-white border border-gray-200 hover:border-emerald-300 p-6 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-xl"
                    >
                      <p className="text-xs font-bold text-emerald-600 mb-2 uppercase tracking-widest">{item.date}</p>
                      <h4 className="font-bold text-gray-900 group-hover:text-emerald-700 mb-3 transition-colors">{item.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4">{item.content}</p>
                      <span className="inline-flex items-center text-blue-600 group-hover:text-emerald-600 text-sm font-semibold transition-colors">
                        Read More <span className="ml-1 transform group-hover:translate-x-1 transition-transform">→</span>
                      </span>
                    </a>
                  ))}
                </div>

                {/* Reports Column */}
                <div className="flex flex-col gap-6">
                  <h3 className="text-xl font-bold text-emerald-700 flex items-center gap-2 mb-2 px-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Annual Reports
                  </h3>
                  {report.map((rep) => (
                    <a
                      key={rep.id}
                      href={rep.Link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between bg-emerald-50 hover:bg-emerald-600 p-6 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-lg border border-emerald-100 hover:border-emerald-500"
                    >
                      <h4 className="font-bold text-emerald-900 group-hover:text-white transition-colors">{rep.title}</h4>
                      <div className="bg-emerald-600 group-hover:bg-white p-2 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-white group-hover:text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="bg-gray-50 py-16 px-4 border-t border-gray-200">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 font-cuprum">Have Questions About Compliance?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Our team of environmental experts is here to help you navigate the complexities of e-waste regulations.
            </p>
            <Link
              href="/citizen/contactus"
              className="inline-flex items-center px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-emerald-200 hover:-translate-y-1"
            >
              Contact Specialist <span className="ml-2">→</span>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default Rules;
