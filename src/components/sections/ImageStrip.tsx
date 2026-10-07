"use client";

import type { ReactNode } from "react";
import type { MediaAsset } from "@/content/types";
import { Carousel } from "@/components/carousel/Carousel";
import { CarouselArrows } from "@/components/carousel/CarouselArrows";
import { Media } from "@/components/media/Media";
import { MediaReveal, Reveal } from "@/components/motion/Reveal";

/** Default Figma tile widths at 1440 (Home strip); repeats for longer lists. */
const WIDTHS = [432, 360, 554, 432];

/**
 * Media strip with arrows underneath and up to two paragraphs aligned to the
 * 2nd and 3rd tile columns (Figma: Home "about" row, About hero, About perspectives).
 */
export function ImageStrip({
  items,
  paragraphs,
  action,
  label,
  className = "",
  tileHeight = 540,
  widths = WIDTHS,
  priority = 0,
}: {
  items: (MediaAsset | ReactNode)[];
  paragraphs?: string[];
  action?: ReactNode;
  label: string;
  className?: string;
  tileHeight?: number;
  /** Tile widths at 1440 (About uses 384 / 712 / …). */
  widths?: number[];
  /** Load the first N tiles immediately (strip above the fold, e.g. About). */
  priority?: number;
}) {
  return (
    <section className={className} aria-label={label}>
      <Carousel
        label={label}
        footer={
          <div className="mt-[clamp(24px,calc(62*var(--u)),80px)] grid gap-y-6 px-gutter md:grid-cols-[calc(458*var(--u))_calc(464*var(--u))_1fr]">
            <div className="flex gap-2">
              <CarouselArrows labels={["Previous image", "Next image"]} />
            </div>
            {paragraphs?.map((p, i) => (
              <Reveal key={i} delay={i * 0.1} className="md:pr-[calc(26*var(--u))]">
                <p className="text-lead">{p}</p>
                {i === 0 && action && <div className="mt-[clamp(24px,calc(34*var(--u)),44px)]">{action}</div>}
              </Reveal>
            ))}
          </div>
        }
      >
        {items.map((item, i) => {
          const w = widths[i % widths.length];
          const isAsset = !!item && typeof item === "object" && "kind" in (item as object);
          return (
            <MediaReveal
              key={i}
              delay={i * 0.08}
              className="shrink-0 rounded-[4px] bg-surface"
            >
              <div
                style={{
                  width: `clamp(${Math.round(w * 0.62)}px, calc(${w} * var(--u)), ${Math.round(w * 1.34)}px)`,
                  height: `clamp(${Math.round(tileHeight * 0.62)}px, calc(${tileHeight} * var(--u)), ${Math.round(tileHeight * 1.34)}px)`,
                }}
                className="relative"
              >
                {isAsset ? <Media media={item as MediaAsset} sizes="40vw" priority={i < priority} /> : (item as ReactNode)}
              </div>
            </MediaReveal>
          );
        })}
      </Carousel>
    </section>
  );
}
