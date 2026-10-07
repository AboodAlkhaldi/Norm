"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type SyntheticEvent } from "react";
import type { VideoAsset } from "@/content/types";
import { useReducedMotion } from "@/lib/useReducedMotion";

export type VideoMode =
  /** Plays while on screen, pauses off screen (backgrounds, project pages). */
  | "inview"
  /** Plays while the pointer is over the closest [data-hover-root] (cards). Falls back to "inview" on touch. */
  | "hover"
  /** Parent decides through `active`. */
  | "manual";

type Props = {
  media: VideoAsset;
  mode?: VideoMode;
  /** For mode="manual". */
  active?: boolean;
  className?: string;
  /** Poster `sizes` hint for next/image. */
  sizes?: string;
  /** Load the poster eagerly (above the fold). */
  priority?: boolean;
  fit?: "cover" | "contain";
  muted?: boolean;
  loop?: boolean;
  /** Override the video source (e.g. showreel quality choice). */
  src?: string;
  /** Attach the source immediately instead of waiting for the viewport. */
  eager?: boolean;
  /** Preload hint once attached (default "metadata"). */
  preload?: "none" | "metadata" | "auto";
  /** Play even under reduced motion (explicit user action, e.g. showreel). */
  allowWithReducedMotion?: boolean;
  /** Only play while on screen (default). Off for full-screen players. */
  requireInView?: boolean;
  /** Receives the <video> element (for custom controls). */
  videoRef?: (el: HTMLVideoElement | null) => void;
  onTimeUpdate?: (e: SyntheticEvent<HTMLVideoElement>) => void;
  onLoadedMetadata?: (e: SyntheticEvent<HTMLVideoElement>) => void;
  onWaiting?: () => void;
  onPlaying?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
};

/**
 * The one video component used across the site (MOTION.md §6):
 * muted, looping, playsInline, poster, lazy-attached via IntersectionObserver,
 * paused off screen, poster-only under reduced motion.
 */
export function VideoTile({
  media,
  mode = "inview",
  active = false,
  className = "",
  sizes = "(min-width: 768px) 50vw, 100vw",
  priority = false,
  fit = "cover",
  muted = true,
  loop = true,
  src,
  eager = false,
  preload = "metadata",
  allowWithReducedMotion = false,
  requireInView = true,
  videoRef,
  onTimeUpdate,
  onLoadedMetadata,
  onWaiting,
  onPlaying,
  onPause,
  onEnded,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const reduced = useReducedMotion();
  const disabled = reduced && !allowWithReducedMotion;

  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [everActive, setEverActive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const canHover = useCanHover();
  const pageVisible = usePageVisible();

  /*
   * When to load the file (performance — decoding is the main cost on this site):
   * - "inview" (and "hover" on touch screens): when the tile gets near the viewport;
   * - "hover": on the first hover / focus;
   * - "manual": the first time the parent activates it.
   */
  if (mode === "manual" && active && !everActive) setEverActive(true);
  const attached =
    eager ||
    (near && (mode === "inview" || (mode === "hover" && !canHover))) ||
    (mode === "hover" && hovered) ||
    (mode === "manual" && everActive);

  // Near-viewport + in-view tracking.
  useEffect(() => {
    const el = wrap.current;
    if (!el || disabled) return;
    const nearIo = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          nearIo.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    const visible = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.15 });
    nearIo.observe(el);
    visible.observe(el);
    return () => {
      nearIo.disconnect();
      visible.disconnect();
    };
  }, [disabled]);

  // Hover root (the card).
  useEffect(() => {
    if (mode !== "hover" || !canHover) return;
    const root = (wrap.current?.closest("[data-hover-root]") as HTMLElement | null) ?? wrap.current;
    if (!root) return;
    const enter = () => setHovered(true);
    const leave = () => setHovered(false);
    root.addEventListener("pointerenter", enter);
    root.addEventListener("pointerleave", leave);
    root.addEventListener("focusin", enter);
    root.addEventListener("focusout", leave);
    return () => {
      root.removeEventListener("pointerenter", enter);
      root.removeEventListener("pointerleave", leave);
      root.removeEventListener("focusin", enter);
      root.removeEventListener("focusout", leave);
    };
  }, [mode, canHover]);

  const shouldPlay =
    !disabled &&
    attached &&
    pageVisible &&
    (inView || !requireInView) &&
    (mode === "inview" || (mode === "hover" && (hovered || !canHover)) || (mode === "manual" && active));

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (shouldPlay) {
      const p = v.play();
      if (p) p.catch(() => setPlaying(false));
    } else if (!v.paused) {
      v.pause();
      if (mode === "hover") v.currentTime = 0;
    }
  }, [shouldPlay, mode]);

  const setRefs = (el: HTMLVideoElement | null) => {
    video.current = el;
    videoRef?.(el);
  };

  const objectFit = fit === "cover" ? "object-cover" : "object-contain";

  return (
    <div ref={wrap} className={`relative overflow-hidden ${className}`} role="img" aria-label={media.alt}>
      {!disabled && (
        <video
          ref={setRefs}
          className={`absolute inset-0 size-full ${objectFit}`}
          src={attached ? (src ?? media.src) : undefined}
          poster={media.poster}
          muted={muted}
          loop={loop}
          playsInline
          preload={attached ? preload : "none"}
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
          onPlaying={() => {
            setPlaying(true);
            onPlaying?.();
          }}
          onPause={() => {
            setPlaying(false);
            onPause?.();
          }}
          onWaiting={onWaiting}
          onEnded={onEnded}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
        />
      )}
      {/* Poster on top; fades out once the video is actually playing (no black flash). */}
      <Image
        src={media.poster}
        alt=""
        aria-hidden="true"
        fill
        sizes={sizes}
        priority={priority}
        className={`${objectFit} transition-opacity duration-300 ease-in-out ${playing ? "opacity-0" : "opacity-100"}`}
      />
    </div>
  );
}

/** False while the browser tab is hidden — videos pause to save work. */
function usePageVisible() {
  return useSyncExternalStore(
    (cb) => {
      document.addEventListener("visibilitychange", cb);
      return () => document.removeEventListener("visibilitychange", cb);
    },
    () => document.visibilityState === "visible",
    () => true,
  );
}

const HOVER = "(hover: hover)";
function useCanHover() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(HOVER);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(HOVER).matches,
    () => true,
  );
}
