"use client";

import React from "react";
import { motion, Variants } from "motion/react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 110,
      damping: 15,
    },
  },
};

export default function LeftShowcase() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-lg mt-12"
    >
      {/* Live Signal Badge */}
      <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 backdrop-blur-md self-start">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
        </span>
        <span className="text-[10px] font-bold font-mono text-primary tracking-widest uppercase">
          live connection active
        </span>
      </motion.div>

      {/* Majestic Hero Headline */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h2 className="text-4xl lg:text-5.5xl font-extrabold tracking-tight leading-tight font-head">
          One room.
          <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-foreground">
            Everyone is in it.
          </span>
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
          No threads. No noise. No channels. Just a unified flow of pure human connection. Welcome to the global conversational grid.
        </p>
      </motion.div>

      {/* Key Features Core Listings */}
      <div className="space-y-3 pt-1">
        {[
          {
            title: "Zero Logging Guarantee",
            description: "Conversations reside strictly in-memory and disintegrate instantly upon session exit.",
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            )
          },
          {
            title: "Knock-to-Connect Gateway",
            description: "Knock on any online user's handle to initialize a temporary, fully private conversational channel.",
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            )
          },
          {
            title: "Hypersonic Socket Signal",
            description: "Custom lightweight socket pipeline processes globally distributed broadcasts in under 100ms.",
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary">
                <path d="M12 2v20M17 5v14M22 9v6M7 8v8M2 10v4" />
              </svg>
            )
          }
        ].map(({ title, description, icon }, idx) => (
          <motion.div
            variants={itemVariants}
            key={idx}
            className="flex items-start gap-3 p-3 rounded-2xl bg-card/30 border border-border/40 backdrop-blur-md transition-all duration-300 hover:border-primary/20 hover:bg-card/45 select-none"
          >
            <div className="w-8.5 h-8.5 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-sm shadow-primary/5">
              {icon}
            </div>
            <div className="space-y-0.5">
              <h4 className="text-[10px] font-bold text-foreground font-sans tracking-wider uppercase">{title}</h4>
              <p className="text-[10.5px] text-muted-foreground leading-relaxed font-medium">{description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Premium Glassmorphic Stats Grid */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        {[
          {
            label: "Unified",
            value: "Global Room",
            icon: (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            )
          },
          {
            label: "Latency",
            value: "Sub-100ms",
            icon: (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
            )
          },
          {
            label: "Signal",
            value: "100% Pure",
            icon: (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary">
                <path d="M12 2v20M17 5v14M22 9v6M7 8v8M2 10v4" />
              </svg>
            )
          },
        ].map(({ label, value, icon }) => (
          <motion.div
            variants={itemVariants}
            key={label}
            className="rounded-2xl bg-card/40 border border-border/60 hover:border-primary/20 backdrop-blur-md px-3.5 py-2.5 space-y-1 transition-all duration-300 hover:translate-y-[-2px] select-none"
          >
            <div className="flex items-center gap-1.5">
              {icon}
              <p className="text-[8.5px] font-bold font-mono text-muted-foreground uppercase tracking-widest">
                {label}
              </p>
            </div>
            <p className="text-xs font-bold text-foreground font-sans tracking-tight">{value}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
