import { HeroTitle } from "./HeroTitle";
import { Reveal } from "@/components/motion/Reveal";

/** Inner-page header: optional eyebrow, display title (one line per string), optional intro. */
export function PageIntro({
  eyebrow,
  title,
  intro,
  className = "",
}: {
  eyebrow?: string;
  title: string[];
  intro?: string;
  className?: string;
}) {
  return (
    <header className={`px-gutter pt-[clamp(104px,calc(182*var(--u)),236px)] ${className}`}>
      {eyebrow && (
        <Reveal immediate>
          <p className="mb-[clamp(16px,calc(25*var(--u)),36px)] text-body text-muted">{eyebrow}</p>
        </Reveal>
      )}
      <HeroTitle lines={title} />
      {intro && (
        <Reveal immediate delay={0.15} className="mt-[clamp(20px,calc(30*var(--u)),44px)] max-w-[calc(700*var(--u))] max-md:max-w-none">
          <p className="text-lead">{intro}</p>
        </Reveal>
      )}
    </header>
  );
}
