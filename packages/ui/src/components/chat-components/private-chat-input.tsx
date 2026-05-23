"use client";

import * as React from "react";
import { useState, useRef, KeyboardEvent } from "react";
import { cn } from "../../lib/utils";
import { Input } from "../input";

// ── Types ─────────────────────────────────────────────────────────────────────

interface GifResult {
  url:     string;
  preview: string;
  title:   string;
}

interface PrivateChatInputProps {
  onSendText:  (content: string, msgType?: "TEXT" | "GIF") => void;
  onSendMedia: (file: File, mediaKind: "picture" | "video") => Promise<void>;
  searchGifs:  (query: string) => Promise<GifResult[]>;
  disabled?:   boolean;
  placeholder?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

function PrivateChatInput({
  onSendText,
  onSendMedia,
  searchGifs,
  disabled    = false,
  placeholder = "Message…",
}: PrivateChatInputProps) {
  const [value, setValue]       = useState("");
  const [panel, setPanel]       = useState<"none" | "gif" | "media">("none");
  const [gifQuery, setGifQuery] = useState("");
  const [gifs, setGifs]         = useState<GifResult[]>([]);
  const [gifLoading, setGifLoading]     = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{
    url:  string;
    kind: "picture" | "video";
    file: File;
  } | null>(null);

  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gifTimer     = useRef<ReturnType<typeof setTimeout>>(undefined);

  // ── Text ──────────────────────────────────────────────────────────────────

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSendText(trimmed, "TEXT");
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  }

  function handleTextInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }

  // ── GIF ───────────────────────────────────────────────────────────────────

  function handleGifSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setGifQuery(q);
    clearTimeout(gifTimer.current);
    if (!q.trim()) { setGifs([]); return; }
    setGifLoading(true);
    gifTimer.current = setTimeout(async () => {
      const results = await searchGifs(q);
      setGifs(results);
      setGifLoading(false);
    }, 400);
  }

  function sendGif(gif: GifResult) {
    onSendText(gif.url, "GIF");
    setPanel("none");
    setGifQuery("");
    setGifs([]);
  }

  // ── File picker ───────────────────────────────────────────────────────────

  function openFilePicker() { fileInputRef.current?.click(); }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const isVideo   = file.type.startsWith("video/");
    const isPicture = file.type.startsWith("image/");
    if (!isVideo && !isPicture) return;

    const kind: "picture" | "video" = isVideo ? "video" : "picture";

    if (isVideo) {
      const tempUrl = URL.createObjectURL(file);
      const vidEl   = document.createElement("video");
      vidEl.preload = "metadata";
      vidEl.src     = tempUrl;
      await new Promise<void>((res) => { vidEl.onloadedmetadata = () => res(); });
      URL.revokeObjectURL(tempUrl);
      if (vidEl.duration > 10) {
        alert("Video must be 10 seconds or shorter.");
        return;
      }
    }

    const previewUrl = URL.createObjectURL(file);
    setMediaPreview({ url: previewUrl, kind, file });
    setPanel("media");
  }

  async function confirmSendMedia() {
    if (!mediaPreview || uploading) return;
    setUploading(true);
    try {
      await onSendMedia(mediaPreview.file, mediaPreview.kind);
      URL.revokeObjectURL(mediaPreview.url);
      setMediaPreview(null);
      setPanel("none");
    } finally {
      setUploading(false);
    }
  }

  function cancelMedia() {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview.url);
    setMediaPreview(null);
    setPanel("none");
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative">

      {/* GIF panel */}
      {panel === "gif" && (
        <div className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-background border border-border/60 rounded-2xl shadow-lg overflow-hidden z-20">
          <div className="p-2 border-b border-border/40">
            <input
              autoFocus
              value={gifQuery}
              onChange={handleGifSearch}
              placeholder="Search GIFs…"
              className="w-full bg-muted rounded-xl px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60"
            />
          </div>
          <div className="h-48 overflow-y-auto p-2">
            {gifLoading && (
              <p className="text-xs text-muted-foreground text-center mt-16">Searching…</p>
            )}
            {!gifLoading && gifs.length === 0 && (
              <p className="text-xs text-muted-foreground text-center mt-16">
                {gifQuery ? "No GIFs found" : "Search for a GIF to send"}
              </p>
            )}
            <div className="grid grid-cols-3 gap-1.5">
              {gifs.map((gif, i) => (
                <button key={i} type="button" onClick={() => sendGif(gif)}
                  className="aspect-video overflow-hidden rounded-lg hover:ring-2 hover:ring-primary transition-all">
                  <img src={gif.preview} alt={gif.title} className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Media preview panel */}
      {panel === "media" && mediaPreview && (
        <div className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-background border border-border/60 rounded-2xl shadow-lg overflow-hidden z-20 p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
            {mediaPreview.kind === "video" ? "10s Video" : "Picture"} · disappears after viewing
          </p>

          <div className="rounded-xl overflow-hidden bg-muted mb-3 max-h-48 flex items-center justify-center">
            {mediaPreview.kind === "picture" ? (
              <img src={mediaPreview.url} alt="preview" className="max-h-48 object-contain w-full" />
            ) : (
              <video src={mediaPreview.url} controls className="max-h-48 w-full" />
            )}
          </div>

          <div className="flex gap-2">
            <button onClick={cancelMedia}
              className="flex-1 h-8 rounded-xl border border-border/60 text-xs font-medium text-muted-foreground hover:bg-muted transition-all">
              Cancel
            </button>
            <button onClick={confirmSendMedia} disabled={uploading}
              className="flex-1 h-8 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
              {uploading ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      )}

      {/* Hidden native file input — NOT shadcn Input which can't be ref'd for .click() */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Input bar */}
      <div className="flex items-end gap-2 px-4 py-3 border-t border-border/40 bg-background">

        <button type="button" onClick={() => setPanel(panel === "gif" ? "none" : "gif")}
          disabled={disabled}
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
            "text-[10px] font-bold tracking-tight border transition-all hover:scale-105 active:scale-95",
            panel === "gif"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted text-muted-foreground border-border/60 hover:text-foreground",
            "disabled:opacity-40 disabled:pointer-events-none"
          )}>
          GIF
        </button>

        <button type="button" onClick={openFilePicker} disabled={disabled}
          aria-label="Send photo or video"
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
            "bg-muted border border-border/60 text-muted-foreground",
            "hover:text-foreground hover:scale-105 active:scale-95 transition-all",
            "disabled:opacity-40 disabled:pointer-events-none"
          )}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleTextInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "flex-1 resize-none bg-muted rounded-2xl px-4 py-2.5 text-sm leading-snug",
            "outline-none focus:ring-2 focus:ring-primary/40 transition-all",
            "placeholder:text-muted-foreground/60 max-h-30 overflow-y-auto",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        />

        <button type="button" onClick={submit} disabled={disabled || !value.trim()}
          aria-label="Send message"
          className={cn(
            "w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0",
            "transition-all hover:scale-105 active:scale-95",
            "disabled:opacity-40 disabled:pointer-events-none"
          )}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" className="text-primary-foreground translate-x-px">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export { PrivateChatInput };
export type { PrivateChatInputProps, GifResult };