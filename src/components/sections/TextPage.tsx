import { HeroTitle } from "./HeroTitle";
import { Reveal } from "@/components/motion/Reveal";

/** Simple text page (Legal, Privacy). */
export function TextPage({ title, sections }: { title: string; sections: { heading: string; body: string }[] }) {
  return (
    <article className="px-gutter pt-[clamp(112px,calc(176*var(--u)),230px)]">
      <HeroTitle lines={[title]} />
      <div className="mt-[clamp(48px,calc(96*var(--u)),128px)] space-y-[clamp(32px,calc(56*var(--u)),72px)] md:ml-[calc(462*var(--u))] md:max-w-[calc(760*var(--u))]">
        {sections.map((s) => (
          <Reveal key={s.heading} as="section" className="border-t border-line pt-6">
            <h2 className="text-card">{s.heading}</h2>
            <p className="mt-3 text-lead text-fg/85">{s.body}</p>
          </Reveal>
        ))}
      </div>
    </article>
  );
}
