# NORM — Website v1 Brief

Read this file fully at the start of every session. It is the source of truth for this project.

## 1. What we're building

NORM is a visuals / production studio (film, motion, VFX, post & audio, brand content, 3D). This site is our calling card: we'll send it to companies when pitching for work, so it has to feel like a top-tier studio site — cinematic, calm, confident, video-led.

This is **v1**. All content and media are placeholders and will be replaced later. The goal now is a complete, polished, working site with the final structure, design and motion, built so that swapping content later is trivial.

## 2. Sources and which one wins

We have three references. When they disagree, follow this order:

| Topic | Primary source | Secondary |
|---|---|---|
| Copy, page content, the 6 services, project names | **AI-generated NORM site** | Figma |
| Layout, spacing, typography, visual design | **Figma exports** (`/design`) | AI site |
| Motion and interaction | **Studio Size** | AI site |

If the sources conflict and the right answer isn't obvious from this table, **ask me before deciding**. Don't silently invent.

- AI-generated NORM site: https://norm-cinematic-studio.sohaib741158.chatgpt.site/ — crawl every page linked from its nav and footer, and extract the copy into our content files.
- Studio Size (main reference for feel and motion): https://studio-size.com/
- Figma exports in `/design`:
  - `layouts.png` — all desktop pages. Columns left to right: Home, Portfolio, About, Services, Why NORM, Contact, Project (case study "Posture").
  - `click-through.png` — the same pages at viewport size, plus portfolio filter states.
  - `portfolio-filters.png` — the portfolio page in each filter state.
  - `overlays.png` — the showreel player overlay (left) and the copy-email popover (right).

The PNGs are very large (`layouts.png` is 11200px wide). To read small text or details, crop sections with a script (e.g. Python PIL or sharp) and view the crops, rather than viewing the whole image.

## 3. Fixed decisions

- **Stack:** Next.js (App Router) + TypeScript. Tailwind CSS for styling, driven by design tokens. GSAP (+ ScrollTrigger) for animation, Lenis for smooth scroll.
- **Desktop-first.** Clients will open this on desktop. Design for 1280–1920px. Mobile must not break (sensible stacking, readable text), but no mobile-specific polish in v1.
- **English only.** No i18n and no RTL.
- **No CMS.** All content lives in typed data files in the repo; our developer edits content in code.
- **Hosting will be decided at the end.** Keep the build host-agnostic: no platform-specific features or SDKs.
- **Contact is email-only** (as in Figma). There is no form in v1.

## 4. Design system

Extract exact values from the Figma PNGs and set them up as tokens (CSS variables + Tailwind theme) before building pages.

- **Typeface:** Manrope (load via `next/font/google`). Verify against the PNGs. Large light/regular headings with tight leading; small UI text.
- **Colours:** pure black background, white text, muted grey secondary text, dark-grey surfaces for the CTA blocks, and one red accent (the dot in the NORM logo, red light bars in imagery). Sample the exact hex values from the PNGs.
- **UI elements:** pill buttons (outlined and filled), circular arrow buttons for carousels, filter pills with a white active state, thin divider lines.
- **Logo:** recreate both the small nav wordmark and the giant footer wordmark (heavy "NORM" + red dot + white triangle/play shape) as inline SVG placeholders traced from the PNGs. Real SVGs come later; keep the logo in one component so it's a single swap.

## 5. Global layout

- **Header:** small NORM logo on the left. On the right: Portfolio, About, Services, Why NORM, and a "Get in touch" pill (→ Contact).
- **Footer (every page):**
  - a row with Instagram / LinkedIn / YouTube; on hover each previews a video tile, Studio Size style
  - a full-width giant NORM wordmark
  - a bottom bar: "The Norm of cinematic creation" on the left; Index, Legal, Privacy, and "© NORM — All rights reserved." on the right
- **Footer links:** Index → `/portfolio` for v1. Legal and Privacy → simple placeholder text pages.
- **404 page** in the site's style.

## 6. Pages

Follow the Figma layouts. Pull the copy from the AI site; where the AI site has nothing for a Figma section, use the Figma text.

**Home `/`**
- Hero: "The Norm of cinematic creation" with a rotating word, Studio Size style. Background reel and a "Play reel" control that opens the showreel overlay.
- Featured Work carousel: "View all" link and prev/next arrows. Tiles are video loops with title and category.
- Manifesto line ("Story first. Craft in every frame.") and the client logo row.
- Services list with all **6 services** (from the AI site). Hovering a service swaps the media shown beside the list.
- Image strip with arrows, two short paragraphs, and an "About" button.
- Full-bleed CTA ("Create something that moves people.") with a button.

**Portfolio `/portfolio`**
- Title, filter pills, and a 3-column grid of tiles (title + category). Filtering is animated.
- Filters: use the AI site's categories if it has them, otherwise Figma's (All / Film / Motion / Post / Design).
- CTA block: "Find the right craft for your next project." → Services.

**Project `/work/[slug]`** (Figma: "Posture")
- Title and a meta row (Project, Services, plus Client and Year if present).
- Body built from flexible blocks: hero video, single image, image pair, statement text (like "Shape. Balance. Light."), and credits. It must work equally well for video-led and image-led projects.
- Featured Work carousel at the bottom (excluding the current project).

**Services `/services`**
- Heading and intro, then numbered rows 01–06. Each row has a title, description, tags, a "Get in touch" button, and media. Figma uses kinetic type ("ME / OV") as one row's media; keep that idea.
- CTA: "Tell us what you're imagining."

**Why NORM `/why-norm`**
- "Your challenge. Our craft." with an intro, then numbered reasons (copy from the AI site), each with media.
- CTA: "Tell us what you're imagining."

**About `/about`**
- Hero title with a media strip carousel and two paragraphs.
- "Different perspectives. Shared purpose." with kinetic type.
- "People behind the work": a team grid.
- "How we work": an accordion (Understand, Develop, Create, Refine).
- "Inside the process": an image row.
- CTA block "Your challenge. Our craft." → Why NORM.
- Featured Work carousel.

**Contact `/contact`**
- "Say hello", then two rows: New business → email, Careers → email. Clicking an email copies it and shows the "Email contact" popover from `overlays.png` (with a Back button), with a mailto fallback.
- Featured Work carousel and a CTA block.

**Overlays**
- **Showreel player:** full-screen, with Pause/Play, a timecode, Sound on/off, and Close. Esc closes it and focus is trapped while open.
- **Copy-email popover:** as above.

## 7. Content model

Put all content in `src/content/` as typed TS files, for example:

- `site.ts` — nav, footer, socials, emails, taglines
- `services.ts` — the 6 services
- `projects.ts` — projects, each with: `slug`, `title`, `client`, `category`, `services`, `year`, `cover` (video or image + poster), `blocks[]`, `featured`, and `placeholder: true`
- `team.ts`, `clients.ts` (logos)
- `media.ts` — **every video and image path in one place**, so moving to a CDN later means changing URLs in a single file

Every placeholder item carries `placeholder: true`. Add a dev-only check that lists remaining placeholders, so nothing is forgotten when real content arrives.

## 8. Placeholder media

- Use any media you like: from the AI site, or free stock (e.g. Pexels or Mixkit videos).
- Download it into `public/media/placeholder/`. Do not hotlink other sites' media.
- Keep files light: video loops should be 720p, muted, a few MB each, with a poster image for every video.

## 9. Motion

Studio Size is the benchmark for feel; the AI site is the secondary reference.

1. **Before building any motion, study both sites in a browser** if you have browser access; otherwise read their source and scripts.
2. Write the observed behaviours to `MOTION.md`: what triggers each one, timing and easing, and where it's used.
3. Implement from that list.

Expected at minimum:
- Lenis smooth scroll
- the rotating hero word
- text and line reveals on scroll
- media reveals
- video tiles that play on hover (and/or when in view)
- the services hover media swap
- carousel drag and arrows
- animated portfolio filtering
- page transitions
- the footer wordmark reveal
- social hover previews

Respect `prefers-reduced-motion`. Motion should feel calm and expensive, never bouncy or gimmicky.

**Video tile component:** one reusable component that is muted, loops, uses `playsInline`, has a poster, lazy-loads via IntersectionObserver, pauses when off-screen, and falls back to the poster under reduced motion. Every video on the site uses it.

## 10. Quality bar

- Semantic HTML, visible keyboard focus states, and alt text (even placeholder alt text).
- Per-page metadata and OG tags; add a placeholder OG image.
- `noindex` controlled by an env flag, ON by default until launch.
- Fast on desktop: lazy media, no layout shift, fonts preloaded.
- A clean component structure that our developer can maintain. The README must explain how to swap content and media.

## 11. How to work

Build in phases. **At the end of each phase:**
1. Run the dev server and check the result in the browser against the Figma PNGs.
2. Summarise what was built.
3. List anything you deviated from or were unsure about.
4. **Stop and wait for my review.**

The phases:

- **Phase 1:** project setup, tokens, fonts, content model with copy extracted from the AI site, header, footer, core components (VideoTile, buttons, CTA block, carousel), and the **Home page**.
- **Phase 2:** Portfolio (with filters) and the Project template, with 6–8 placeholder projects.
- **Phase 3:** Services, Why NORM, About, Contact, overlays, 404, and the Legal/Privacy pages.
- **Phase 4:** a motion polish pass against `MOTION.md`, performance, metadata, and a final review against every Figma frame.

When I ask for changes, make them and keep this brief up to date if a decision changes.

## 12. Decisions log (agreed with the owner, 2026-10-06)

These override the sections above where they differ.

- **Content / behaviour: the AI-generated site wins over Figma** (it is the most recent source). Figma still decides layout, spacing, typography and visual design.
- **Services:** the AI site's 6 — Motion, Post & audio, Social media, VFX, Brand & content, 3D motion.
- **Rotating hero word:** behaves like the AI site (currently only "creation", re-animated letter by letter); built with Studio Size's technique. More words can be added in `src/content/home.ts`.
- **CTAs:** AI site wording — Home "Create something that moves people." (whole block links to Contact); Portfolio, Services, Why NORM, About: "Tell us what you're imagining." Contact keeps Figma's "Your challenge. Our craft." → Why NORM (the AI site has no CTA there).
- **Projects:** AI site names and copy; Figma's "Posture" kept as the image-led case study. Media are dummy videos/stills (NORM's own reel clips + free stock); no other studios' footage is used.
- **Client logos:** dummy marks for now.
- **Emails:** one for contact (`info@norm-prod.com`) and one for careers (address to come — placeholder uses `info@norm-prod.com`).
- **YouTube:** placeholder link until the real channel is sent.
- **How we work** bodies and team: what is available now (placeholders where nothing exists).
- **Showreel overlay** moved into Phase 1 so playback could be tested early; playback must not stall (720p default, 1080p only on large screens with a fast connection, faststart MP4s).
- The owner asked to run all phases without stopping between them.

### Decisions after the browser test (2026-10-06)

- **Contact:** no Featured Work carousel (follows the AI site).
- **Page transitions:** new page slides up over a frozen copy of the old page (Studio Size / AI site) — no black panel.
- **Header:** hides on scroll down and slides back smoothly on scroll up (0.3 s), as on both reference sites.
- **Showreel:** grows out of the hero reel (Studio Size); hero "Play reel" pill + background pause button as on the AI site.
- **Cursor label** (Studio Size): "Drag" on carousels, "Copy"/"Copied" on emails — desktop only.
- **Placeholder media:** no clip repeats on the same page; no card reuses the hero reel.

### Decisions — reel, cursor, intro (2026-10-07)

- **Reel:** opening "Letterbox" (hero widens, cinema bars slide in) + player "Viewfinder" (REC dot, frame timecode, red scrubbable timeline, text controls). Closing returns to the exact scroll position. Replaces the Figma overlay controls.
- **Carousel drag affordance:** no "Drag" word — outline ‹ › cursor icon + thin draggable progress line.
- **Cursor style:** outline.
- **Intro:** wordmark builds, REC blink, logo flies into the header; once per session, skippable.
- **Performance:** clips start as soon as they are in view (not delayed by other motion).

### Decisions — follow-up (2026-10-07)

- **Carousel:** progress line removed — the outline ‹ › cursor is the only drag hint; the cursor switch is a smooth scale + fade on the pointer (as in the approved mockup).
- **Page transitions:** now use the browser's View Transitions API (same look: new page rises over the frozen old one) — removes the short freeze at the end of each navigation.
- **YouTube:** https://www.youtube.com/channel/UC4jcwaqzp9PPDx77_y541dQ
- **Scrollbar:** native scrollbar hidden; thin floating rail on the right appears while scrolling (or on edge hover) and fades out.
