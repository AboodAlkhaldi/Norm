"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { Logo } from "@/components/brand/Logo";
import { AppLink } from "@/components/ui/AppLink";
import { ButtonLink, pillNav } from "@/components/ui/Button";
import { lockScroll } from "@/lib/lenis";

/**
 * Header (MOTION.md §11): hides on scroll down, returns on scroll up,
 * dark background after 150px. Layout = Studio Size at 1440: 21px from the top,
 * logo 24px tall at the 50px margin, links 14px medium 20px apart (2px underline
 * on hover / active page), "Get in touch" 40px pill 20px after the links.
 */
export function Header() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 150);
      if (Math.abs(y - last) > 4) {
        setHidden(y > last && y > 150);
        last = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu and show the header on navigation (state reset during render).
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpen(false);
    setHidden(false);
  }

  useEffect(() => {
    lockScroll(open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`) || (href === "/portfolio" && pathname.startsWith("/work/"));

  return (
    <header
      // Own view-transition layer: stays put while pages slide (globals.css).
      style={{ viewTransitionName: "site-header" }}
      // Tailwind v4 moves elements with the CSS `translate` property, so that is what transitions
      // (0.3s ease-in-out, as on Studio Size and the AI site).
      className={`fixed inset-x-0 top-0 z-50 transition-[translate,background-color] duration-300 ease-in-out ${
        // No transform at rest: a transform would trap the fixed mobile menu inside the header.
        hidden && !open ? "-translate-y-full" : ""
      } ${solid || open ? "bg-black/[0.88]" : "bg-transparent"}`}
    >
      <div className="relative z-10 flex items-center justify-between px-header pb-[clamp(14px,calc(34*var(--u)),44px)] pt-[clamp(12px,calc(21*var(--u)),28px)]">
        <AppLink href="/" className="block" aria-label="NORM — home">
          <Logo className="h-[clamp(20px,calc(24*var(--u)),32px)] w-auto text-fg" />
        </AppLink>

        <nav aria-label="Main" className="hidden items-center md:flex">
          <ul className="flex items-center gap-[clamp(14px,calc(20*var(--u)),26px)]">
            {site.nav.map((item) => (
              <li key={item.href}>
                <AppLink
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="group relative py-1 text-ui font-medium tracking-[-0.01em]"
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    // AI site: grows in from the left on hover, leaves to the right.
                    className={`absolute inset-x-0 -bottom-0.5 h-[2px] bg-fg transition-transform duration-300 ease-ui ${
                      isActive(item.href) ? "origin-left scale-x-100" : "origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100"
                    }`}
                  />
                </AppLink>
              </li>
            ))}
          </ul>
          <ButtonLink href={site.navCta.href} size="nav" className="ml-[clamp(14px,calc(20*var(--u)),26px)]">
            {site.navCta.label}
          </ButtonLink>
        </nav>

        <button
          type="button"
          className={`${pillNav} relative z-10 border-pill md:hidden`}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Main" className="fixed inset-0 flex flex-col justify-end bg-bg px-gutter pb-12 pt-28 md:hidden">
          <ul className="space-y-1">
            {[...site.nav, site.navCta].map((item, i) => (
              <li key={item.href} className="overflow-clip">
                <AppLink
                  href={item.href}
                  className="block animate-[menu-rise_0.7s_var(--ease-page)_both] text-[44px] font-semibold leading-[1.1] tracking-[-0.02em]"
                  style={{ animationDelay: `${80 + i * 60}ms` }}
                >
                  {item.label}
                </AppLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
