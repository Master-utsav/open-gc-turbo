
function ExpiredBadge({ kind }: { kind?: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 bg-muted rounded-2xl text-xs text-muted-foreground italic">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      {kind === "video" ? "Video" : "Photo"} expired
    </div>
  );
}

export {ExpiredBadge}
