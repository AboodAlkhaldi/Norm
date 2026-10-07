import type { ImageAsset, VideoAsset } from "./types";

/**
 * Every video and image path on the site lives in this file.
 *
 * To move media to a CDN later, change MEDIA_BASE (or the individual paths)
 * here — nothing else in the codebase hard-codes a media URL.
 *
 * All current files are placeholders in /public/media/placeholder/.
 * Sources:
 *  - "norm-*", "showreel*", "hero-reel", "social-*", "team-*": NORM's own
 *    media, downloaded from the AI-generated NORM site.
 *  - "stock-*": Mixkit free stock video (Mixkit License), re-encoded.
 *  - "posture-*": Unsplash free photos (Unsplash License).
 */
const MEDIA_BASE = "/media/placeholder";

const v = (name: string) => `${MEDIA_BASE}/video/${name}.mp4`;
const img = (name: string, ext = "jpg") => `${MEDIA_BASE}/image/${name}.${ext}`;

const MIXKIT = "Mixkit free stock video";
const AI_SITE = "NORM — from the AI-generated site";

function video(
  name: string,
  alt: string,
  size: [number, number],
  source: string,
): VideoAsset {
  return {
    kind: "video",
    src: v(name),
    poster: img(name),
    width: size[0],
    height: size[1],
    alt,
    placeholder: true,
    source,
  };
}

function image(
  name: string,
  alt: string,
  size: [number, number],
  source: string,
  ext = "jpg",
): ImageAsset {
  return { kind: "image", src: img(name, ext), width: size[0], height: size[1], alt, placeholder: true, source };
}

const WIDE: [number, number] = [1280, 566]; // NORM reel excerpts (2.26:1)
const HD: [number, number] = [960, 540]; // stock loops are encoded at 960×540 (lighter to decode)

export const media = {
  // Showreel (overlay). 720p is the default; 1080p is used on large screens with a good connection.
  showreel: {
    ...video("showreel-720", "NORM showreel — company profile 2025", WIDE, AI_SITE),
    srcHigh: v("showreel"),
    poster: img("showreel"),
    hasAudio: false,
    // 60 frames, one every 1.41 s, made with ffmpeg from showreel-720.mp4 (re-make when the reel changes).
    frames: { src: img("showreel-frames"), count: 60, cols: 10, width: 192, height: 84 },
  } satisfies VideoAsset,

  heroReel: video("hero-reel", "NORM reel preview: a montage of motion, 3D and compositing work", WIDE, AI_SITE),

  // NORM reel excerpts
  kineticBooks: video("norm-kinetic-books", "Arabic typography animated across moving books", WIDE, AI_SITE),
  architecturalMotion: video("norm-architectural-motion", "Camera move through an animated architectural model", WIDE, AI_SITE),
  colourProcess: video("norm-colour-process", "Colour grading pass on a reel shot", WIDE, AI_SITE),
  compositingProcess: video("norm-compositing-process", "Compositing breakdown of a reel shot", WIDE, AI_SITE),
  terrainMotion: video("norm-terrain-motion", "Animated terrain rendered in 3D", WIDE, AI_SITE),
  characterLoop: video("norm-character-loop", "Illustrated character animation from the NORM reel", WIDE, AI_SITE),
  nightLoop: video("norm-night-loop", "Animated graphic sequence from the NORM reel", WIDE, AI_SITE),

  // NORM stills (1920×850)
  calligraphy: image("norm-motion-calligraphy", "Animated calligraphy frame from the NORM reel", [1920, 850], AI_SITE),
  character: image("norm-motion-character", "Character animation frame from the NORM reel", [1920, 850], AI_SITE),
  graphicStorytelling: image("norm-motion-graphic-storytelling", "Graphic storytelling frame from the NORM reel", [1920, 850], AI_SITE),
  processColour: image("norm-process-colour-before-after", "Before and after colour grading", [1920, 850], AI_SITE),
  processComposite: image("norm-process-composite-final", "Final composite frame", [1920, 850], AI_SITE),
  processGreenScreen: image("norm-process-green-screen", "Green-screen plate before compositing", [1920, 850], AI_SITE),
  processMatte: image("norm-process-isolation-matte", "Isolation matte of a subject", [1920, 850], AI_SITE),

  // Stock video (Mixkit)
  redDancer: video("stock-red-dancer", "Dancer turning under red light", HD, MIXKIT),
  violinist: video("stock-violinist", "Close-up of a violinist under red and violet light", HD, MIXKIT),
  redHand: video("stock-red-hand", "Hand moving through a red light", HD, MIXKIT),
  cameraSilhouette: video("stock-camera-silhouette", "Silhouette of a cinema camera against blue light", HD, MIXKIT),
  btsInterview: video("stock-bts-interview", "Behind the scenes of an interview shoot", HD, MIXKIT),
  studioCamera: video("stock-studio-camera", "Studio camera on a tripod recording", HD, MIXKIT),
  smoke: video("stock-smoke", "Smoke curling over a black background", HD, MIXKIT),

  // Social previews (footer). All three scroll at the same steady 170 px/s in the
  // 800 px frame (then play at 1.2×, Footer.tsx); keep that speed when re-making them.
  socialInstagram: video("social-instagram-v2", "Scrolling preview of NORM's Instagram page", [800, 450], AI_SITE),
  socialLinkedin: video("social-linkedin-v2", "Scrolling preview of NORM's LinkedIn page", [800, 450], AI_SITE),
  // Brief of the linked channel: a pan down a full-page screenshot of
  // youtube.com/@Rakhaa (header, videos, favourites) taken on 2026-10-07.
  socialYoutube: {
    ...video("social-youtube-v2", "Preview of the YouTube channel: header and latest videos", [800, 450], "youtube.com/@Rakhaa (screen capture)"),
    placeholder: false,
  } satisfies VideoAsset,

  // Posture case study (Unsplash)
  postureWhiteRose: image("posture-white-rose", "A single white rose in a clear glass vase", [1208, 1600], "Unsplash photo-1526998482116"),
  postureEucalyptus: image("posture-eucalyptus", "A eucalyptus sprig in a white ceramic vase", [1067, 1600], "Unsplash photo-1581783342308"),
  postureHydrangea: image("posture-hydrangea", "White hydrangea in a glass bottle by a window", [1068, 1600], "Unsplash photo-1593624212435"),
  posturePedestal: image("posture-pedestal", "A white vase on a white pedestal", [1067, 1600], "Unsplash photo-1691678916234"),

  // Team portraits (840×1050)
  teamSohaib: image("team-sohaib", "Portrait of Sohaib", [840, 1050], AI_SITE, "webp"),
  teamOsama: image("team-osama", "Portrait of Osama", [840, 1050], AI_SITE, "webp"),
  teamLayan: image("team-white-hijab", "Portrait of Layan", [840, 1050], AI_SITE, "webp"),
  teamFaris: image("team-man", "Portrait of Faris", [840, 1050], AI_SITE, "webp"),
  teamRagat: image("team-ragat", "Portrait of Ragat", [840, 1050], AI_SITE, "webp"),
  teamNoura: image("team-taupe-hijab", "Portrait of Noura", [840, 1050], AI_SITE, "webp"),

  // Social sharing image
  og: { kind: "image", src: "/og.jpg", width: 1200, height: 630, alt: "NORM — The Norm of cinematic creation", placeholder: true } satisfies ImageAsset,
} as const;

export const clientLogo = (n: number): ImageAsset => ({
  kind: "image",
  src: `${MEDIA_BASE}/logos/client-${String(n).padStart(2, "0")}.svg`,
  width: 141,
  height: 36,
  alt: `Client ${String(n).padStart(2, "0")} (placeholder logo)`,
  placeholder: true,
});
