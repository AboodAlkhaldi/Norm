"use client";

import type { CSSProperties, ReactNode } from "react";
import type { MediaAsset, TileFormat } from "@/content/types";
import { Carousel } from "@/components/carousel/Carousel";
import { CarouselArrows } from "@/components/carousel/CarouselArrows";
import { Media } from "@/components/media/Media";
import { MediaReveal, Reveal } from "@/components/motion/Reveal";
import { TILE_WIDTH, fluid, tileSizes, tileStyle } from "@/components/media/tiles";

/** Default box sizes (Studio Size order); repeats for longer lists. */
const FORMATS: TileFormat[] = ["portrait", "tall", "landscape", "portrait"];

/**
 * Media rail with arrows underneath and up to two paragraphs (Studio Size
 * slider_with_text): the rail starts on the text margin, tiles share one height
 * in three box sizes, and the paragraphs line up with the 2nd tile.
 */
export function ImageStrip({
  items,
  paragraphs,
  action,
  label,
  className = "",
  formats = FORMATS,
  priority = 0,
}: {
  items: (MediaAsset | ReactNode)[];
  paragraphs?: string[];
  action?: ReactNode;
  label: string;
  className?: string;
  /** Box size per tile (repeats). */
  formats?: TileFormat[];
  /** Load the first N tiles immediately (strip above the fold, e.g. About). */
  priority?: number;
}) {
  return (
    <section className={className} aria-label={label}>
      <Carousel
        label={label}
        footer={
          <div
            className="mt-title-gap grid gap-y-6 px-gutter md:grid-cols-[var(--col)_var(--col)_1fr]"
            // Paragraph columns start where the 2nd and 3rd 4:5 tiles start (tile + rail gap).
            style={{ "--col": `calc(${fluid(TILE_WIDTH.portrait)} + var(--gap))` } as CSSProperties}
          >
            <div className="flex gap-[5px]">
              <CarouselArrows labels={["Previous image", "Next image"]} />
            </div>
            {paragraphs?.map((p, i) => (
              <Reveal key={i} delay={i * 0.1} className="md:pr-gap">
                <p className="text-lead">{p}</p>
                {i === 0 && action && <div className="mt-[clamp(24px,calc(34*var(--u)),44px)]">{action}</div>}
              </Reveal>
            ))}
          </div>
        }
      >
        {items.map((item, i) => {
          const format = formats[i % formats.length];
          const isAsset = !!item && typeof item === "object" && "kind" in (item as object);
          return (
            <MediaReveal
              key={i}
              delay={i * 0.08}
              className="shrink-0 rounded-media bg-surface"
            >
              <div style={tileStyle(format)} className="relative">
                {isAsset ? <Media media={item as MediaAsset} sizes={tileSizes(format)} priority={i < priority} /> : (item as ReactNode)}
              </div>
            </MediaReveal>
          );
        })}
      </Carousel>
    </section>
  );
}
