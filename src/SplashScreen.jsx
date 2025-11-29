// src/components/SplashScreen.jsx
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import logo from '/logo.png'

const SplashScreen = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, 2000); // show for 2 seconds
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 1.5, duration: 0.5 }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#0F172A] text-white z-50"
    >
      <motion.img
        src={logo} // Corrected: Path to the logo in the public folder
        alt="CampusFind Logo"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="w-44 h-44 object-contain mb-8"
      />
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-xl font-semibold tracking-wide text-center"
      >
        “Find it. Return it. Simplify Campus Life.”
      </motion.h1>
    </motion.div>
  );
};

export default SplashScreen;
