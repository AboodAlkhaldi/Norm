"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { ScrollTrigger } from "@/lib/gsap";
import { getLenis, scrollToTop } from "@/lib/lenis";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

type Ctx = {
  /** Navigate with the page transition. Returns false if the caller should let Next handle it. */
  navigate: (href: string) => boolean;
};

const TransitionContext = createContext<Ctx>({ navigate: () => false });
export const usePageTransition = () => useContext(TransitionContext);

type ViewTransitionDoc = Document & {
  startViewTransition?: (update: () => Promise<void>) => { finished: Promise<void>; ready: Promise<void> };
};

/**
 * Page transition (MOTION.md §10), as on Studio Size (Swup parallel) and the AI site
 * (page-rise): the new page slides up from the bottom over the frozen old page —
 * 1 s, cubic-bezier(0.44, 0, 0.28, 0.99).
 *
 * Built on the browser's View Transitions API: the old screen is captured once as an
 * image by the browser, the new page is live underneath (videos and reveals keep
 * running), and nothing has to be copied or re-painted when the slide ends — which is
 * what caused the short freeze of the earlier DOM-snapshot version. The animation
 * itself is CSS (globals.css, ::view-transition-*). Browsers without the API, and
 * reduced motion, get a normal instant navigation.
 */
export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const busy = useRef(false);
  const committed = useRef<(() => void) | null>(null);

  const navigate = useCallback(
    (href: string) => {
      const target = href.split("#")[0] || "/";
      const doc = document as ViewTransitionDoc;
      if (target === pathname || busy.current || prefersReducedMotion() || !doc.startViewTransition) return false;

      busy.current = true;
      const hash = href.includes("#") ? href.split("#")[1] : null;
      getLenis()?.stop();

      const vt = doc.startViewTransition(async () => {
        // The browser has captured the old screen; now render the new route.
        const done = new Promise<void>((resolve) => (committed.current = resolve));
        router.push(href, { scroll: false });
        await Promise.race([done, new Promise((r) => setTimeout(r, 5000))]);
        committed.current = null;
        // Land at the top (or at the #anchor) before the new page is shown.
        scrollToTop();
        const anchor = hash ? document.getElementById(hash) : null;
        if (anchor) {
          const top = anchor.getBoundingClientRect().top + window.scrollY - 120;
          const lenis = getLenis();
          if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
          else window.scrollTo(0, top);
        }
      });

      vt.finished.finally(() => {
        busy.current = false;
        getLenis()?.start();
        ScrollTrigger.refresh();
      });
      return true;
    },
    [pathname, router],
  );

  // The new route has committed to the DOM → let the view transition capture it.
  useEffect(() => {
    committed.current?.();
  }, [pathname]);

  const value = useMemo(() => ({ navigate }), [navigate]);

  return <TransitionContext.Provider value={value}>{children}</TransitionContext.Provider>;
}
