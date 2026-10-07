import type { MediaAsset, ProjectBlock } from "@/content/types";
import { Media } from "@/components/media/Media";
import { MediaReveal, Reveal, RevealLines } from "@/components/motion/Reveal";

/** Aspect ratio style from the asset's own size (no layout shift). */
const ratio = (m: MediaAsset) => ({ aspectRatio: `${m.width} / ${m.height}` });

/**
 * Flexible project body (Figma "Posture"): works for video-led and image-led
 * projects. Each block type is one case below — add new types in content/types.ts.
 */
export function ProjectBlocks({ blocks }: { blocks: ProjectBlock[] }) {
  return (
    <div className="space-y-[clamp(64px,calc(120*var(--u)),160px)]">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "video":
            return (
              <figure key={i} className="px-gutter">
                <MediaReveal className="w-full rounded-[4px] bg-surface" style={ratio(block.media)}>
                  <Media media={block.media} sizes="100vw" />
                </MediaReveal>
                {block.caption && <figcaption className="mt-4 text-body text-muted">{block.caption}</figcaption>}
              </figure>
            );
          case "image": {
            // Figma: medium = 524px wide centred, large = 678px wide centred (portrait stills).
            const w = block.size === "large" ? 678 : 524;
            const portrait = block.media.height > block.media.width;
            return (
              <figure key={i} className="px-gutter">
                <MediaReveal
                  className="mx-auto rounded-[2px] bg-surface"
                  style={{ ...ratio(block.media), width: portrait ? `min(100%, calc(${w} * var(--u)))` : "100%" }}
                >
                  <Media media={block.media} sizes={portrait ? "50vw" : "100vw"} />
                </MediaReveal>
                {block.caption && <figcaption className="mt-4 text-body">{block.caption}</figcaption>}
              </figure>
            );
          }
          case "imagePair":
            return (
              <figure key={i} className="grid grid-cols-1 gap-gap px-gutter md:grid-cols-[calc(498*var(--u))_calc(442*var(--u))] md:items-end md:justify-between md:pl-[calc(126*var(--u))] md:pr-[calc(155*var(--u))]">
                {block.media.map((m, j) => (
                  <MediaReveal key={j} delay={j * 0.1} style={ratio(m)} className="w-full rounded-[2px] bg-surface">
                    <Media media={m} sizes="(min-width: 768px) 40vw, 100vw" />
                  </MediaReveal>
                ))}
                {block.caption && <figcaption className="text-body md:col-span-2">{block.caption}</figcaption>}
              </figure>
            );
          case "statement":
            return (
              <div key={i} className="px-gutter">
                <RevealLines as="p" className={block.size === "large" ? "text-list" : "text-title"}>
                  {block.text}
                </RevealLines>
              </div>
            );
          case "text":
            return (
              <Reveal key={i} className="px-gutter md:ml-[calc(462*var(--u))] md:max-w-[calc(700*var(--u))]">
                <p className="text-lead">{block.text}</p>
              </Reveal>
            );
          case "credits":
            return (
              <Reveal key={i} as="dl" className="mx-gutter grid gap-x-gap gap-y-4 border-t border-line pt-6 text-body sm:grid-cols-2 md:grid-cols-4">
                {block.items.map((c) => (
                  <div key={c.role + c.name}>
                    <dt className="text-muted">{c.role}</dt>
                    <dd className="mt-1 text-card">{c.name}</dd>
                  </div>
                ))}
              </Reveal>
            );
        }
      })}
    </div>
  );
}
