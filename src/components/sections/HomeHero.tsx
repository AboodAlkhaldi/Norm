"use client";

import { useRef, useState } from "react";
import { home } from "@/content/home";
import { HeroTitle } from "./HeroTitle";
import { VideoTile } from "@/components/media/VideoTile";
import { MediaReveal } from "@/components/motion/Reveal";
import { useShowreel } from "@/components/overlays/Showreel";

/**
 * Home hero: title with rotating word and the background reel. As on the AI site,
 * the whole reel opens the showreel; a centred "Play reel" pill appears on hover
 * (always visible on touch screens) and a small button pauses the background video.
 * The showreel grows out of this box (Studio Size).
 * Spacing = Studio Size at 1440: title at 182, reel at 445 (60px under the title's
 * line box; 69 here because the title's masks pull the box up by 0.12em).
 */
export function HomeHero() {
  const { open, warm, isOpen: reelOpen } = useShowreel();
  const { hero } = home;
  const box = useRef<HTMLDivElement>(null);
  const [bgPaused, setBgPaused] = useState(false);

  return (
    <section className="px-gutter pt-[clamp(112px,calc(182*var(--u)),240px)]">
      <HeroTitle lines={hero.lines} rotatingWords={hero.rotatingWords} />

      <MediaReveal immediate delay={0.5} className="mt-[clamp(36px,calc(69*var(--u)),92px)] aspect-[1340/754] w-full rounded-media max-md:aspect-[4/5]">
        <div ref={box} className="relative size-full">
          <VideoTile media={hero.background} mode="manual" active={!bgPaused && !reelOpen} priority sizes="100vw" className="size-full" />

          <button
            type="button"
            onClick={() => open(box.current)}
            onPointerEnter={warm}
            onFocus={warm}
            className="group absolute inset-0 cursor-pointer"
            aria-label={`${hero.playReel} — open the NORM showreel`}
          >
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 scale-[0.88] items-center h-btn gap-[14px] whitespace-nowrap rounded-full bg-fg px-btn-x text-ui font-medium uppercase text-bg opacity-0 transition-[opacity,scale] duration-300 ease-ui group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 [@media(hover:none)]:scale-100 [@media(hover:none)]:opacity-100"
            >
              <svg viewBox="0 0 12 14" className="size-3" aria-hidden="true">
                <path d="M0 0l12 7-12 7z" fill="currentColor" />
              </svg>
              {hero.playReel}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setBgPaused((p) => !p)}
            aria-pressed={bgPaused}
            aria-label={bgPaused ? "Play background video" : "Pause background video"}
            className="absolute bottom-[18px] right-[18px] z-[2] grid size-circle place-items-center rounded-full bg-pill/80 text-fg transition-colors duration-300 ease-ui hover:bg-black/70"
          >
            {bgPaused ? (
              <svg viewBox="0 0 12 14" className="ml-0.5 size-3" aria-hidden="true">
                <path d="M0 0l12 7-12 7z" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 12 14" className="size-3" aria-hidden="true">
                <path d="M1 0h3v14H1zM8 0h3v14H8z" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>
      </MediaReveal>
    </section>
  );
}
