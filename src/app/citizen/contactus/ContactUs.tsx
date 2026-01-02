/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState } from "react";
import ClientIonIcon from "../../utils/ClientIonIcon";
import {
  location,
  call,
  mail,
  logoLinkedin,
  logoTwitter,
  logoInstagram,
  logoWhatsapp,
} from "ionicons/icons";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import Head from "next/head";
import { motion } from "framer-motion";
import { MdPhoneInTalk, MdEmail, MdLocationOn } from "react-icons/md";
import { submitContactForm } from "../services/contactApi";
import SuccessModal from "../Components/SuccessModal";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const SendMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await submitContactForm(formData);
      if (response.success) {
        setFormData({ name: "", email: "", phone: "", message: "" });
        setShowSuccessModal(true);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Connect With Us | ELocate</title>
        <meta name="description" content="Reach out to ELocate's sustainability experts for personalized assistance and information on e-waste management." />
      </Head>

      <ToastContainer theme="dark" position="top-right" />

      {/* Hero Section */}
      <section className="relative py-12 px-4 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl shadow-emerald-500" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-300 rounded-full blur-3xl opacity-20" />
        </div>

        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-6 font-cuprum tracking-tight"
          >
            Get In Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-emerald-50 max-w-2xl mx-auto leading-relaxed"
          >
            Have questions about compliance or recycling? Our experts are here to navigate the future of electronics with you.
          </motion.p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 px-4 -mt-10 mb-10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-12">

            {/* Form Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-3/5 bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-gray-100"
            >
              <h2 className="text-3xl font-bold text-gray-900 font-cuprum mb-8">Send Us a Message</h2>
              <form onSubmit={SendMsg} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 ml-1 uppercase tracking-wider">Full Name</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Jane Doe"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 ml-1 uppercase tracking-wider">Email Address</label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="jane@example.com"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 ml-1 uppercase tracking-wider">Phone Number</label>
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 00000 00000"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 ml-1 uppercase tracking-wider">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    placeholder="Tell us how we can help..."
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-emerald-100 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : "Initialize Connection"}
                </button>
              </form>
            </motion.div>

            {/* Info Column */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-2/5 space-y-8"
            >
              <div className="bg-emerald-900 p-10 rounded-[2.5rem] shadow-xl text-white flex flex-col items-center text-center">
                <h3 className="text-3xl font-bold font-cuprum mb-12">Contact Information</h3>

                <div className="space-y-10 w-full">
                  <div className="flex flex-col items-center gap-4 group">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-lg">
                      <MdLocationOn className="text-3xl" />
                    </div>
                    <div>
                      <p className="font-bold text-emerald-200 text-sm uppercase tracking-widest mb-2">Our Office</p>
                      <p className="text-xl leading-relaxed">
                        Karamadai, Coimbatore,<br />Tamil Nadu, India 641104
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-4 group">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-lg">
                      <MdPhoneInTalk className="text-3xl" />
                    </div>
                    <div>
                      <p className="font-bold text-emerald-200 text-sm uppercase tracking-widest mb-2">Phone Number</p>
                      <Link href="tel:+919788948883" className="text-2xl font-bold hover:text-emerald-400 transition-colors">
                        +91 97889 48883
                      </Link>
                      <p className="text-white/40 text-sm mt-1 font-medium">Mon-Fri: 9AM - 6PM IST</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-4 group">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-lg">
                      <MdEmail className="text-3xl" />
                    </div>
                    <div>
                      <p className="font-bold text-emerald-200 text-sm uppercase tracking-widest mb-2">Email Experts</p>
                      <Link href="mailto:contact@elocate.com" className="text-2xl font-bold hover:text-emerald-400 transition-colors">
                        contact@elocate.com
                      </Link>
                      <p className="text-white/40 text-sm mt-1 font-medium">Estimated response: 2h</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-10 border-t border-white/10 w-full flex flex-col items-center">
                  <p className="text-sm font-bold text-emerald-200 uppercase tracking-widest mb-6">Social Ecosystem</p>
                  <div className="flex gap-4">
                    {[
                      { icon: logoLinkedin, label: "LinkedIn" },
                      { icon: logoTwitter, label: "Twitter" },
                      { icon: logoInstagram, label: "Instagram" },
                      { icon: logoWhatsapp, label: "WhatsApp" }
                    ].map((app, i) => (
                      <Link
                        key={i}
                        href="#"
                        className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-emerald-500 hover:-translate-y-1 transition-all"
                      >
                        <ClientIonIcon icon={app.icon} className="text-lg" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Developer Attribution Card */}
              <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm text-emerald-600 font-extrabold text-xl font-cuprum">
                  BIT
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Developed By Team BIT</h4>
                  <p className="text-sm text-gray-500">Bannari Amman Institute of Technology</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Connection Initialized!"
        message="Thank you for reaching out. Your message has been routed to our sustainability specialists. We will contact you shortly."
      />
    </div>
  );
};

export default ContactUs;
