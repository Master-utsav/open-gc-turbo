"use client";

import { useState } from "react";
import { Button } from "../button";
import { Card } from "../card";
import { motion, Variants } from "motion/react";

export type User = {
  id: number | string;
  email: string;
  name?: string | null;
  about?: string | null;
  createdAt: Date;
};

type UserListProps = {
  fetchUsers: () => Promise<User[]>;
};

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const hues = [
  "bg-red-500/10 text-red-500 border border-red-500/20",
  "bg-orange-500/10 text-orange-500 border border-orange-500/20",
  "bg-rose-500/10 text-rose-500 border border-rose-500/20",
  "bg-pink-500/10 text-pink-500 border border-pink-500/20",
  "bg-purple-500/10 text-purple-500 border border-purple-500/20",
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 220, damping: 22 }
  },
};

function UserList({ fetchUsers }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function handleFetch() {
    setLoading(true);
    const data = await fetchUsers();
    setUsers(data);
    setLoading(false);
    setLoaded(true);
  }

  return (
    <div className="w-full max-w-md space-y-4 font-sans">
      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={handleFetch}
          disabled={loading}
          variant="outline"
          className="w-full h-10 text-sm font-semibold rounded-xl border-border/80 hover:bg-muted cursor-pointer transition-colors shadow-sm"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Loading...
            </span>
          ) : loaded ? (
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>
              </svg>
              Refresh Members
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              View Space Members
            </span>
          )}
        </Button>
      </motion.div>

      {loaded && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Space Members
            </p>
            <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/10 px-2 py-0.5 rounded-full">
              {users.length} total
            </span>
          </div>

          {users.length === 0 ? (
            <Card className="p-10 flex flex-col items-center gap-2 border-dashed border-border/60 rounded-xl bg-muted/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/60">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              </svg>
              <p className="text-sm text-muted-foreground">No users found</p>
            </Card>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="divide-y divide-border/40 rounded-xl border border-border/80 bg-card overflow-hidden shadow-lg"
            >
              {users.map((user, i) => (
                <motion.div
                  variants={itemVariants}
                  key={user.id}
                  className="flex items-center gap-3.5 px-4 py-3 hover:bg-muted/40 transition-colors"
                >
                  <div
                    className={`w-9.5 h-9.5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${hues[i % hues.length]}`}
                  >
                    {getInitials(user.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {user.name ?? "Unnamed user"}
                      </p>

                      <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                        {timeAgo(user.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground/80 truncate mt-0.5 font-sans">
                      {user.email}
                    </p>

                    {user.about && (
                      <p className="text-xs text-muted-foreground/60 truncate mt-1 italic font-sans pl-1.5 border-l border-border/60">
                        {user.about}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

export { UserList };