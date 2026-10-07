import type { MediaAsset } from "@/content/types";
import { Media } from "@/components/media/Media";
import { MediaReveal, Reveal, RevealLines } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { KineticType } from "./KineticType";

export type NumberedRow = {
  id?: string;
  title: string;
  description: string;
  tags: string[];
  media: MediaAsset;
  kinetic?: { lines: [string, string] };
};

/**
 * Numbered rows 01–0n with text on the left and media on the right, separated by
 * thin dividers (Figma: Services and Why NORM). Media sizes alternate as in Figma:
 * 630 × 394 wide frames, with the last row a narrower portrait-friendly frame.
 */
export function NumberedRows({
  rows,
  button,
  className = "",
}: {
  rows: NumberedRow[];
  button?: { label: string; href: string };
  className?: string;
}) {
  return (
    <ol className={className}>
      {rows.map((row, i) => (
        <li
          key={row.id ?? row.title}
          id={row.id}
          className="mx-gutter grid scroll-mt-32 gap-8 border-t border-line pb-[clamp(64px,calc(160*var(--u)),200px)] pt-[clamp(28px,calc(40*var(--u)),56px)] md:grid-cols-[1fr_calc(630*var(--u))] md:gap-x-gap"
        >
          <div className="md:max-w-[calc(560*var(--u))]">
            <Reveal>
              <p className="text-body text-muted">{String(i + 1).padStart(2, "0")}</p>
            </Reveal>
            <RevealLines as="h2" className="mt-[clamp(16px,calc(26*var(--u)),32px)] text-title">
              {row.title}
            </RevealLines>
            <Reveal className="mt-[clamp(16px,calc(24*var(--u)),32px)]">
              <p className="text-lead">{row.description}</p>
              <p className="mt-[clamp(16px,calc(24*var(--u)),32px)] text-body text-muted">{row.tags.join(" · ")}</p>
              {button && (
                <ButtonLink href={button.href} className="mt-[clamp(20px,calc(26*var(--u)),32px)]">
                  {button.label}
                </ButtonLink>
              )}
            </Reveal>
          </div>
          <MediaReveal className="aspect-[630/394] w-full rounded-[4px] bg-surface">
            {row.kinetic ? <KineticType lines={row.kinetic.lines} /> : <Media media={row.media} sizes="(min-width: 768px) 45vw, 100vw" />}
          </MediaReveal>
        </li>
      ))}
    </ol>
  );
}
