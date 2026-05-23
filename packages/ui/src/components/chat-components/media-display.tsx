"use client";

import Image from "next/image";
import { Expand } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../dialog";

import { ExpiredBadge } from "./expiry-badge";

function MediaDisplay({
  src,
  kind,
  seconds,
  display_sec: DISPLAY_SECONDS,
}: {
  src: string;
  kind?: string;
  seconds: number;
  display_sec: number;
}) {
  const [expired, setExpired] = useState(false);

  // ───────────────────────────────────────────────────────────
  // Expire locally
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (seconds <= 0) {
      setExpired(true);
    }
  }, [seconds]);

  // ───────────────────────────────────────────────────────────
  // Expired state
  // ───────────────────────────────────────────────────────────

  if (expired) {
    return <ExpiredBadge kind={kind} />;
  }

  // ───────────────────────────────────────────────────────────
  // Active state
  // ───────────────────────────────────────────────────────────

  return (
    <Dialog>
      <div className="relative rounded-2xl overflow-hidden max-w-55 group">
        
        {/* Expand button */}
        <DialogTrigger asChild>
          <button
            className="
              absolute top-2 right-2 z-20
              bg-black/60 hover:bg-black/80
              text-white p-1.5 rounded-full
              opacity-0 group-hover:opacity-100
              transition-opacity duration-200
              cursor-pointer
            "
          >
            <Expand className="w-4 h-4" />
          </button>
        </DialogTrigger>

        {/* Thumbnail */}
        {kind === "picture" ? (
          <Image
            src={src}
            alt="media"
            width={220}
            height={200}
            unoptimized
            className="
              w-full
              max-h-50
              object-cover
              select-none
            "
          />
        ) : (
          <video
            src={src}
            autoPlay
            muted
            playsInline
            loop
            className="
              w-full
              max-h-50
              object-cover
            "
          />
        )}

        {/* Timer */}
        <div className="absolute bottom-1.5 right-1.5 z-10 bg-black/60 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-full">
          {seconds}s
        </div>

        {/* Progress */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 z-10">
          <div
            className="h-full bg-white/70 transition-all duration-1000 ease-linear"
            style={{
              width: `${(seconds / DISPLAY_SECONDS) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Viewer */}
      <DialogContent
        className="
          max-w-7xl
          w-full
          h-[80vh]
          p-0
          gap-0
          overflow-hidden
          bg-background
          border
        "
      >
        {/* Header */}
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="text-sm font-medium">
            {kind === "picture" ? "Photo Viewer" : "Video Viewer"}
          </DialogTitle>
        </DialogHeader>

        {/* Scroll Container */}
        <div
          className="
            flex-1
            overflow-x-auto
            overflow-y-auto
            p-4
          "
        >
          <div
            className="
              min-w-full
              min-h-full
              flex
              items-start
              justify-start
            "
          >
            {kind === "picture" ? (
              <Image
                src={src}
                alt="fullscreen-media"
                width={4000}
                height={4000}
                unoptimized
                className="
                  w-auto
                  h-auto
                  object-contain
                  rounded-xl
                  select-none
                "
              />
            ) : (
              <video
                src={src}
                autoPlay
                controls
                playsInline
                disablePictureInPicture
                controlsList="nodownload noplaybackrate"
                onContextMenu={(e) => e.preventDefault()}
                className="
                  w-auto
                  h-auto
                  object-contain
                  select-none
                  rounded-xl
                "
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { MediaDisplay };