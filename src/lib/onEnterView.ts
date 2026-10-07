"use client";

/**
 * Calls `cb` once, the first time `el` is at least partly inside the viewport
 * shrunk by `rootMargin` (default: bottom 12% excluded ≈ ScrollTrigger "top 88%").
 * Elements already above the viewport (e.g. after a scroll restore) fire at once.
 * Returns a cleanup function.
 */
export function onEnterView(el: Element, cb: () => void, rootMargin = "0px 0px -12% 0px") {
  // Inside a carousel, items can sit off-screen horizontally (clipped), which the
  // browser never reports as "in view" — watch the carousel itself instead.
  const target = el.closest("[data-reveal-root]") ?? el;
  let done = false;
  const io = new IntersectionObserver(
    ([entry]) => {
      if (done) return;
      const above = entry.boundingClientRect.bottom < 0;
      if (entry.isIntersecting || above) {
        done = true;
        io.disconnect();
        cb();
      }
    },
    { rootMargin },
  );
  io.observe(target);
  return () => io.disconnect();
}
