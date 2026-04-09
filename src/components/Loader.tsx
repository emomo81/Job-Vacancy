"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function Loader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Hide after 1.8s
    const t = setTimeout(() => setVisible(false), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0A0A0F]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: "easeInOut" } }}
        >
          {/* Logo */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Image src="/logo.png" alt="Job RW" width={180} height={72} className="h-16 w-auto object-contain" priority />
          </motion.div>

          {/* Progress bar */}
          <motion.div
            className="w-40 h-0.5 bg-white/10 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.2, ease: "easeInOut", delay: 0.3 }}
            />
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="text-gray-500 text-xs mt-4 tracking-widest uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Hire Smarter. Screen Faster.
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
