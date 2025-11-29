import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Search, Shield, CheckCircle, Zap } from 'lucide-react';
import logo from '/logo.png'

const Hero = () => {
  return (
    <header
      className="relative overflow-hidden bg-gradient-to-br from-[#0D2B65] via-[#1A4DB7] to-[#4FA3F7] min-h-screen flex items-center justify-center text-white font-[Poppins]"
    >
      {/* Soft background motion glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 8 }}
          className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#4FA3F7]/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ repeat: Infinity, duration: 10, delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] bg-[#1A4DB7]/30 rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <section className="relative w-full max-w-7xl mx-auto px-6 sm:px-10 py-24 text-center">
        
        {/* Logo with animation */}
        <motion.img
          src={logo}
          alt="CampusFind logo - Lost & Found platform for colleges"
          className="w-44 h-44 mx-auto mb-8 drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          loading="lazy"
        />

        {/* Title */}
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="font-extrabold text-4xl sm:text-6xl md:text-7xl leading-tight mb-6 tracking-tight"
        >
          Reconnect With What You’ve Lost on Campus
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-lg sm:text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed"
        >
          CampusFind is your smart, secure <strong>Lost & Found management platform</strong> 
          built for educational institutions. Report, track, and reclaim items seamlessly.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-12"
        >
          <Link
            to="/dashboard"
            className="group relative px-8 py-4 bg-[#1A4DB7] text-white rounded-2xl font-semibold text-lg shadow-lg hover:bg-[#0D2B65] transition-all duration-300 hover:scale-105"
            aria-label="Get started with CampusFind dashboard"
          >
            <span className="relative flex items-center gap-3">
              Get Started
              <FaArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <a
            href="#how-it-works"
            className="px-8 py-4 rounded-2xl font-semibold text-lg bg-white/90 text-[#0D2B65] hover:bg-[#E6EAF2] transition-all duration-300 hover:scale-105 shadow-md"
          >
            How It Works
          </a>
        </motion.div>

        {/* Feature Highlights */}
        <section 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mx-auto mt-20"
          aria-label="CampusFind key features"
        >
          {[
            { icon: Search, title: "Smart Search", text: "Instantly locate lost or found items using advanced filters." },
            { icon: Zap, title: "Quick Post", text: "List found or lost items in under two minutes." },
            { icon: Shield, title: "Secure Access", text: "Verified college email login ensures trusted access." },
            { icon: CheckCircle, title: "Verified Claims", text: "Authentic, validated claims for every item." }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              viewport={{ once: true }}
              className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 flex flex-col items-center text-center hover:bg-white/20 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#4FA3F7] to-[#1A4DB7] rounded-2xl flex items-center justify-center shadow-lg mb-4">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-200 text-sm">{feature.text}</p>
            </motion.div>
          ))}
        </section>
      </section>
    </header>
  );
};

export default Hero;
