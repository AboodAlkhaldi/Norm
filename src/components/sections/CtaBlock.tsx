import type { MediaAsset } from "@/content/types";
import { ButtonLink } from "@/components/ui/Button";
import { Media } from "@/components/media/Media";
import { RevealLines, Reveal, MediaReveal } from "@/components/motion/Reveal";
import { AppLink } from "@/components/ui/AppLink";

type Props = {
  /** One string, or one string per line (Figma line breaks). */
  title: string | string[];
  text?: string;
  button: { label: string; href: string };
  className?: string;
};

/**
 * CTA blocks.
 * - "surface": grey 16:9 block, centred title + black pill (Figma: Portfolio / About / Contact)
 * - "media": 16:9 block over a video, centred display title; the whole block links (AI site: Home)
 * - "plain": left-aligned display title on black + outline pill (Figma: Services / Why NORM)
 */
const lines = (t: string | string[]) =>
  (Array.isArray(t) ? t : [t]).map((l) => (
    <span key={l} className="block">
      {l}
    </span>
  ));

export function CtaBlock({ variant = "surface", media, ...p }: Props & { variant?: "surface" | "media" | "plain"; media?: MediaAsset }) {
  const label = Array.isArray(p.title) ? p.title.join(" ") : p.title;
  if (variant === "plain") {
    return (
      <section className={`px-gutter ${p.className ?? ""}`}>
        <RevealLines as="h2" className="text-display">
          {lines(p.title)}
        </RevealLines>
        <Reveal className="mt-[clamp(12px,calc(18*var(--u)),24px)]">
          {p.text && <p className="text-lead">{p.text}</p>}
          <ButtonLink href={p.button.href} className="mt-[clamp(20px,calc(24*var(--u)),32px)]">
            {p.button.label}
          </ButtonLink>
        </Reveal>
      </section>
    );
  }

  if (variant === "media" && media) {
    return (
      <section className={`px-gutter ${p.className ?? ""}`}>
        <AppLink href={p.button.href} className="group relative block" aria-label={`${label} — ${p.button.label}`}>
          <MediaReveal className="aspect-[1354/761] w-full rounded-[4px]">
            <div className="size-full transition-transform duration-1000 ease-page group-hover:scale-[1.02]">
              <Media media={media} sizes="100vw" />
            </div>
            <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
          </MediaReveal>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-gutter text-center">
            <RevealLines as="h2" className="text-display">
              {lines(p.title)}
            </RevealLines>
            <Reveal className="mt-[clamp(20px,calc(28*var(--u)),40px)]">
              <span className="inline-flex h-[clamp(44px,calc(52*var(--u)),64px)] items-center rounded-full border border-fg/40 px-[clamp(20px,calc(28*var(--u)),36px)] text-ui transition-colors duration-300 ease-ui group-hover:border-fg group-hover:bg-fg group-hover:text-bg">
                {p.button.label}
              </span>
            </Reveal>
          </div>
        </AppLink>
      </section>
    );
  }

  return (
    <section className={`px-gutter ${p.className ?? ""}`}>
      <div className="flex aspect-[1354/761] w-full flex-col items-center justify-center rounded-[2px] bg-surface px-gutter py-16 text-center max-md:aspect-auto max-md:py-24">
        <RevealLines as="h2" className="text-list">
          {lines(p.title)}
        </RevealLines>
        {p.text && (
          <Reveal className="mt-4">
            <p className="text-lead text-fg/80">{p.text}</p>
          </Reveal>
        )}
        <Reveal className="mt-[clamp(18px,calc(26*var(--u)),36px)]">
          <ButtonLink href={p.button.href} variant="filled">
            {p.button.label}
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
