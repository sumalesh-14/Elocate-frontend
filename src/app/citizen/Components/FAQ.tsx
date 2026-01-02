import { motion, AnimatePresence } from "framer-motion";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";
import React, { useState } from "react";

const FAQ = () => {
  const faqData = [
    {
      question: "How does ELocate help me find e-waste recycling facilities?",
      answer:
        "ELocate's intelligent facility locator uses geolocation technology to instantly identify certified e-waste recycling centers nearest to you. Simply access our interactive map interface, enter your location, and discover detailed information about each facility including operational hours, accepted materials, certification status, and user ratings—all designed to make responsible e-waste disposal effortless and convenient.",
    },
    {
      question: "How does ELocate verify the facilities listed on the platform?",
      answer:
        "We implement a rigorous multi-step verification process for all facilities on our platform. Each facility undergoes credential validation, certification verification, operational compliance checks, and ongoing monitoring. We also incorporate user feedback and regular audits to maintain the highest standards of accuracy and reliability—ensuring you can trust every facility recommendation we provide.",
    },
    {
      question: "Can I schedule the pickup and recycling of my e-waste through ELocate?",
      answer:
        "Absolutely! Our streamlined booking system allows you to schedule e-waste pickups with just a few clicks. Select your preferred facility, choose from available time slots, specify the type and quantity of e-waste, and receive immediate confirmation. Many of our partner facilities also offer special incentives for ELocate users, making responsible recycling not just convenient but rewarding as well.",
    },
    {
      question: "What kind of educational resources does ELocate offer?",
      answer:
        "ELocate features a comprehensive knowledge hub with expert-curated content including in-depth articles, video tutorials, infographics, and case studies. Our educational resources cover topics ranging from the environmental impact of e-waste to best practices in electronics lifecycle management, emerging recycling technologies, and regulatory compliance. We regularly update our content to reflect the latest research and innovations in sustainable e-waste management.",
    },
    {
      question: "How can I stay updated on changing e-waste regulations and compliance requirements?",
      answer:
        "Our dedicated regulatory center maintains a real-time database of local, national, and international e-waste regulations. Subscribers receive customized compliance alerts based on their location and business needs. Our platform also provides simplified explanations of complex regulatory frameworks, practical compliance guides, and access to compliance certification pathways—turning regulatory complexity into actionable insights.",
    },
    {
      question: "What additional benefits do I get by subscribing to the ELocate newsletter?",
      answer:
        "Our newsletter subscribers gain exclusive access to premium content including expert interviews, early notification of recycling events, special recycling incentive programs, and industry trend analyses. You'll also receive personalized recycling recommendations, invitations to virtual and in-person sustainability workshops, and opportunities to connect with our growing community of environmentally conscious individuals and organizations. Join thousands of subscribers already benefiting from our curated insights.",
    },
  ];

  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  return (
    <section className="py-32 bg-white" id="faq">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <div className="font-mono text-emerald-600 text-xs mb-4 tracking-[0.3em] uppercase">Knowledge_Base_Access</div>
          <h2 className="text-5xl md:text-7xl font-black font-cuprum text-gray-900 mb-6 uppercase tracking-tighter leading-none">
            QUERY <span className="text-emerald-600">INTERFACE</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
            Access detailed documentation on our advanced e-waste management protocols and AI-driven distribution system.
          </p>
        </motion.div>

        <div className="space-y-6">
          {faqData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-3xl border transition-all duration-500 ${activeQuestion === index
                ? "bg-emerald-50 shadow-xl border-emerald-300"
                : "bg-white border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
                }`}
            >
              <button
                className="w-full text-left p-8 md:p-10 flex items-center justify-between group"
                onClick={() => toggleQuestion(index)}
              >
                <span className={`text-2xl md:text-3xl font-bold font-cuprum transition-colors flex items-baseline gap-3 ${activeQuestion === index ? "text-emerald-700" : "text-gray-800"
                  }`}>
                  <span className="font-normal text-2xl md:text-3xl text-emerald-600 flex-shrink-0">{index + 1}.</span>
                  <span>{item.question}</span>
                </span>
                <span className={`text-4xl transition-all duration-500 ${activeQuestion === index ? "rotate-180 text-emerald-600" : "text-gray-400 group-hover:text-emerald-500"
                  }`}>          <div className="w-10 h-10 rounded-full border border-current flex items-center justify-center">
                    <RiArrowDropDownLine />
                  </div>
                </span>
              </button>

              <AnimatePresence>
                {activeQuestion === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "anticipate" }}
                    className="overflow-hidden"
                  >
                    <div className="p-10 pt-0 text-gray-700 text-xl leading-relaxed font-light border-t border-emerald-200 mx-10">
                      <div className="py-6">
                        {item.answer}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
