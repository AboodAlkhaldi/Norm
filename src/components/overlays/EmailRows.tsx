"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { Reveal, RiseIn } from "@/components/motion/Reveal";

type Row = { label: string; address: string; subject?: string };
type Copy = { title: string; copied: string; copyFailed: string; back: string; mailto: string };

const mailto = (r: Row) => `mailto:${r.address}${r.subject ? `?subject=${encodeURIComponent(r.subject)}` : ""}`;

/**
 * Contact rows. Clicking an address copies it and opens the "Email contact"
 * popover (Figma overlays.png, right) with a Back button. If copying is not
 * possible, the popover shows the address with a mailto link instead.
 * Cmd/Ctrl-click (or middle-click) keeps the normal mailto behaviour.
 */
export function EmailRows({ rows, copy }: { rows: Row[]; copy: Copy }) {
  const [state, setState] = useState<{ row: Row; ok: boolean } | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const onClick = async (e: MouseEvent<HTMLAnchorElement>, row: Row) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    opener.current = e.currentTarget;
    let ok = false;
    try {
      await navigator.clipboard.writeText(row.address);
      ok = true;
      window.dispatchEvent(new CustomEvent("norm:cursor", { detail: "Copied" }));
    } catch {
      ok = false;
    }
    setState({ row, ok });
  };

  const close = useCallback(() => {
    setState(null);
    opener.current?.focus();
  }, []);

  return (
    <>
      <ul className="border-b border-line-strong">
        {rows.map((row) => (
          <li key={row.label} className="grid gap-4 border-t border-line-strong py-[clamp(24px,calc(46*var(--u)),60px)] md:grid-cols-[1fr_auto] md:items-start">
            <Reveal>
              <p className="text-lead">{row.label}</p>
            </Reveal>
            <a
              href={mailto(row)}
              onClick={(e) => onClick(e, row)}
              data-cursor="Copy"
              className="group block text-right text-statement text-dim transition-colors duration-300 ease-ui hover:text-fg focus-visible:text-fg max-md:text-left max-md:text-[28px]"
              aria-label={`${row.label}: ${row.address} — copy email address`}
            >
              <RiseIn>
                <span className="break-all">{row.address}</span>
              </RiseIn>
            </a>
          </li>
        ))}
      </ul>
      {state && <EmailPopover row={state.row} ok={state.ok} copy={copy} onClose={close} />}
    </>
  );
}

function EmailPopover({ row, ok, copy, onClose }: { row: Row; ok: boolean; copy: Copy; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true);

  useEffect(() => {
    const instant = prefersReducedMotion();
    gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: instant ? 0 : 0.3, ease: "ui" });
    gsap.fromTo(card.current, { y: 24 }, { y: 0, duration: instant ? 0 : 0.6, ease: "page" });
    ref.current?.querySelector<HTMLButtonElement>("[data-autofocus]")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[70] grid place-items-center bg-black/60 px-gutter"
      onPointerDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={card}
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-popover-title"
        className="w-full max-w-[clamp(320px,calc(560*var(--u)),720px)] bg-surface p-[clamp(24px,calc(34*var(--u)),44px)] pb-[clamp(32px,calc(56*var(--u)),72px)]"
      >
        <h2 id="email-popover-title" className="text-card font-normal">
          {copy.title}
        </h2>
        <p className="mt-[clamp(10px,calc(18*var(--u)),24px)] break-all text-card font-normal">{row.address}</p>
        <p className="mt-2 text-body text-muted" role="status">
          {ok ? copy.copied : copy.copyFailed}
        </p>
        <div className="mt-[clamp(20px,calc(30*var(--u)),40px)] flex flex-wrap items-center gap-3">
          <button
            type="button"
            data-autofocus=""
            onClick={onClose}
            className="inline-flex h-[clamp(44px,calc(52*var(--u)),64px)] items-center rounded-full border border-bg bg-bg px-[clamp(20px,calc(26*var(--u)),34px)] text-ui transition-colors duration-300 ease-ui hover:bg-fg hover:text-bg"
          >
            {copy.back}
          </button>
          <a
            href={mailto(row)}
            className="inline-flex h-[clamp(44px,calc(52*var(--u)),64px)] items-center rounded-full border border-pill px-[clamp(20px,calc(26*var(--u)),34px)] text-ui transition-colors duration-300 ease-ui hover:border-fg"
          >
            {copy.mailto}
          </a>
        </div>
      </div>
    </div>
  );
}
