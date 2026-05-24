"use client";

import { useState } from "react";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { Card, CardContent, CardFooter, CardHeader } from "../card";
import { motion } from "motion/react";


type AuthProps = {
  onSubmit: (username: string, password: string) => Promise<void>;
};

const Auth = ({ onSubmit }: AuthProps) => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      await onSubmit(username, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="w-full"
    >
      <Card className="w-full border-border/80 bg-card/60 backdrop-blur-md shadow-2xl relative overflow-hidden">
        {/* Sleek top glow */}
        <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-primary/20 blur-2xl pointer-events-none" />

        <CardHeader className="pb-4 space-y-0">
          <div className="flex items-center gap-3">
            <div className="w-8.5 h-8.5 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
              <svg
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5"
                className="text-primary-foreground"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground font-sans">Join the chat</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                {"New here? We'll create your account automatically."}
              </p>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-sans">
                Username <span className="text-primary normal-case tracking-normal">*</span>
              </Label>
              <Input
                id="username" name="username" type="text"
                required autoComplete="username" autoFocus
                placeholder="your_handle" className="h-9.5 text-sm rounded-xl border-border/60 focus:ring-primary/30 transition-all font-sans bg-background/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-sans">
                Password <span className="text-primary normal-case tracking-normal">*</span>
              </Label>
              <Input
                id="password" name="password" type="password"
                required autoComplete="current-password"
                placeholder="••••••••" className="h-9.5 text-sm rounded-xl border-border/60 focus:ring-primary/30 transition-all font-sans bg-background/50"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2 font-sans"
              >
                {error}
              </motion.p>
            )}
          </CardContent>

          <CardFooter className="pt-2">
            <motion.div
              className="w-full"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit" disabled={pending}
                className="w-full h-9.5 text-sm font-semibold transition-all rounded-xl bg-primary text-primary-foreground hover:opacity-95 shadow-lg shadow-primary/10 cursor-pointer"
              >
                {pending ? (
                  <span className="flex items-center gap-2 justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Connecting…
                  </span>
                ) : (
                  "Enter chat"
                )}
              </Button>
            </motion.div>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export { Auth };