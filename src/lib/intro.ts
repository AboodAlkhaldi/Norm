"use client";

/**
 * Intro coordination. The inline script in layout.tsx sets `html[data-intro="playing"]`
 * before first paint on the first visit of a session (never under reduced motion).
 * Above-the-fold reveals wait for the intro to hand over before they play.
 */
import { INTRO_STORAGE_KEY } from "./intro-boot";

export { INTRO_STORAGE_KEY };
export const INTRO_EVENT = "norm:intro-done";

let released = false;

export function introPlaying() {
  return typeof document !== "undefined" && document.documentElement.dataset.intro === "playing" && !released;
}

/** Tell waiting reveals to start (called when the intro starts lifting away). */
export function releaseIntro() {
  if (released) return;
  released = true;
  window.dispatchEvent(new Event(INTRO_EVENT));
}

/** Run `cb` now, or when the intro hands over. Returns a cleanup function. */
export function afterIntro(cb: () => void) {
  if (!introPlaying()) {
    cb();
    return () => {};
  }
  const h = () => cb();
  window.addEventListener(INTRO_EVENT, h, { once: true });
  return () => window.removeEventListener(INTRO_EVENT, h);
}
