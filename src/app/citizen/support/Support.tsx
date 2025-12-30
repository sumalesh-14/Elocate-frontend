"use client";
import React, { useState } from "react";
import { MdSearch, MdPhoneInTalk, MdArticle, MdSend } from "react-icons/md";

const Support = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [formData, setFormData] = useState({
        subject: "",
        message: "",
    });


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement form submission logic
        console.log("Form submitted:", formData);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Main Container with Sidebar and Content */}
            <div className="flex flex-1">

                {/* Main Content */}
                <main className="flex-1 h-full flex flex-col overflow-hidden bg-gray-50">
                    <div className="flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6">
                        <div className="w-full flex flex-col gap-8 pb-12">
                            {/* Header */}
                            <header className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <h1 className="text-gray-900 text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
                                        Support Center
                                    </h1>
                                    <p className="text-green-600 text-base font-normal">
                                        How can we help you today?
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center border-2 border-white shadow-sm text-gray-600 font-bold">
                                        U
                                    </div>
                                </div>
                            </header>

                            {/* Search Bar */}
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MdSearch className="text-gray-400 text-xl" />
                                </div>
                                <input
                                    className="block w-full pl-11 pr-4 py-4 rounded-xl border-0 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-500 sm:text-base sm:leading-6"
                                    placeholder="Search for articles, topics, or resources..."
                                    type="text"
                                />
                            </div>

                            {/* Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Contact Form - Left Column */}
                                <div className="lg:col-span-2">
                                    <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
                                        <div className="mb-6">
                                            <h2 className="text-xl font-bold text-gray-900">Contact Us</h2>
                                            <p className="text-gray-500 text-sm mt-1">
                                                Submit your query below and we'll get back to you shortly.
                                            </p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1">
                                            {/* Subject Field */}
                                            <div>
                                                <label
                                                    className="block text-sm font-bold text-gray-900 mb-2"
                                                    htmlFor="subject"
                                                >
                                                    Subject
                                                </label>
                                                <input
                                                    className="block w-full rounded-xl border-0 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-500 sm:text-sm sm:leading-6 py-3 px-4"
                                                    id="subject"
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    placeholder="What is your request regarding?"
                                                    type="text"
                                                />
                                            </div>

                                            {/* Message Field */}
                                            <div className="flex-1">
                                                <label
                                                    className="block text-sm font-bold text-gray-900 mb-2"
                                                    htmlFor="message"
                                                >
                                                    Message
                                                </label>
                                                <textarea
                                                    className="block w-full rounded-xl border-0 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-500 sm:text-sm sm:leading-6 py-3 px-4 min-h-[160px]"
                                                    id="message"
                                                    name="message"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    placeholder="Please provide details about your issue or question..."
                                                />
                                            </div>

                                            {/* Submit Button */}
                                            <div className="flex justify-end pt-2">
                                                <button
                                                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all flex items-center gap-2"
                                                    type="submit"
                                                >
                                                    Send
                                                    <MdSend className="text-sm" />
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                {/* Phone Support - Right Column */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 h-full">
                                        <div className="flex flex-col gap-6">
                                            <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                                <MdPhoneInTalk className="text-3xl" />
                                            </div>

                                            <div>
                                                <h3 className="text-gray-900 text-lg font-bold">Phone Support</h3>
                                                <p className="text-gray-500 text-sm mt-1">
                                                    Prefer to speak with someone directly?
                                                </p>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                        Call Us
                                                    </p>
                                                    <a
                                                        className="text-xl font-bold text-gray-900 hover:text-green-500 transition-colors flex items-center gap-2"
                                                        href="tel:+18001234567"
                                                    >
                                                        +1 (800) 123-4567
                                                    </a>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                        Hours of Operation
                                                    </p>
                                                    <p className="text-sm text-gray-900">Mon-Fri: 8:00 AM - 5:00 PM</p>
                                                    <p className="text-sm text-gray-500">Weekends: Closed</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Knowledge Base CTA */}
                            <div className="bg-green-50 border border-green-200 p-8 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white rounded-full shadow-sm text-green-600">
                                        <MdArticle className="text-3xl" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-lg font-bold text-gray-900">
                                            Still can't find what you're looking for?
                                        </h4>
                                        <p className="text-sm text-green-700">
                                            Browse our comprehensive knowledge base for detailed guides and policies.
                                        </p>
                                    </div>
                                </div>
                                <button className="whitespace-nowrap px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-lg transition-all">
                                    Visit Knowledge Base
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Support;
