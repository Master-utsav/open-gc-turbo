"use client";

import * as React from "react";
import { useState, useRef, KeyboardEvent } from "react";
import { cn } from "../../lib/utils";

interface GifResult {
  url: string;
  preview: string;
  title: string;
}

interface ChatInputProps {
  onSend: (content: string, msgType: "TEXT" | "GIF") => void;
  disabled?: boolean;
  placeholder?: string;
  searchGifs: (x: string) => Promise<GifResult[] | []>;
}


const ChatInput = ({
  onSend,
  disabled = false,
  placeholder = "Message…",
  searchGifs
}: ChatInputProps) => {
  const [value, setValue]       = useState("");
  const [showGif, setShowGif]   = useState(false);
  const [gifQuery, setGifQuery] = useState("");
  const [gifs, setGifs]         = useState<GifResult[]>([]);
  const [gifLoading, setGifLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gifSearchRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed, "TEXT");
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }

  function handleGifSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setGifQuery(q);
    clearTimeout(gifSearchRef.current);
    if (!q.trim()) { setGifs([]); return; }
    setGifLoading(true);
    gifSearchRef.current = setTimeout(async () => {
      const results = await searchGifs(q);
      setGifs(results);
      setGifLoading(false);
    }, 400);
  }

  function sendGif(gif: GifResult) {
    onSend(gif.url, "GIF");
    setShowGif(false);
    setGifQuery("");
    setGifs([]);
  }

  return (
    <div className="relative">
      {/* GIF picker panel */}
      {showGif && (
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
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                Searching…
              </div>
            )}
            {!gifLoading && gifs.length === 0 && gifQuery && (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                No GIFs found
              </div>
            )}
            {!gifLoading && gifs.length === 0 && !gifQuery && (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                Search for a GIF to send
              </div>
            )}
            <div className="grid grid-cols-3 gap-1.5">
              {gifs.map((gif, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => sendGif(gif)}
                  className="aspect-video overflow-hidden rounded-lg hover:ring-2 hover:ring-primary transition-all"
                >
                  <img
                    src={gif.preview}
                    alt={gif.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-end gap-2 px-4 py-3 border-t border-border/40 bg-background">
        {/* GIF toggle button */}
        <button
          type="button"
          onClick={() => setShowGif((v) => !v)}
          disabled={disabled}
          aria-label="Send GIF"
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold tracking-tight",
            "border border-border/60 transition-all hover:scale-105 active:scale-95",
            showGif
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted text-muted-foreground hover:text-foreground",
            "disabled:opacity-40 disabled:pointer-events-none"
          )}
        >
          GIF
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleInput}
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

        {/* Send button */}
        <button
          type="button"
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className={cn(
            "w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0",
            "transition-all hover:scale-105 active:scale-95",
            "disabled:opacity-40 disabled:pointer-events-none"
          )}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5"
            className="text-primary-foreground translate-x-px">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export { ChatInput };