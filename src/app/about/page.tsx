import { aboutPage } from "@/content/about";
import { team } from "@/content/team";
import { featuredProjects } from "@/content/projects";
import { pageMetadata } from "@/lib/metadata";
import { PageIntro } from "@/components/sections/PageIntro";
import { ImageStrip } from "@/components/sections/ImageStrip";
import { KineticType } from "@/components/sections/KineticType";
import { TeamGrid } from "@/components/sections/TeamGrid";
import { Accordion } from "@/components/sections/Accordion";
import { CtaBlock } from "@/components/sections/CtaBlock";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { Media } from "@/components/media/Media";
import { MediaReveal, Reveal, RevealLines } from "@/components/motion/Reveal";

export const metadata = pageMetadata({
  title: "About",
  description: aboutPage.paragraphs[0],
  path: "/about",
});

const gap = "mt-[clamp(96px,calc(200*var(--u)),260px)]";

export default function AboutPage() {
  const { perspectives, howWeWork, inside } = aboutPage;
  return (
    <>
      <PageIntro title={aboutPage.title} />

      <ImageStrip
        className="mt-[clamp(32px,calc(60*var(--u)),80px)]"
        label="NORM at work"
        items={aboutPage.strip}
        widths={[384, 712, 554]}
        paragraphs={aboutPage.paragraphs}
        priority={3}
      />

      <section className={gap} aria-labelledby="perspectives">
        <RevealLines as="h2" className="px-gutter text-statement">
          {perspectives.title.map((l, i) => (
            <span key={l} className="block" id={i === 0 ? "perspectives" : undefined}>
              {l}
            </span>
          ))}
        </RevealLines>
        <ImageStrip
          className="mt-[clamp(40px,calc(86*var(--u)),110px)]"
          label="Different perspectives"
          items={[perspectives.media[0], <KineticType key="kinetic" lines={perspectives.kinetic} />, perspectives.media[1]]}
          widths={[384, 712, 554]}
          paragraphs={perspectives.paragraphs}
        />
      </section>

      <section className={`${gap} px-gutter`} aria-labelledby="team">
        <RevealLines as="h2" className="text-title">
          <span id="team">{aboutPage.team.title}</span>
        </RevealLines>
        <Reveal className="mt-[clamp(20px,calc(40*var(--u)),52px)] max-w-[calc(700*var(--u))] max-md:max-w-none">
          <p className="text-card font-normal">{aboutPage.team.intro}</p>
        </Reveal>
        <div className="mt-[clamp(24px,calc(40*var(--u)),52px)]">
          <TeamGrid team={team} />
        </div>
      </section>

      <section className={`${gap} px-gutter`} aria-labelledby="how-we-work">
        <RevealLines as="h2" className="mb-[clamp(16px,calc(24*var(--u)),32px)] text-title">
          <span id="how-we-work">{howWeWork.title}</span>
        </RevealLines>
        <Accordion items={howWeWork.steps} />
      </section>

      <section className={`${gap} px-gutter`} aria-labelledby="inside">
        <RevealLines as="h2" className="text-title">
          <span id="inside">{inside.title}</span>
        </RevealLines>
        <div className="mt-[clamp(24px,calc(36*var(--u)),48px)] grid gap-gap md:grid-cols-3">
          {inside.media.map((m, i) => (
            <MediaReveal key={i} delay={i * 0.08} className="aspect-[434/299] rounded-[4px] bg-surface">
              <Media media={m} sizes="(min-width: 768px) 30vw, 100vw" />
            </MediaReveal>
          ))}
        </div>
      </section>

      <CtaBlock variant="surface" {...aboutPage.cta} className="mt-[clamp(96px,calc(160*var(--u)),220px)]" />

      <FeaturedWork projects={featuredProjects()} className={gap} />
    </>
  );
}
