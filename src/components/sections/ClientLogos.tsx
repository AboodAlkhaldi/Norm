import Image from "next/image";
import type { Client } from "@/content/types";

/**
 * Client logo row. Behaviour from the AI site: a slow continuous drift,
 * paused on hover; static row under reduced motion.
 */
export function ClientLogos({ clients, className = "" }: { clients: Client[]; className?: string }) {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center gap-[clamp(40px,calc(96*var(--u)),128px)] pr-[clamp(40px,calc(96*var(--u)),128px)]" aria-hidden={hidden || undefined}>
      {clients.map((c) => (
        <li key={c.name} className="shrink-0 opacity-60 transition-opacity duration-300 ease-ui hover:opacity-100">
          <Image
            src={c.logo.src}
            alt={hidden ? "" : c.logo.alt}
            width={c.logo.width}
            height={c.logo.height}
            className="h-[clamp(24px,calc(36*var(--u)),44px)] w-auto"
          />
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label="Clients" className={`group overflow-hidden ${className}`}>
      <div className="flex w-max animate-[logos_48s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:w-auto motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:px-gutter">
        {row(false)}
        <div className="contents motion-reduce:hidden">{row(true)}</div>
      </div>
    </section>
  );
}
