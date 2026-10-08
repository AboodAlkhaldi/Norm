import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/content/site";
import { NOINDEX } from "@/lib/env";
import { pageMetadata } from "@/lib/metadata";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { PageTransitionProvider } from "@/components/motion/PageTransition";
import { ShowreelProvider } from "@/components/overlays/Showreel";
import { PlaceholderReport } from "@/components/dev/PlaceholderReport";
import { CursorLabel } from "@/components/motion/CursorLabel";
import { ScrollRail } from "@/components/layout/ScrollRail";
import { IntroOverlay } from "@/components/brand/IntroOverlay";
import { INTRO_BOOT_SCRIPT } from "@/lib/intro-boot";

/**
 * Clash Display (Indian Type Foundry) — the site typeface, from the owner's font files
 * (ClashDisplay-Extralight…Bold.otf converted to woff2).
 */
const clash = localFont({
  src: [
    { path: "./fonts/ClashDisplay-200.woff2", weight: "200", style: "normal" },
    { path: "./fonts/ClashDisplay-300.woff2", weight: "300", style: "normal" },
    { path: "./fonts/ClashDisplay-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ClashDisplay-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ClashDisplay-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/ClashDisplay-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-clash",
  display: "swap",
});

// Site-wide defaults (pages add their own canonical URL through pageMetadata).
const { alternates: _alternates, ...defaults } = pageMetadata({});
void _alternates;

export const metadata: Metadata = {
  ...defaults,
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s — ${site.name}` },
  robots: NOINDEX ? { index: false, follow: false, googleBot: { index: false, follow: false } } : { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={clash.variable} suppressHydrationWarning>
      <head>
        {/* Before first paint: marks JS as available (reveal targets start hidden, no flash) and
            decides whether the intro plays this session. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_BOOT_SCRIPT }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only z-[100] rounded-full bg-fg px-5 py-3 text-ui text-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <PageTransitionProvider>
          <ShowreelProvider>
            <SmoothScroll />
            <CursorLabel />
            <ScrollRail />
            <Header />
            <main id="main">{children}</main>
            <Footer />
          </ShowreelProvider>
        </PageTransitionProvider>
        <IntroOverlay />
        {process.env.NODE_ENV === "development" && <PlaceholderReport />}
      </body>
    </html>
  );
}
