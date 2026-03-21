"use client";
import React, { useState } from "react";
import ClientIonIcon from "@/components/ClientIonIcon";
import logo from "../../../assets/ELocate-s.png";
import Link from "next/link";
import Image from "next/image";
import emailjs from "@emailjs/browser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Footer = () => {
  const [formData, setFormData] = useState({
    email: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    } as Pick<typeof formData, keyof typeof formData>);
    ;
  };

  const SendMsg = (e: React.FormEvent) => {
    e.preventDefault();
    const templateParams = {
      email: formData.email,
    };

    emailjs
      .send(
        "service_jqn5flv",
        "template_ppph1w9",
        templateParams,
        "ddYcz13MvW01UFF5u"
      )
      .then((result: { text: any }) => {
        setFormData({
          email: "",
        });
        toast.success("Subscription Confirmed! Welcome to the ELocate community.");
      })
      .catch((error: { text: any }) => {
        toast.error("Unable to process your request. Please try again.");
      });
  };
  return (
    <footer className="relative bg-[#071e11] text-[#9ab5a2] pt-20 pb-8 border-t border-[#173824] overflow-hidden" style={{ fontFamily: "'Inter', 'Outfit', system-ui, sans-serif" }}>
      {/* Background Blobs for Modern UI */}
      <div className="absolute w-[400px] h-[400px] bg-[#1a6b32] opacity-20 -top-32 -left-32 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] bg-[#3bdf6f] opacity-10 bottom-[-50px] right-[-50px] blur-[80px] rounded-full pointer-events-none" />

      {/* Main Grid */}
      <div className="w-full max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-24 relative z-10">
        <ToastContainer
          className="text-sm"
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        
        <div className="flex flex-col lg:flex-row lg:justify-between items-start gap-12 lg:gap-8 xl:gap-12 mb-16">
          
          {/* Brand & Newsletter */}
          <div className="flex flex-col items-start lg:w-[32%] xl:w-[28%] shrink-0">
            <Link href="/citizen" className="mb-6 block">
              <Image src={logo} alt="ELocate" width={140} height={140} className="drop-shadow-lg" />
            </Link>
            <p className="text-[14px] leading-relaxed text-[#7a9e8a] mb-8 pr-4">
              ELocate: Revolutionizing e-waste management through technological innovation. Connect with certified recycling facilities and empower your journey toward environmental responsibility.
            </p>
            <form onSubmit={SendMsg} className="w-full relative max-w-[340px]">
              <input
                type="email"
                name="email"
                placeholder="Join our newsletter"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full bg-[#12311f] border border-[#1f4d30] rounded-xl py-3 pl-4 pr-14 text-[13px] text-white placeholder:text-[#5a7a6a] outline-none focus:border-[#3bdf6f] transition-colors"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-[#22883e] hover:bg-[#1a6b32] text-white rounded-lg transition-colors cursor-pointer"
                aria-label="Subscribe"
              >
                <div className="flex items-center justify-center text-lg">
                  <ClientIonIcon icon="paper-plane" />
                </div>
              </button>
            </form>
          </div>

          {/* Links 1 */}
          <div className="flex flex-col shrink-0 lg:pt-6">
            <h3 className="text-white font-semibold tracking-wide text-[16px] mb-6 inline-block relative">
              Core Features
              <span className="absolute -bottom-2 left-0 w-1/2 h-[2px] bg-[#22883e] rounded-full"></span>
            </h3>
            <ul className="flex flex-col gap-4 mt-2">
              {[
                { label: "Analyze E-Waste", path: "/citizen/analyze" },
                { label: "Book a Pickup", path: "/citizen/book-recycle" },
                { label: "Find E-Facilities", path: "/citizen/e-facilities" },
                { label: "Educational Hub", path: "/citizen/education" },
                { label: "Rewards & Profile", path: "/citizen/profile" }
              ].map(link => (
                <li key={link.label}>
                  <Link href={link.path} className="text-[14px] font-medium text-[#7a9e8a] hover:text-[#3bdf6f] hover:translate-x-1.5 transition-all inline-block flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1f4d30]"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links 2 */}
          <div className="flex flex-col shrink-0 lg:pt-6">
            <h3 className="text-white font-semibold tracking-wide text-[16px] mb-6 inline-block relative">
              Platform & Support
              <span className="absolute -bottom-2 left-0 w-1/2 h-[2px] bg-[#22883e] rounded-full"></span>
            </h3>
            <ul className="flex flex-col gap-4 mt-2">
              {[
                { label: "About Us", path: "/citizen/about" },
                { label: "E-Waste Guidelines", path: "/citizen/rules" },
                { label: "Our Services", path: "/citizen/services" },
                { label: "Technical Support", path: "/citizen/support" },
                { label: "Contact Us", path: "/citizen/contactus" }
              ].map(link => (
                <li key={link.label}>
                  <Link href={link.path} className="text-[14px] font-medium text-[#7a9e8a] hover:text-[#3bdf6f] hover:translate-x-1.5 transition-all inline-block flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1f4d30]"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="flex flex-col shrink-0 lg:pt-6">
            <h3 className="text-white font-semibold tracking-wide text-[16px] mb-6 inline-block relative">
              Connect With Us
              <span className="absolute -bottom-2 left-0 w-1/2 h-[2px] bg-[#22883e] rounded-full"></span>
            </h3>
            <ul className="flex flex-col gap-5 mt-2">
              <li className="flex items-start gap-3.5 group">
                <div className="w-9 h-9 rounded-full bg-[#12311f] border border-[#1f4d30] flex items-center justify-center shrink-0 group-hover:bg-[#22883e] transition-colors shadow-lg">
                  <ClientIonIcon icon="location" />
                </div>
                <address className="text-[13px] leading-relaxed text-[#7a9e8a] font-medium not-italic mt-0.5">
                  Karamadai, Coimbatore,<br />Tamil Nadu, India 641104
                </address>
              </li>
              <li className="flex items-center gap-3.5 group">
                <div className="w-9 h-9 rounded-full bg-[#12311f] border border-[#1f4d30] flex items-center justify-center shrink-0 group-hover:bg-[#22883e] transition-colors shadow-lg">
                  <ClientIonIcon icon="call" />
                </div>
                <Link href="tel:+919788948883" className="text-[13px] font-medium text-[#7a9e8a] group-hover:text-white transition-colors">
                  +91 9788948883
                </Link>
              </li>
              <li className="flex items-center gap-3.5 group">
                <div className="w-9 h-9 rounded-full bg-[#12311f] border border-[#1f4d30] flex items-center justify-center shrink-0 group-hover:bg-[#22883e] transition-colors shadow-lg">
                  <ClientIonIcon icon="mail" />
                </div>
                <Link href="mailto:contact@elocate.com" className="text-[13px] font-medium text-[#7a9e8a] group-hover:text-white transition-colors">
                  contact@elocate.com
                </Link>
              </li>
              
              <li className="flex gap-2.5 mt-7">
                {[
                  { icon: "logo-linkedin", label: "LinkedIn" },
                  { icon: "logo-instagram", label: "Instagram" },
                  { icon: "logo-twitter", label: "Twitter" },
                  { icon: "logo-whatsapp", label: "WhatsApp" }
                ].map(social => (
                  <Link key={social.label} href="#" aria-label={social.label} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#0a2518] text-lg border border-[#1f4d30] shadow-md hover:border-[#3bdf6f] hover:text-[#3bdf6f] hover:-translate-y-1 transition-all">
                    <ClientIonIcon icon={social.icon} />
                  </Link>
                ))}
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="pt-6 border-t border-[#173824] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[13px] font-medium text-[#5a7a6a]">
            &copy; {new Date().getFullYear()} ELocate | All Rights Reserved by <Link href="#" className="font-bold text-[#7a9e8a] hover:text-[#3bdf6f] transition-colors">Team BIT</Link>
          </p>
          <ul className="flex items-center gap-8">
            <li><Link href="/citizen/privacypolicy" className="text-[13px] font-medium text-[#5a7a6a] hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/citizen/termsandservices" className="text-[13px] font-medium text-[#5a7a6a] hover:text-white transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

