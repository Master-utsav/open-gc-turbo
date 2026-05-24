"use client";

import { motion } from "motion/react";
import React from "react";

export default function LandingWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 20 }}
      className="relative z-10 w-full max-w-sm overflow-y-auto max-h-full py-8 scrollbar-none"
    >
      {children}
    </motion.div>
  );
}
