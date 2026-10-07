import Image from "next/image";
import type { TeamMember } from "@/content/types";
import { MediaReveal, Reveal } from "@/components/motion/Reveal";

/** Team grid — 4 columns of 4:5 portraits (Figma: 320 × 400 at 1440) with name and role. */
export function TeamGrid({ team }: { team: TeamMember[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-gap gap-y-[clamp(32px,calc(48*var(--u)),64px)] md:grid-cols-4">
      {team.map((m, i) => (
        <li key={m.name}>
          <MediaReveal delay={(i % 4) * 0.08} className="aspect-[4/5] rounded-[4px] bg-surface">
            <Image src={m.photo.src} alt={m.photo.alt} fill sizes="(min-width: 768px) 23vw, 50vw" className="object-cover" />
          </MediaReveal>
          <Reveal className="pt-[clamp(12px,calc(18*var(--u)),24px)]">
            <p className="text-card">{m.name}</p>
            <p className="text-body text-muted">{m.role}</p>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
