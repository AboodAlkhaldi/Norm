# NORM — website v1

Calling-card site for NORM, a visuals / production studio. Next.js (App Router) + TypeScript, Tailwind CSS v4 driven by design tokens, GSAP (ScrollTrigger, SplitText, Flip) and Lenis.

- **Brief / source of truth:** [`NORM.md`](NORM.md) (includes the decisions log)
- **Motion spec:** [`MOTION.md`](MOTION.md)
- **Figma exports:** [`design/`](design)

## Run it

Requires Node.js ≥ 20.9.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build (all pages are static)
npm start            # serve the production build
npm run lint
npm run typecheck
npm run placeholders # list content still marked placeholder (exit code 1 while any remain)
```

Copy `.env.example` to `.env.local`:

| Variable | Default | Meaning |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Public URL for canonical / Open Graph links |
| `NEXT_PUBLIC_NOINDEX` | on | Search engines are blocked (`robots.txt` + meta) unless this is exactly `false`. Keep it on until launch. |

Hosting is not decided yet; the build uses no platform-specific features. Any Node host that can run `next start` works (images are optimised by `next/image` at runtime).

### Deploy a preview on Vercel

No Vercel-specific files are needed — Vercel detects Next.js and uses `npm install` + `next build`.

1. Push the repo to GitHub and import it in Vercel (framework preset: Next.js, root directory: the repo root).
2. In **Project → Settings → Environment Variables** add `NEXT_PUBLIC_SITE_URL` = the deployment URL (e.g. `https://your-project.vercel.app`) so canonical and Open Graph links point to it. Leave `NEXT_PUBLIC_NOINDEX` unset — the preview stays hidden from search engines.
3. Redeploy after changing environment variables (they are read at build time).

Media under `/media` is cached for a day (`next.config.ts`). When you replace a placeholder file, give the new file a new name (and update `media.ts`) so visitors don't see the cached old one.

## Where things are

```
src/
  app/                 routes (one folder per page) + layout, template (page transition), robots, 404
  content/             ALL copy and media references — edit content here
  components/
    brand/             Logo + footer Wordmark (official wordmark, traced to vector)
    layout/            Header, Footer
    media/             VideoTile (every video uses it), Media (image or video)
    motion/            SmoothScroll (Lenis), Reveal*, RotatingWord, PageTransition, CursorLabel
    carousel/          Carousel (drag + arrows), CarouselArrows
    sections/          page sections (hero, featured work, services list, CTA, portfolio grid, …)
    overlays/          Showreel player, email rows + popover
  lib/                 gsap setup, lenis handle, hooks, metadata helper, env flags
public/media/placeholder/   placeholder video / images / client logos
```

## Swapping content

All content is typed TypeScript in `src/content/`. Edit the file, save, done — no CMS.

| File | What it holds |
|---|---|
| `site.ts` | nav, footer links, social links (+ their hover preview videos), emails, taglines, 404 text |
| `home.ts` | hero lines, **rotating words** (`rotatingWords` — add words to rotate), section copy, CTA |
| `services.ts` | the 6 services (anchor id, name, description, tags, media, optional kinetic type) + Services page copy |
| `projects.ts` | projects (see below), portfolio filters, portfolio CTA |
| `why.ts` | Why NORM reasons + page copy |
| `about.ts` | About copy, How we work steps |
| `team.ts` | team members (name, role, photo) |
| `clients.ts` | client logos |
| `contact.ts` | contact page + email popover labels |
| `legal.ts` | Legal / Privacy page text |
| `media.ts` | **every media path** (see below) |
| `types.ts` | the types for all of the above |

### Adding a project

Add an object to `projects` in `src/content/projects.ts`:

- `slug` (URL: `/work/<slug>`), `title`, `category` (line under the title on tiles)
- `filters`: any of `film`, `motion`, `post`, `design` (portfolio pills)
- `project`, `services`, optional `client`, `year` (meta row), optional `summary`
- `cover`: a media asset (video or image) used on tiles
- `blocks`: the page body, in order. Block types: `video`, `image` (`size: "medium" | "large"`), `imagePair`, `statement` (`size: "large"` for the big one), `text`, `credits`
- `featured: true` to show it in Featured Work carousels
- `placeholder: true` until the content is final

The page is generated automatically at build time.

## Swapping media

1. Put the files in `public/media/…` (or upload them to a CDN).
2. Change the path(s) in **`src/content/media.ts`** — nothing else hard-codes a media URL. To move everything to a CDN, change `MEDIA_BASE` at the top of that file.
3. Remove `placeholder: true` from the asset.

Every video needs a poster image. Recommended encoding (what the placeholders use):

```bash
# loops (muted, ~1–3 MB): H.264, ≤1280px wide, faststart, no audio
ffmpeg -i in.mov -t 8 -vf "scale='min(1280,iw)':-2" -c:v libx264 -preset slow -crf 25 -profile:v high -pix_fmt yuv420p -g 48 -movflags +faststart -an out.mp4
# poster = first frame
ffmpeg -i out.mp4 -frames:v 1 -q:v 3 out.jpg
```

**Showreel** (`media.showreel`): two files so playback never stalls — a 720p version (`src`, ≈1.6 Mbps) used by default and an optional 1080p version (`srcHigh`) used only on large screens with a fast connection. Encode the 720p one with `-crf 24 -maxrate 1600k -bufsize 3200k` and keep the audio track (drop `-an`) once the real reel has sound; then set `hasAudio: true`. When the reel changes, re-make the player's timeline frames (60 frames, 10 × 6 sheet) and update `frames` in `media.ts` if the size changes:

```bash
ffmpeg -i showreel-720.mp4 -vf "fps=60/DURATION_IN_SECONDS,scale=192:-2:flags=lanczos,tile=10x6" -frames:v 1 -q:v 4 showreel-frames.jpg
```

**Rail box sizes**: each project has `format: "portrait" | "tall" | "landscape"` (4:5, 2:3, 4:3 at one height — `src/components/media/tiles.ts`); image strips take `formats` from their content file.

**Logo**: the nav logo, footer wordmark and intro share the official wordmark, traced to a vector path in `src/components/brand/logo-geometry.ts` (from "Logos & Landmark NORM.zip"). If an official SVG arrives, paste its path there. The tab icon (`src/app/icon.svg`) is the official camera mark.

**Font**: Clash Display 200–700 in `src/app/fonts/` (owner's files), loaded with `next/font/local` in `src/app/layout.tsx`.

## Placeholders

Everything temporary carries `placeholder: true`. `npm run placeholders` prints the list; in development the same list appears once in the browser console.

Current placeholder media sources: NORM's own reel clips and team photos (from the AI-generated NORM site), Mixkit free stock videos, Unsplash free photos (Posture), and generated "Client 01–07" marks.

## Accessibility & motion

- Visible focus styles, skip link, alt text on every image/video, focus-trapped overlays (Esc closes).
- `prefers-reduced-motion`: smooth scroll and reveals are off, videos show their poster, transitions are instant.
- Cursor: `data-cursor="drag" | "play" | "pause"` shows an outline icon on the pointer; any other text (e.g. `data-cursor="Copy"`) shows an outline label next to it (desktop only).
- Intro: plays once per browser session (sessionStorage key `norm-intro-seen`). To see it again, open a new tab or run `sessionStorage.removeItem("norm-intro-seen")` in the console and reload.
