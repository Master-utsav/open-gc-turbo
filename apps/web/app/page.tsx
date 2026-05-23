import { cookies } from "next/headers";
import ChatRoom from "../components/ChatRoom";
import AuthForm from "../components/AuthForm";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("chat_token")?.value;
  const username = cookieStore.get("chat_username")?.value;

  if (token && username) {
    return <ChatRoom token={token} username={username} />;
  }

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center px-4 relative overflow-hidden">

      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
        }}
      />

      {/* Primary glow top-left */}
      <div className="absolute -top-40 -left-40 w-[28rem] h-[28rem] rounded-full bg-primary/20 dark:bg-primary/10 blur-3xl pointer-events-none" />

      {/* Accent glow bottom-right */}
      <div className="absolute -bottom-40 -right-40 w-[28rem] h-[28rem] rounded-full bg-accent/40 dark:bg-accent/20 blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card/80 backdrop-blur-md shadow-2xl p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Live pill */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
            live
          </span>
        </div>

        {/* Title block */}
        <div className="space-y-3">
          <div className="space-y-1">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground leading-none">
              open
              <span className="text-primary">.</span>
              global
              <span className="text-primary">.</span>
              chat
            </h1>
            <div className="h-px w-12 bg-primary rounded-full" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            One room.{" "}
            <span className="text-foreground font-medium">Everyone&apos;s in it.</span>
            {" "}No threads. No channels. Just signal.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Room", value: "Global" },
            { label: "History", value: "Live" },
            { label: "Auth", value: "Simple" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg bg-muted/60 border border-border px-3 py-2 space-y-0.5"
            >
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                {label}
              </p>
              <p className="text-xs font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            enter
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Auth form */}
        <AuthForm />

        {/* Footer */}
        <p className="text-center text-[11px] text-muted-foreground/60 font-mono">
          open-gc · built by{" "}
          <span className="text-primary">masterutsav</span>
        </p>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";