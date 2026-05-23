"use client";

import { useState } from "react";
import { Button } from "../button";
import { Card } from "../card";

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
  "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
  "bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-200",
];

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
    <div className="w-full max-w-md space-y-3">
      <Button
        onClick={handleFetch}
        disabled={loading}
        variant="outline"
        className="w-full h-9 text-sm"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Loading...
          </span>
        ) : loaded ? (
          <span className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>
            </svg>
            Refresh
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            View users
          </span>
        )}
      </Button>

      {loaded && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Members
            </p>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {users.length}
            </span>
          </div>

          {users.length === 0 ? (
            <Card className="p-10 flex flex-col items-center gap-2 border-dashed">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              </svg>
              <p className="text-sm text-muted-foreground">No users yet</p>
            </Card>
          ) : (
            <div className="divide-y rounded-xl border bg-background overflow-hidden">
                {users.map((user, i) => (
                    <div
                    key={user.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent/40 transition-colors"
                    >
                    <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${hues[i % hues.length]}`}
                    >
                        {getInitials(user.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground truncate">
                            {user.name ?? "Unnamed user"}
                        </p>

                        <span className="text-xs text-muted-foreground shrink-0">
                            {timeAgo(user.createdAt)}
                        </span>
                        </div>

                        <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                        </p>

                        {user.about && (
                        <p className="text-xs text-muted-foreground/70 truncate mt-0.5 italic">
                            {user.about}
                        </p>
                        )}
                    </div>
                    </div>
                ))}
                </div>
          )}
        </div>
      )}
    </div>
  );
}

export { UserList };