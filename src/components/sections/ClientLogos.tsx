"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Client } from "@/content/types";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

/** One full loop at normal speed (seconds) and the speed while hovered (share of normal). */
const LOOP = 48;
const HOVER_SPEED = 0.25;

/**
 * Client logo row: a slow continuous drift (AI site). Hovering eases the drift down
 * to a quarter speed instead of stopping it (owner), and leaving eases it back up.
 * Static, wrapping row under reduced motion.
 */
export function ClientLogos({ clients, className = "" }: { clients: Client[]; className?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const loop = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;
    const tween = gsap.fromTo(el, { xPercent: 0 }, { xPercent: -50, duration: LOOP, ease: "none", repeat: -1 });
    loop.current = tween;
    // Don't spend frames on it while it is off screen.
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tween.resume() : tween.pause()));
    io.observe(el);
    return () => {
      io.disconnect();
      tween.kill();
      loop.current = null;
    };
  }, []);

  const speed = (s: number) => {
    if (loop.current) gsap.to(loop.current, { timeScale: s, duration: 0.8, ease: "ui", overwrite: true });
  };

  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center gap-[clamp(40px,calc(96*var(--u)),128px)] pr-[clamp(40px,calc(96*var(--u)),128px)]" aria-hidden={hidden || undefined}>
      {clients.map((c) => (
        <li key={c.name} className="shrink-0 opacity-60 transition-opacity duration-300 ease-ui hover:opacity-100">
          <Image
            src={c.logo.src}
            alt={hidden ? "" : c.logo.alt}
            width={c.logo.width}
            height={c.logo.height}
            className="h-[clamp(24px,calc(36*var(--u)),44px)] w-auto"
          />
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label="Clients" className={`overflow-hidden ${className}`} onPointerEnter={() => speed(HOVER_SPEED)} onPointerLeave={() => speed(1)}>
      <div ref={track} className="flex w-max will-change-transform motion-reduce:w-auto motion-reduce:flex-wrap motion-reduce:px-gutter">
        {row(false)}
        <div className="contents motion-reduce:hidden">{row(true)}</div>
      </div>
    </section>
  );
}
