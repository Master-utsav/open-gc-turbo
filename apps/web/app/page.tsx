import { cookies } from "next/headers";
import ChatRoom from "../components/ChatRoom";
import AuthForm from "../components/AuthForm";
import LandingWrapper from "../components/LandingWrapper";
import BrandLogo from "../components/BrandLogo";
import ThemeToggle from "../components/ThemeToggle";
import LeftShowcase from "../components/LeftShowcase";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("chat_token")?.value;
  const username = cookieStore.get("chat_username")?.value;

  if (token && username) {
    return <ChatRoom token={token} username={username} />;
  }

  return (
    <div className="min-h-screen w-full bg-background overflow-hidden relative flex flex-col md:flex-row font-sans">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Primary glow top-left */}
      <div className="absolute -top-40 -left-40 w-35rem h-35rem rounded-full bg-primary/20 dark:bg-primary/10 blur-[100px] pointer-events-none transition-colors duration-500" />

      {/* Accent glow bottom-right */}
      <div className="absolute -bottom-40 -right-40 w-35rem h-35rem rounded-full bg-primary/20 dark:bg-primary/10 blur-[100px] pointer-events-none transition-colors duration-500" />

      {/* Top Header - Logo and Theme Toggle */}
      <header className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-16 py-6">
        <BrandLogo />
        <ThemeToggle />
      </header>

      {/* Left Column (Branding & Showcase) - visible on md+ */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-center px-12 lg:px-20 relative z-20 min-h-screen select-none border-r border-border/20">
        <LeftShowcase />
      </div>

      {/* Right Column (Auth Panel) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-20 min-h-screen bg-linear-to-b md:bg-linear-to-r from-transparent to-card/5 backdrop-blur-[1px]">
        {/* On mobile, we show a space at the top to clear the absolute brand header */}
        <div className="w-full max-w-sm flex flex-col items-center mt-16 md:mt-0">
          <LandingWrapper>
            <AuthForm />
          </LandingWrapper>
          
          {/* Subtle mobile-only sub-branding or footer info */}
          <div className="mt-8 text-center md:hidden space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              One room. Everyone&apos;s in it. Just pure signal.
            </p>
            <div className="flex items-center justify-center gap-3">
              {[
                { label: "Unified", value: "Global" },
                { label: "Latency", value: "Realtime" },
                { label: "Signal", value: "Pure" },
              ].map(({ label, value }) => (
                <div key={label} className="text-center px-2 border-r last:border-0 border-border/50">
                  <span className="block text-[8px] font-bold font-mono text-muted-foreground uppercase tracking-widest">{label}</span>
                  <span className="text-[10px] font-semibold text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Credit Footer */}
          <footer className="mt-10 text-center space-y-3.5 font-sans relative z-30 select-none">
            <div className="flex flex-col items-center gap-1 text-[11px] text-muted-foreground/80">
              <div className="flex items-center gap-1.5 font-medium">
                <span>Designed & Developed by</span>
                <a 
                  href="https://www.masterutsav.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary font-bold hover:underline transition-all hover:text-primary/95 inline-flex items-center gap-0.5"
                >
                  master_utsav
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="translate-y-[-0.5px] text-primary">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>
                  </svg>
                </a>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground/50 font-mono">
              <a 
                href="https://github.com/Master-utsav/open-gc-turbo" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1.5 hover:text-foreground transition-all duration-200"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
                GitHub Codebase
              </a>
              <span>·</span>
              <span>v1.2.0</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";