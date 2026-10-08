# NORM — Motion spec

Observed on 2026-10-06 by reading the live code of both reference sites:

- **Studio Size** (`studio-size.com`, theme bundle `script.min.js` v10.0.5 + `style.min.css`). Stack found in the bundle: GSAP, ScrollTrigger, SplitText, Lenis, Swup (+ Parallel plugin), Splide, hls.js.
- **AI-generated NORM site** (CSS keyframes and DOM).

Where both sites agree we use their shared values. Anything marked **(NORM)** has no reference on either site and is our own design, kept in the same language.

## Shared easing tokens

Both sites use the exact same two curves, so they are our only two curves:

| Token | Value | Used for |
|---|---|---|
| `--ease-ui` | `cubic-bezier(0.51, 0.01, 0.2, 1)` | hover, colour, small UI transitions (≈300 ms) |
| `--ease-page` | `cubic-bezier(0.44, 0, 0.28, 0.99)` | page transitions, reveals, large movement |

GSAP equivalents: `power4.out` for character flips, `power1.inOut` for line/media reveals (both from Studio Size's code).

## 1. Smooth scroll — Lenis

- Source: Studio Size `new Lenis({ duration: 1.2, lerp: 0.1, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })`.
- Driven from `gsap.ticker`, `ScrollTrigger.update` on every Lenis scroll.
- Stopped while an overlay is open; disabled under reduced motion (native scroll).

## 2. Rotating hero word

- Owner decision: behaviour from the AI site, technique from Studio Size.
- AI site: the word "creation" is split into letters. Every **7 s** cycle the current letters slide **up out** (`translateY(0 → -150%)`) while the next copy slides **up in** (`150% → 0`) between 78 % and 94 % of the cycle, letters staggered **32 ms**, easing `--ease-page`, inside an `overflow: hidden` mask. First load: letters rise from `130%` over **0.9 s**.
- Studio Size: same idea with a GSAP timeline per word — chars `y: 150% → 0` in / `0 → -150%` out, **0.75 s**, `power4.out`, stagger **0.05 s**, `repeat: -1`. Starts after the heading's line reveal completes (+300 ms).
- **Ours:** GSAP timeline, words from `home.ts` (`["creation"]` today — add words to rotate through them). Hold 0.6 s, flip 0.6 s `power4.out`, char stagger 0.03 s — a new word about every 1.5 s (owner), mask overflow hidden. Screen readers get the static word.

## 3. Line / text reveals on scroll

- Studio Size `[data-line-reveal]`: SplitText into lines wrapped in masks, each line `y: 120% → 0`, **0.6 s**, `power1.inOut`, delay 0.5 s (0 when `data-no-delay`), stagger **0.1 s**, trigger `top 85%`, plays once.
- AI site headings: lines rise from `translateY(100%)`, 90 ms apart.
- **Ours:** `<RevealLines>` uses GSAP SplitText (`mask: "lines"`, `autoSplit` — re-splits on resize/font load), `y: 110% → 0`, 0.9 s `--ease-page`, stagger 0.09 s, plays once when 12 % into view. Hero heading plays on load (`HeroTitle`). Single-line items (service names, emails) use `<RiseIn>` (same motion, no splitting).

## 4. Fade-up reveals (paragraphs, cards, buttons)

- Studio Size cards: `opacity 0, y 20% → 1, 0`, **1 s** `power1.inOut`; first 6 cards on load with delay `0.15 × (n+1)`, the rest on scroll at `top 85%`.
- AI site `.reveal`: `opacity 0, translateY(50px)`, opacity 0.8 s / transform 1 s `--ease-page`.
- **Ours:** `<Reveal>`: `opacity 0, y 40px → 0`, 1 s `--ease-page`, optional children stagger, plays once when 12 % into view.

## 5. Media reveals

- Studio Size `[video-reveal-anim]`: an overlay on the media scales `scaleY 1 → 0` from the top, **0.8 s** `power1.inOut`, trigger `top 85%`.
- **Ours:** same — black curtain `scaleY 1 → 0` (origin top) 0.9 s `--ease-page`, plus the media inside scaling `1.08 → 1` over 1.4 s for depth. Once.

## 6. Video tiles — play on hover / in view

- Studio Size work cards: `<video class="on-hover" preload="metadata">` — on `mouseenter` play, on `mouseleave` pause + `currentTime = 0`; the poster image crossfades `opacity 1 → 0` in **0.3 s ease-in-out**. On mobile, the visible slide autoplays.
- Studio Size background videos: IntersectionObserver `threshold 0.5` → play / pause.
- **Ours (`VideoTile`):** muted, loop, `playsInline`, poster, lazy-attached `src` via IntersectionObserver (`rootMargin 300px`), pauses when off-screen. `mode="hover"` (cards) or `mode="inview"` (backgrounds). Poster crossfade 0.3 s. Reduced motion → poster only.

## 7. Services hover media swap (Home)

- AI site `.service-row`: list items `#434343`, active row → white, text slides right by `5.556vw` (80 px @1440), **0.3 s ease-in-out**; the matching media fades in (`opacity 0.3 s ease-in`) while others fade out.
- Studio Size services: hover starts the row's video after a **600 ms** hover intent.
- **Ours (Studio Size, owner's request):** the list has no entrance animation (it is simply there); nothing is selected until a row is hovered/focused, and leaving the list clears it again. Active row → white + `translateX` 80 px @1440, 0.3 s ease-in-out. Each row has its own 541 × 406 video beside the list, level with its row (≥ 58 px under the "Services" label, kept inside the list); it fades in 0.3 s ease-in and starts after a 600 ms hover. Touch: the row crossing 40 % of the screen is active; the picture above the list keeps the last row's poster.

## 8. Carousels — drag + arrows

- Studio Size Featured Work: Splide, `autoWidth`, `perMove: 1`, gap 26 px, arrows disabled at the ends, slide speed ≈ 500 ms.
- **Ours (`Carousel`):** track moved with GSAP `x`. Drag: the track eases after the pointer (frame-rate-independent lerp, 38 % of the remaining distance per 60 Hz frame) instead of jumping; on release it is thrown with the pointer's velocity over the last ~100 ms and settles on the nearest card (0.6–1.1 s `--ease-page`, longer for longer throws). Arrows move one card, 0.8 s; disabled at the ends; keyboard ←/→. At the end the last card stops one side margin (50 px @1440, 16 px on phones) from the screen edge — a safe area like Studio Size's, never flush with the edge.
- **Box sizes (owner: three sizes):** every rail tile has one height (534 @1440) and one of three widths — portrait 4:5 (427), tall 2:3 (356), landscape 4:3 (712) — from Studio Size's slider_with_text. Each project has a `format`; strips list theirs in content. Rails start on the 50 px text margin; strip paragraphs start where the 2nd and 3rd 4:5 tiles start.
- **Drag affordance (owner's choice — no "Drag" word, no progress line):** the outline ‹ › cursor over the track (§16).

## 9. Portfolio filtering

- Studio Size: on filter click, the grid fades `opacity → 0`, new cards load, then cards re-reveal (fade-up, staggered 0.15 s).
- AI site: cards re-run `card-rise` (`opacity 0, y 50px`), 60 ms stagger.
- **Ours (Studio Size way):** the grid fades out (0.35 s), the cards swap, the grid height eases from old to new (0.7 s `--ease-page`, so the CTA below glides instead of jumping) while the new cards rise in (`opacity 0, y 40 → 0`, 0.9 s, 0.07 s stagger). Active pill fills white 0.3 s.

## 10. Page transitions

- Studio Size (Swup Parallel): the **new page slides up from `translate3d(0, 100vh, 0)` over the old one** in **1 s** `cubic-bezier(0.44, 0, 0.28, 0.99)`; the old page is frozen; scroll resets to 0.
- AI site: `.page-enter { animation: page-rise 1s var(--page-ease) }` with the same `100vh → 0`.
- **Ours (same look), built on the browser's View Transitions API:** on an internal link the browser captures the current screen as a still image; the new route renders underneath, scroll resets to 0 (or to the `#anchor`), and the live new page slides up over the still image (`::view-transition-new(root)`, 1 s `--ease-page`; `::view-transition-old(root)` doesn't move). The header has its own layer (`view-transition-name: site-header`) and stays put. Videos and reveals keep running on the new page during the slide.
- Why not the earlier DOM-snapshot version: when the slide ended, removing the cloned page and clearing the transform forced a full repaint — a ~250 ms freeze in every navigation (Chrome trace). With View Transitions the longest frame gap fell to 28–92 ms (headless, no GPU) and no long tasks.
- No support (older browsers) or reduced motion → normal instant navigation.

## 11. Header

- Studio Size: header hides on scroll-down (`translateY(-100%)`), returns on scroll-up, dark translucent background after 150 px; **0.3 s ease-in-out**. AI site: same hide/show, `transition: transform .3s ease-in-out`.
- AI site nav links: underline `scaleX 0 → 1`, grows in from the left on hover and leaves to the right; the active page keeps it.
- **Ours:** same hide/show, animated (0.3 s ease-in-out on the CSS `translate` property that Tailwind v4 uses), background `rgba(0,0,0,0.88)` past 150 px. Underline 1 px (Figma), AI-site direction (in from left, out to right).

## 12. Footer wordmark reveal **(NORM)**

- Neither site animates its footer logo (both are static images). Ours: when the footer wordmark is 8 % into view, its five parts (N, O, R, M, play shape) rise one after another from a mask (`yPercent 105 → 0`, 1.2 s `--ease-page`, stagger 0.07 s), then the red dot scales in (0.6 s). At rest the unclipped logo is shown, so there are no seams between the parts.

## 13. Social hover previews

- Studio Size footer: each social link holds a 16:9 video (`width 3.1rem` = 310 px @1440, radius 5 px) positioned above/below the label; on hover it fades in (`opacity 0.3 s ease-in-out`) and plays; leaving pauses and rewinds. The other links dim to `#434343` while one is hovered. First item aligns left, last aligns right.
- **Ours:** same (310 px @1440, scales with vw), previews play at **1.2×** (owner) and all three scroll at the same steady speed (170 px/s in the 800 px clip, before the 1.2×). Instagram + LinkedIn = NORM's page-scroll clips; YouTube = a pan down a screenshot of youtube.com/@Rakhaa.

## 14. Accordion (About → How we work)

- Studio Size: first item open by default, one open at a time, `max-height` transition, `ScrollTrigger.refresh()` after 600 ms.
- **Ours:** same behaviour, height animated with GSAP 0.6 s `--ease-page`, `+` rotates to `×` 0.3 s. First item open.

## 15. Showreel — opening "Letterbox" + Studio Size–style player (owner's choice)

- References: Studio Size expands the preview into full screen from its own box; the AI site shows a centred "PLAY REEL" pill on hover and a small pause button for the background video.
- **Hero:** AI-site pill on hover (always visible on touch) + background pause button (no blur).
- **Opening (Letterbox):** the hero frame you were watching is captured; the box widens from the hero to full screen (0.95 s `--ease-page`), then black cinema bars slide in from top and bottom while the picture settles into the reel's 2.26:1 band (0.65 s, from 0.7 s); the captured frame dissolves into the playing reel (0.5 s); the viewfinder fades in (0.5 s, at 1.15 s).
- **Player (Studio Size controls, improved — replaced the Viewfinder):** a centred group in the bottom bar — play/pause circle (50 px, `#1d1d1d`, a `#434343` disc grows on hover), a timeline pill (320 × 50 @1440, radius 70) made of 9 frames from the reel, the unplayed part dimmed (black 60 %) with a 3 px red `#ff1b1b` playhead, and a sound circle; close circle bottom-right (top-right on phones), its × turns 90° on hover. Improvements over Studio Size: real reel frames in the bar (sprite `showreel-frames.jpg`, 60 frames), hovering the bar shows a larger frame + time above the pointer, progress drawn every frame from the video clock, scrubbing pauses and resumes, a spinner in the play button while buffering, and controls + cursor (native and the outline play/pause icon) fade out together after 2.6 s without movement while playing, returning on any movement or key. Click the picture to pause. Keys: Space, M, ←/→ ±5 s, Home/End on the bar, Esc.
- **Closing (new):** controls drop away (0.3 s), sound fades out (0.45 s), the current reel frame is held while the picture flies back into the hero box with the bars retracting at the same time (0.95 s `--ease-page`), then dissolves into the live hero preview (0.4 s); the visitor lands at the exact scroll position. Re-opening during the close returns straight to the player. The hero video pauses while the reel is open.

## 16. Cursor (Studio Size "mouse frame", owner's outline style)

- Studio Size shows a small pill that follows the pointer and names the action under it.
- **Ours (as the approved mockup):** desktop pointers only, off under reduced motion. The cursor element always sits exactly on the pointer (no lag). `data-cursor="drag" | "play" | "pause"` → a 58 px outline circle with an icon, centred on the pointer, native cursor hidden there; the switch between the normal cursor and the icon is a 0.3 s scale + fade (0.5 ↔ 1), and it leaves as a circle (the last icon stays drawn while fading). Any other text value → a small outline label just below-right of the pointer ("Copy" → "Copied"). Shrinks to 0.82 while pressed.

## 17. Project card hover (AI site)

- A 52 px round arrow scales in at the bottom-right of the media (`scale .8 → 1`, opacity, 0.3 s) on hover / keyboard focus; the cover video plays (§6).

## 18. Intro (owner's choice)

- AI site: a 4 s black screen — logo scales 1.4 → 1 and fades in, holds, then 1 → 0.8 and fades out; the page is blocked meanwhile.
- **Ours (≈1.9 s, first visit of a session only, never under reduced motion):** black screen; the NORM wordmark builds part by part (`yPercent 105 → 0`, 0.75 s, 0.06 s stagger); the red dot pops (0.3 s) and blinks once like a REC light; at 1.25 s the logo flies into the header logo's exact box (0.8 s `--ease-page`) while the black screen lifts up (0.9 s) and the hero title rises underneath. Any click, key, wheel or touch skips it. Decided by an inline script before first paint (no flash); CSS failsafe hides it after 5 s if JavaScript never runs. Above-the-fold reveals wait for the hand-over (`afterIntro`).

## 19. Floating scrollbar (owner's request)

- Studio Size replaces the browser scrollbar with its own fixed bar. **Ours:** the native scrollbar is hidden (the layout now uses the full window width, matching Figma's 1440 frame exactly); a thin floating thumb on the right edge (3 px, 6 px when grabbed; `mix-blend-mode: difference` so it reads on black and on bright media) fades in while the page scrolls and fades out 1 s after it stops (0.5 s). It also shows when the pointer nears the right edge; drag the thumb or click the track to scroll (through Lenis). Hidden while the page is locked (showreel, intro) and during page transitions. Desktop pointers only.

## Reduced motion

`prefers-reduced-motion: reduce` → Lenis off, no reveals (content visible), rotating word static, videos show posters only (showreel still plays on explicit request), page transitions instant, carousels jump without tween.

## Implementation notes (how the spec above is built)

- All motion code lives in `src/components/motion/*`, `src/lib/gsap.ts` (plugin registration + the two eases as `"page"` / `"ui"`), `src/lib/lenis.ts`.
- **Scroll-triggered reveals use a native IntersectionObserver** (`src/lib/onEnterView.ts`, "12 % into view" ≈ ScrollTrigger `top 88%`), not one ScrollTrigger per element. Items inside a carousel reveal when the carousel enters the view (off-screen slides are clipped and would otherwise never count as visible). Reason: with dozens of reveal triggers created in the same commit, ScrollTrigger's refresh threw `Cannot read properties of undefined (reading 'end')` when the browser restored a scroll position on reload. IntersectionObserver is lighter and immune to that; Lenis drives native scroll, so it stays in sync.
- To avoid a flash before JS runs, an inline script adds `html.js`; reveal targets (`[data-reveal]`) start hidden only when `html.js` is present and the user has no reduced-motion preference.
- Page transitions are built on Next's `<Link onNavigate>` (`AppLink`) + `PageTransitionProvider`, which wraps `router.push` in `document.startViewTransition`; the slide is CSS in `globals.css`.
- Showreel quality choice and buffering indicator: `src/components/overlays/Showreel.tsx`.
- **Video performance (measured):** decoding is the main cost. `VideoTile` only loads a file when needed — "inview" tiles near the viewport, "hover" cards on first hover, "manual" tiles (services stack, footer previews) when first activated — plays only while on screen, and pauses everything while the tab is hidden. Stock loops are 960×540. Scrolling Home in a production build went from 9 dropped frames to 0 (headless Chrome, `.tmp/pt/t9-perf.mjs`). Clips start as soon as they are in view, regardless of other motion (owner's call).
