import React from "react";

export default function BrandLogo() {
  return (
    <div className="flex items-center gap-3 select-none group">
      {/* Premium glowing logo icon */}
      <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary via-primary/90 to-accent shrink-0 shadow-lg shadow-primary/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/45 overflow-hidden">
        {/* Shimmer/reflection overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
        
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-2xl border border-white/10 opacity-70 group-hover:opacity-100 transition-opacity" />

        {/* Global chat bubble SVG */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-primary-foreground relative z-10 transition-transform duration-500 group-hover:rotate-12"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeDasharray="1.5 1.5" />
        </svg>
      </div>

      {/* Premium styled brand text */}
      <div className="flex flex-col">
        <h1 className="font-head text-2xl font-bold tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground to-primary/95 transition-all duration-300">
          open
          <span className="text-primary font-sans">.</span>
          global
          <span className="text-primary font-sans">.</span>
          chat
        </h1>
        <span className="text-[9px] font-bold font-mono text-muted-foreground uppercase tracking-widest mt-0.5 opacity-80 group-hover:text-primary/80 transition-colors">
          One Room · Live Signal
        </span>
      </div>
    </div>
  );
}
