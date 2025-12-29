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
import emailjs from "@emailjs/browser";
import { ToastContainer, toast } from "react-toastify";
import Head from "next/head";
import { MdSearch, MdPhoneInTalk, MdArticle } from "react-icons/md";
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
      // Call the dummy API service
      const response = await submitContactForm(formData);

      if (response.success) {
        // Clear form on success
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
        });

        // Show success modal instead of toast
        setShowSuccessModal(true);
      } else {
        // Show error toast
        toast.error(response.message, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (error) {
      // Show error toast for unexpected errors
      toast.error("An unexpected error occurred. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }

    // Old EmailJS implementation - commented out for reference
    /*
    const templateParams = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
    };

    emailjs
      .send(
        "service_jqn5flv",
        "template_cnom5kj",
        templateParams,
        "ddYcz13MvW01UFF5u"
      )
      .then((result: { text: any }) => {
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
        });
        toast.success("Message Received! Our team will respond shortly.");
      })
      .catch((error: { text: any }) => {
        toast.error("We encountered an issue. Please try again or email us directly.");
      });
    */
  };

  return (
    <>
      <Head>
        <title>ELocate - Connect With Our Sustainability Experts</title>
        <meta name="description" content="Have questions about e-waste management or our platform? Get in touch with ELocate's dedicated team for personalized assistance and information." />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <ToastContainer
          className="text-2xl"
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

        <div className="w-full px-16 md:px-32 lg:px-40">
          <div className="flex flex-col gap-8">
            {/* Header Section */}
            <div className="text-center">
              <h1 className="text-green-600 text-xl md:text-2xl font-bold uppercase tracking-wider mb-4">
                —CONNECT WITH US—
              </h1>
              <h2 className="text-gray-900 text-4xl md:text-5xl font-extrabold leading-tight mb-6">
                Partner with us in building a sustainable future for electronics
              </h2>
              <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                Whether you have questions about our services, want to suggest a recycling facility,
                or need assistance with e-waste management, our dedicated team is here to help
                you make environmentally responsible choices.
              </p>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 mt-8">
              {/* Contact Form - Left Column */}
              <div className="lg:col-span-6">
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
                  <div className="mb-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Reach Out to Our Team</h2>
                    <p className="text-gray-600 text-base md:text-lg mt-2">
                      Submit your query below and we'll get back to you shortly.
                    </p>
                  </div>

                  <form onSubmit={SendMsg} className="flex flex-col gap-6 flex-1">
                    {/* Name Field */}
                    <div>
                      <label
                        className="block text-base md:text-lg font-bold text-gray-900 mb-2"
                        htmlFor="name"
                      >
                        Your Name
                      </label>
                      <input
                        className="block w-full rounded-xl border-0 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-green-500 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-500 outline-none text-base md:text-lg py-4 px-5"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        type="text"
                        required
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <label
                        className="block text-base md:text-lg font-bold text-gray-900 mb-2"
                        htmlFor="email"
                      >
                        Email Address
                      </label>
                      <input
                        className="block w-full rounded-xl border-0 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-green-500 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-500 outline-none text-base md:text-lg py-4 px-5"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Your email address"
                        type="email"
                        required
                      />
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label
                        className="block text-base md:text-lg font-bold text-gray-900 mb-2"
                        htmlFor="phone"
                      >
                        Phone Number
                      </label>
                      <input
                        className="block w-full rounded-xl border-0 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-green-500 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-500 outline-none text-base md:text-lg py-4 px-5"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Your contact number"
                        type="tel"
                        required
                      />
                    </div>

                    {/* Message Field */}
                    <div className="flex-1">
                      <label
                        className="block text-base md:text-lg font-bold text-gray-900 mb-2"
                        htmlFor="message"
                      >
                        Your Message
                      </label>
                      <textarea
                        className="block w-full rounded-xl border-0 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-green-500 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-500 outline-none text-base md:text-lg py-4 px-5 min-h-[150px] resize-none"
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="How can we assist with your e-waste management needs?"
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-2">
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white text-lg font-bold py-4 px-10 rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          "Send Your Message"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Contact Info - Right Column */}
              <div className="lg:col-span-4">
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 h-full">
                  <div className="flex flex-col gap-6 items-center text-center">
                    <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                      <MdPhoneInTalk className="text-3xl" />
                    </div>

                    <div>
                      <h3 className="text-gray-900 text-2xl md:text-3xl font-bold">Direct Contact Information</h3>
                      <p className="text-gray-600 text-base md:text-lg mt-2">
                        Get in touch with us directly
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Location */}
                      <div>
                        <div className="flex items-start gap-2 mb-1">
                          <ClientIonIcon icon={location} className="text-green-600 w-5 h-5 mt-0.5" />
                          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                            Our Location
                          </p>
                        </div>
                        <address className="text-base md:text-lg text-gray-900 ml-7 not-italic leading-relaxed">
                          Main Office: Chh. Sambhajinagar<br />
                          (Aurangabad), Maharashtra, India 431001
                        </address>
                      </div>

                      {/* Phone */}
                      <div>
                        <div className="flex items-start gap-2 mb-1">
                          <ClientIonIcon icon={call} className="text-green-600 w-5 h-5 mt-0.5" />
                          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                            Phone Support
                          </p>
                        </div>
                        <Link
                          href="tel:+911234567890"
                          className="text-lg md:text-xl font-semibold text-gray-900 hover:text-green-500 transition-colors ml-7 block"
                        >
                          +91 123 456 7890
                        </Link>
                        <p className="text-base text-gray-600 ml-7">Mon-Fri: 9AM to 6PM IST</p>
                      </div>

                      {/* Email */}
                      <div>
                        <div className="flex items-start gap-2 mb-1">
                          <ClientIonIcon icon={mail} className="text-green-600 w-5 h-5 mt-0.5" />
                          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                            Email Us
                          </p>
                        </div>
                        <Link
                          href="mailto:contact@elocate.com"
                          className="text-lg md:text-xl font-semibold text-gray-900 hover:text-green-500 transition-colors ml-7 block"
                        >
                          contact@elocate.com
                        </Link>
                        <p className="text-base text-gray-600 ml-7">We respond within 24 hours</p>
                      </div>

                      {/* Social Media */}
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                          Connect on Social Media
                        </p>
                        <div className="flex gap-3">
                          <Link
                            href="/citizen"
                            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-green-100 flex items-center justify-center text-gray-600 hover:text-green-600 transition-colors"
                            aria-label="LinkedIn"
                          >
                            <ClientIonIcon icon={logoLinkedin} className="w-5 h-5" />
                          </Link>
                          <Link
                            href="/citizen"
                            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-green-100 flex items-center justify-center text-gray-600 hover:text-green-600 transition-colors"
                            aria-label="Instagram"
                          >
                            <ClientIonIcon icon={logoInstagram} className="w-5 h-5" />
                          </Link>
                          <Link
                            href="/citizen"
                            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-green-100 flex items-center justify-center text-gray-600 hover:text-green-600 transition-colors"
                            aria-label="Twitter"
                          >
                            <ClientIonIcon icon={logoTwitter} className="w-5 h-5" />
                          </Link>
                          <Link
                            href="/citizen"
                            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-green-100 flex items-center justify-center text-gray-600 hover:text-green-600 transition-colors"
                            aria-label="WhatsApp"
                          >
                            <ClientIonIcon icon={logoWhatsapp} className="w-5 h-5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Knowledge Base CTA */}
            <div className="bg-green-50 border border-green-200 p-8 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 mt-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-full shadow-sm text-green-600">
                  <MdArticle className="text-3xl" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-xl md:text-2xl font-bold text-gray-900">
                    Need More Information?
                  </h4>
                  <p className="text-base md:text-lg text-green-700">
                    Browse our comprehensive knowledge base for detailed guides about e-waste recycling and sustainability.
                  </p>
                </div>
              </div>
              <button className="whitespace-nowrap px-8 py-4 bg-green-500 hover:bg-green-600 text-white text-lg font-bold rounded-lg shadow-lg transition-all">
                Visit Knowledge Base
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Message Sent Successfully!"
        message="Thank you for contacting us! We've received your message and our team will get back to you within 24 hours."
      />
    </>
  );
};

export default ContactUs;
