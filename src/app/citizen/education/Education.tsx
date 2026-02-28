
"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { blogs, getBlogsByCategory } from "../data/blogs";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import { FiBookOpen, FiClock, FiTag, FiDownload, FiPlayCircle, FiGlobe, FiTarget, FiBarChart, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { MdEco } from "react-icons/md";

const Education: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filteredBlogs, setFilteredBlogs] = useState(blogs);
  const [isLoading, setIsLoading] = useState(false);

  // Extract unique categories from blogs
  const categories = ["all", ...Array.from(new Set(blogs.map(blog => blog.category)))];

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      if (selectedCategory === "all") {
        setFilteredBlogs(blogs);
      } else {
        setFilteredBlogs(getBlogsByCategory(selectedCategory));
      }
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [selectedCategory]);

  // Scroll logic for categories
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.6;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Head>
        <title>Education Hub | ELocate</title>
        <meta name="description" content="Gain valuable insights into sustainable electronics management and discover our digital environmental footprint." />
      </Head>

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
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-6 font-cuprum tracking-tight text-gray-900 leading-none"
          >
            Digital <span className="text-emerald-600 drop-shadow-sm">Education</span> Hub
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            Empowering the next generation with knowledge to navigate the future of sustainable electronics and circular economy.
          </motion.p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container mx-auto max-w-7xl px-4 py-16">

        {/* Featured Insight Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden mb-24 hover:shadow-emerald-500/10 transition-all duration-500"
        >
          <div className="lg:flex">
            <div className="lg:w-1/2 relative h-[300px] lg:h-auto overflow-hidden group">
              <Image
                src="https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="E-waste Crisis"
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/40 to-transparent" />
              <div className="absolute top-8 left-8">
                <span className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg uppercase tracking-wider">Featured Insight</span>
              </div>
            </div>
            <div className="lg:w-1/2 p-10 lg:p-16 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-6 text-emerald-600 font-bold text-sm uppercase tracking-widest">
                <FiClock className="text-lg" />
                <span>8 Min Deep Dive</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-cuprum mb-6 leading-tight">
                The Growing E-Waste Crisis: Understanding Our Digital Footprint
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-10">
                Beyond the convenience of our devices lies an environmental challenge of global proportions. Discover how circular economy principles are reshaping the tech industry's future.
              </p>
              <Link
                href="/citizen/education/1"
                className="inline-flex items-center gap-3 w-fit px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-emerald-100 hover:-translate-y-1"
              >
                Explore Full Article
                <FiBookOpen className="text-lg" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Knowledge Hub Layout */}
        <div className="flex flex-col lg:flex-row gap-16">

          {/* Sidebar Navigation */}
          <aside className="lg:w-1/4">
            <div className="sticky top-24 space-y-10">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 font-cuprum mb-4 tracking-tight">
                  Knowledge Repository
                </h2>
                <div className="w-16 h-1 bg-emerald-500 rounded-full" />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 mb-6 px-2">Filter by Domain</p>
                <div className="flex flex-wrap lg:flex-col gap-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`group flex items-center gap-4 px-6 py-4 rounded-2xl text-[15px] font-bold transition-all duration-300 border-2 ${selectedCategory === category
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-100'
                        : 'bg-white text-gray-600 border-gray-50 hover:border-emerald-200 hover:bg-emerald-50/30'
                        }`}
                    >
                      <div className={`w-2 h-2 rounded-full transition-all duration-300 ${selectedCategory === category ? 'bg-white scale-125' : 'bg-emerald-200 group-hover:bg-emerald-400'
                        }`} />
                      {category === "all" ? "All Domains" : category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Newsletter/Tip Card in Sidebar */}
              <div className="hidden lg:block bg-emerald-900 p-8 rounded-[2rem] text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
                <h4 className="text-xl font-bold font-cuprum mb-4 relative z-10">Stay Informed</h4>
                <p className="text-emerald-100/70 text-sm mb-6 relative z-10 leading-relaxed">
                  Subscribe for the latest research on circular economies.
                </p>
                <input
                  type="email"
                  placeholder="Your email..."
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-emerald-400 mb-4"
                />
                <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-colors text-sm">
                  Join Hub
                </button>
              </div>
            </div>
          </aside>

          {/* Dynamic Blog Grid */}
          <main className="lg:w-3/4">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-10"
              >
                {filteredBlogs.map((blog, index) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-200/50 border border-transparent hover:border-emerald-100 transition-all duration-500 flex flex-col h-full group"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={blog.image}
                        alt={blog.title}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-6 right-6">
                        <span className="bg-white/95 backdrop-blur-sm text-emerald-700 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-wider shadow-sm">
                          {blog.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-10 flex flex-col flex-grow">
                      <div className="flex items-center gap-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-6">
                        <FiClock className="text-sm" />
                        <span>{blog.readTime}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 font-cuprum line-clamp-2 group-hover:text-emerald-600 transition-colors leading-tight">
                        {blog.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed mb-8 line-clamp-3">
                        {blog.description}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-8 border-t border-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shadow-sm">
                            {blog.author?.charAt(0) || 'E'}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Words by</p>
                            <span className="text-xs font-bold text-gray-700">{blog.author || 'ELocate Team'}</span>
                          </div>
                        </div>
                        <Link
                          href={`/citizen/education/${blog.id}`}
                          className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 -mr-2"
                        >
                          <FiChevronRight className="text-xl" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {filteredBlogs.length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                <FiTag className="text-5xl text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 font-cuprum mb-2">No Resources Found</h3>
                <p className="text-gray-500">We're currently expanding this domain. Stay tuned for new insights.</p>
              </div>
            )}
          </main>
        </div>

        {/* E-Waste Impact Statistics */}
        <section className="mt-32">
          <div className="bg-emerald-900 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {[
                { icon: <FiGlobe />, label: "Global E-Waste", val: "57.4M", sub: "Annual Tons Generated" },
                { icon: <FiBarChart />, label: "Material Value", val: "$62.5B", sub: "Untapped Resources" },
                { icon: <FiTarget />, label: "Recycling Gap", val: "17.4%", sub: "Current Global Rate" },
                { icon: <MdEco />, label: "CO2 Reduction", val: "80kg", sub: "Per Recycled Smartphone" }
              ].map((stat, i) => (
                <div key={i} className="text-center text-white space-y-4">
                  <div className="text-3xl text-emerald-400 flex justify-center mb-6">{stat.icon}</div>
                  <h4 className="text-4xl font-bold font-cuprum">{stat.val}</h4>
                  <div>
                    <p className="text-sm font-bold text-emerald-300 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-xs text-white/50 mt-1">{stat.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Video Learning & Infographics */}
        <div className="mt-32 grid lg:grid-cols-2 gap-16">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 font-cuprum mb-12 flex items-center gap-4">
              <FiPlayCircle className="text-emerald-600" />
              Visual Learning Series
            </h3>
            <div className="space-y-8">
              {[
                { id: "Jzw1zv1zz0E", title: "The E-Waste Crisis Explained", desc: "Understanding the gravity of our digital waste problem." },
                { id: "4g9Zu3pOIYU", title: "Circular Economy in Tech", desc: "How companies are redesigning the lifecycle of electronics." }
              ].map((vid, i) => (
                <div key={i} className="bg-white rounded-[2rem] shadow-xl overflow-hidden group">
                  <div className="relative aspect-video">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${vid.id}`}
                      title={vid.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-8">
                    <h4 className="text-xl font-bold text-gray-900 font-cuprum mb-2">{vid.title}</h4>
                    <p className="text-gray-500 text-sm">{vid.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-bold text-gray-900 font-cuprum mb-12 flex items-center gap-4">
              <FiDownload className="text-emerald-600" />
              Resource Library
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: "Lifecycle Analysis", img: "https://images.unsplash.com/photo-1605600659873-d808a13e4d9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
                { title: "Material Recovery", img: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
                { title: "Reduction Tips", img: "https://images.unsplash.com/photo-1546156929-a4c0ac411f47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
                { title: "E-Waste Policy", img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" }
              ].map((res, i) => (
                <div key={i} className="relative group rounded-3xl overflow-hidden h-64 border border-gray-100 shadow-sm">
                  <Image src={res.img} alt={res.title} layout="fill" objectFit="cover" className="transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-emerald-900/40 to-transparent p-6 flex flex-col justify-end">
                    <h4 className="text-white font-bold font-cuprum mb-4">{res.title}</h4>
                    <button className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
                      <FiDownload />
                      Download PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 text-center py-24 bg-white rounded-[3rem] border border-emerald-50 shadow-2xl shadow-emerald-500/5 px-4"
        >
          <h2 className="text-4xl font-bold text-gray-900 font-cuprum mb-6">Ready to apply your knowledge?</h2>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Transform understanding into action. Locate your nearest certified disposal facility and start your sustainability journey today.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              href="/citizen/e-facilities"
              className="px-10 py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-emerald-100 hover:-translate-y-1"
            >
              Locate Facilities
            </Link>
            <Link
              href="/citizen/book-recycle"
              className="px-10 py-5 bg-white border-2 border-emerald-100 text-emerald-700 font-bold rounded-2xl transition-all hover:bg-emerald-50 hover:-translate-y-1"
            >
              Book a Pickup
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Education;
