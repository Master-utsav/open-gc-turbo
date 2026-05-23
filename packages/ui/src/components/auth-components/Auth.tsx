"use client";

import { useState } from "react";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { Card, CardContent, CardFooter, CardHeader } from "../card";


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
    <Card className="w-full border-border/60">
      <CardHeader className="pb-4 space-y-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <svg
              width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5"
              className="text-primary-foreground"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Join the chat</p>
            <p className="text-xs text-muted-foreground">
              {"New here? We'll create your account automatically."}
            </p>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Username <span className="text-primary normal-case tracking-normal">*</span>
            </Label>
            <Input
              id="username" name="username" type="text"
              required autoComplete="username" autoFocus
              placeholder="your_handle" className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Password <span className="text-primary normal-case tracking-normal">*</span>
            </Label>
            <Input
              id="password" name="password" type="password"
              required autoComplete="current-password"
              placeholder="••••••••" className="h-9 text-sm"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {error}
            </p>
          )}
        </CardContent>

        <CardFooter className="pt-2">
          <Button
            type="submit" disabled={pending}
            className="w-full h-9 text-sm font-medium transition-all"
          >
            {pending ? (
              <span className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" className="animate-spin">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Connecting…
              </span>
            ) : (
              "Enter chat"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export { Auth };