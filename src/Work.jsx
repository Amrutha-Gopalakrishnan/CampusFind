import React from "react";
import { motion } from "framer-motion";
import { ClipboardList, HandHeart, CheckCircle2, ArrowRight, Sparkles, Zap, Shield } from "lucide-react";

const Work = () => {
  return (
    <div id="how-it-works" className="relative py-20 overflow-hidden bg-gradient-to-b from-[#FFFFFF] to-[#EAF1FF]">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-[#5B8DEF]/20 to-[#0066FF]/10 rounded-full blur-3xl"
        ></motion.div>
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-[#0066FF]/15 to-[#5B8DEF]/10 rounded-full blur-3xl"
        ></motion.div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0066FF] to-[#5B8DEF] rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-4xl font-extrabold text-[#1C1C1E]">How It Works</h2>
          </div>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience a faster and smarter way to manage lost and found items on your campus.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <ClipboardList className="w-8 h-8 text-white" />,
              title: "Report Lost",
              color: "from-[#5B8DEF] to-[#0066FF]",
              desc: "Submit details of your lost item to notify your college instantly and increase recovery chances.",
              link: "Start a lost report",
              delay: 0.1,
            },
            {
              icon: <HandHeart className="w-8 h-8 text-white" />,
              title: "Post Found",
              color: "from-[#0066FF] to-[#5B8DEF]",
              desc: "Found something valuable? Post it securely with a description and photo to locate its owner.",
              link: "Post a found item",
              delay: 0.2,
            },
            {
              icon: <CheckCircle2 className="w-8 h-8 text-white" />,
              title: "Claim Back",
              color: "from-[#0066FF] to-[#5B8DEF]",
              desc: "Once verified, safely claim your belongings with CampusFind’s trusted process.",
              link: "Check claim status",
              delay: 0.3,
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: step.delay }}
              className="group bg-[#FFFFFF] rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-[#EAF1FF]"
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}
                >
                  {step.icon}
                </div>
                <h4 className="text-2xl font-bold text-[#1C1C1E]">{step.title}</h4>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">{step.desc}</p>
              <div className="flex items-center gap-2 text-[#0066FF] font-semibold group-hover:gap-3 transition-all duration-300">
                <span>{step.link}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Zap />, title: "Instant Alerts", desc: "Receive immediate notifications when items are reported." },
            { icon: <Shield />, title: "Secure Platform", desc: "Built with verified access for campus-only users." },
            { icon: <CheckCircle2 />, title: "Trusted Recovery", desc: "Ensures authentic and safe item claims." },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#0066FF] to-[#5B8DEF] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                {React.cloneElement(feature.icon, { className: "w-8 h-8 text-white" })}
              </div>
              <h3 className="text-xl font-bold text-[#1C1C1E] mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;
