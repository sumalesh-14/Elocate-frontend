/* eslint-disable react/no-unescaped-entities */
"use client";
import React from "react";
import { FiSmartphone, FiHeadphones, FiTv } from "react-icons/fi";
import { GiWashingMachine } from "react-icons/gi";
import { RiFridgeFill } from "react-icons/ri";
import { FaLaptop } from "react-icons/fa";
import { MdOutlineDevicesOther, MdEco, MdVerified, MdSecurity, MdBolt } from "react-icons/md";
import Link from "next/link";
import Head from "next/head";
import { motion } from "framer-motion";

interface RecycleCardProps {
  itemName: string;
  description: string;
  recyclingProcess: string;
  specialInstructions: string;
  icon: React.ReactNode;
  benefits: string;
  index: number;
}

const Recycle: React.FC = () => {
  const recycleItems = [
    {
      itemName: "Smartphone",
      description: "Recover valuable materials from your old mobile devices while protecting the environment from hazardous parts.",
      recyclingProcess: "Encrypted data wiping, manual dismantling, and precision metal extraction (Gold, Copper, Palladium).",
      specialInstructions: "Remove SIM cards and factory reset. We handle cracked screens safely.",
      benefits: "Recycling 1 million smartphones recovers 35,000 lbs of copper and 75 lbs of gold.",
      icon: <FiSmartphone className="text-3xl" />,
    },
    {
      itemName: "Laptop",
      description: "Sustainable lifecycle management for personal computers, ensuring secure data destruction and material recovery.",
      recyclingProcess: "Certified drive shredding, circuit board processing, and rare earth element extraction.",
      specialInstructions: "Back up your data. We accept chargers and external batteries together with the unit.",
      benefits: "Laptops contain high concentrations of precious metals. 95% of components are recyclable.",
      icon: <FaLaptop className="text-3xl" />,
    },
    {
      itemName: "Accessories",
      description: "Consolidated recycling for the 'drawer of cables', chargers, and peripherals that accumulate over time.",
      recyclingProcess: "Mechanical sorting by polymer type and cryogenic cable stripping for high-purity copper recovery.",
      specialInstructions: "Untangle if possible. We accept all types of USB, power, and audio cables.",
      benefits: "Prevents toxic PVC and lead from entering landfills through specialized insulation processing.",
      icon: <FiHeadphones className="text-3xl" />,
    },
    {
      itemName: "Television",
      description: "Safe handling of display technologies, from vintage CRT monitors to modern OLED and Plasma screens.",
      recyclingProcess: "Precision screen separation and vacuum-sealed phosphor powder recovery to prevent toxic leaks.",
      specialInstructions: "Keep glass intact. Include remote controls and mounting brackets if available.",
      benefits: "Proper TV recycling prevents mercury and lead contamination in local water tables.",
      icon: <FiTv className="text-3xl" />,
    },
    {
      itemName: "Refrigerator",
      description: "Industrial-grade recycling for large cooling appliances with specialized refrigerant capture systems.",
      recyclingProcess: "Degassing of CFC/HFC refrigerants followed by heavy metal shredding and foam insulation recovery.",
      specialInstructions: "Must be empty and defrosted. We handle the heavy lifting during pickup.",
      benefits: "Capturing old refrigerants prevents massive CO2 equivalent emissions into the atmosphere.",
      icon: <RiFridgeFill className="text-3xl" />,
    },
    {
      itemName: "Other E-Waste",
      description: "A catch-all solution for any electronic device that plugs in or uses batteries, ensuring no device is left behind.",
      recyclingProcess: "Customized dismantling paths based on device complexity and material composition.",
      specialInstructions: "If it has a battery or a cord, we can recycle it. Contact us for very large industrial units.",
      benefits: "Ensures 100% compliance with environmental regulations regardless of the device type.",
      icon: <MdOutlineDevicesOther className="text-3xl" />,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Head>
        <title>Recycling Solutions | ELocate</title>
        <meta name="description" content="Explore our specialized e-waste recycling paths for smartphones, laptops, and more." />
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
            className="text-4xl md:text-6xl font-black mb-4 font-cuprum tracking-tight text-gray-900 leading-none"
          >
            Electronic <span className="text-emerald-600 drop-shadow-sm">Recycling</span> Paths
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            Specialized solutions for different e-waste categories. <br className="hidden md:block" /> Choose your path to sustainability with GenX E-Locate.
          </motion.p>
        </div>
      </section>

      {/* Grid Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {recycleItems.map((item, index) => (
              <RecycleCard key={index} {...item} index={index} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 font-cuprum mb-4">Why Recycle With Us?</h3>
            <div className="w-20 h-1 bg-emerald-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: <MdVerified />, title: "Certified Process", desc: "Compliance with all pollution board standards." },
              { icon: <MdSecurity />, title: "Data Security", desc: "Military-grade data destruction for every device." },
              { icon: <MdEco />, title: "Zero Landfill", desc: "Our ultimate goal is 100% material recovery." },
              { icon: <MdBolt />, title: "Instant Booking", desc: "Schedule a pickup in less than 2 minutes." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-gray-50 border border-gray-100 text-center group hover:bg-emerald-600 transition-all duration-500"
              >
                <div className="text-4xl text-emerald-600 mb-6 flex justify-center group-hover:text-white transition-colors duration-500">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold mb-3 group-hover:text-white transition-colors duration-500 font-cuprum">{feature.title}</h4>
                <p className="text-gray-600 group-hover:text-emerald-50 transition-colors duration-500">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-emerald-900 rounded-[3rem] p-12 md:p-20 relative overflow-hidden text-center text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 font-cuprum">Ready to clear the clutter?</h2>
              <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
                Join the circular economy today. Every device turned in is a step toward a cleaner planet.
              </p>
              <Link
                href="/citizen/book-recycle"
                className="inline-block px-12 py-5 bg-white text-emerald-900 font-bold rounded-2xl hover:bg-emerald-50 transition-all shadow-xl hover:-translate-y-1"
              >
                Book a Pickup Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const RecycleCard: React.FC<RecycleCardProps & { index: number }> = ({
  itemName,
  description,
  recyclingProcess,
  specialInstructions,
  benefits,
  icon,
  index
}) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
      }}
      className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden flex flex-col group hover:border-emerald-200 transition-all duration-500"
    >
      <div className="p-8 pb-0">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-8 transform transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6">
          {icon}
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4 font-cuprum">{itemName}</h3>
        <p className="text-gray-600 leading-relaxed mb-8">{description}</p>
      </div>

      <div className="px-8 pb-8 space-y-6 flex-grow">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-1 h-12 bg-emerald-100 rounded-full flex-shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-1">Process</p>
              <p className="text-sm text-gray-500 leading-relaxed">{recyclingProcess}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-1 h-12 bg-teal-100 rounded-full flex-shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-teal-600 uppercase tracking-[0.2em] mb-1">Impact</p>
              <p className="text-sm text-gray-500 leading-relaxed">{benefits}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 border-t border-gray-50 bg-gray-50/50">
        <Link
          href={`/citizen/book-recycle`}
          className="w-full py-4 bg-white border border-emerald-100 text-emerald-700 font-bold rounded-2xl text-center transition-all hover:bg-emerald-600 hover:text-white hover:border-emerald-600 block shadow-sm"
        >
          Recycle Now
        </Link>
      </div>
    </motion.div>
  );
};

export default Recycle;
