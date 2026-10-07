/**
 * Content types. Every piece of content on the site is typed here.
 * Anything not final carries `placeholder: true` — run `npm run placeholders`
 * to list what is left to replace.
 */

export type ImageAsset = {
  kind: "image";
  src: string;
  width: number;
  height: number;
  alt: string;
  placeholder?: boolean;
  /** Where a placeholder came from (licence / source page). */
  source?: string;
};

export type VideoAsset = {
  kind: "video";
  src: string;
  /** Optional higher-quality source used only where noted (e.g. showreel). */
  srcHigh?: string;
  /** Poster image — required for every video. */
  poster: string;
  width: number;
  height: number;
  alt: string;
  hasAudio?: boolean;
  /**
   * Thumbnail sprite for player timelines: `count` evenly spaced frames, laid out
   * in `cols` columns, each `width` × `height` px (frame i shows time (i / count) × duration).
   */
  frames?: { src: string; count: number; cols: number; width: number; height: number };
  placeholder?: boolean;
  source?: string;
};

export type MediaAsset = ImageAsset | VideoAsset;

/** Rail box size (see components/media/tiles.ts): 4:5, 2:3 or 4:3 at one shared height. */
export type TileFormat = "portrait" | "tall" | "landscape";

export type Link = { label: string; href: string };

export type Social = {
  label: string;
  href: string;
  preview: VideoAsset;
  placeholder?: boolean;
};

export type Service = {
  /** Used as the anchor on /services (e.g. /services#motion). */
  id: string;
  /** Short name used in lists (Home). */
  name: string;
  title: string;
  description: string;
  tags: string[];
  media: MediaAsset;
  /** Render the kinetic "ME / OV" type instead of media (Figma idea). */
  kinetic?: { lines: [string, string] };
  placeholder?: boolean;
};

export type Reason = {
  title: string;
  description: string;
  tags: string[];
  media: MediaAsset;
  placeholder?: boolean;
};

export type PortfolioFilter = "film" | "motion" | "post" | "design";

export type ProjectBlock =
  | { type: "video"; media: MediaAsset; caption?: string }
  | { type: "image"; media: MediaAsset; size?: "medium" | "large"; caption?: string }
  | { type: "imagePair"; media: [MediaAsset, MediaAsset]; caption?: string }
  | { type: "statement"; text: string; size?: "medium" | "large" }
  | { type: "text"; text: string }
  | { type: "credits"; items: { role: string; name: string }[] };

export type Project = {
  slug: string;
  title: string;
  /** Short line shown under the title on tiles. */
  category: string;
  filters: PortfolioFilter[];
  /** Meta row on the project page. */
  project: string;
  services: string;
  client?: string;
  year?: string;
  summary?: string;
  cover: MediaAsset;
  /** Box size of this project's card on rails (chosen to suit the cover's framing). */
  format: TileFormat;
  blocks: ProjectBlock[];
  featured: boolean;
  placeholder: boolean;
};

export type TeamMember = {
  name: string;
  role: string;
  photo: ImageAsset;
  placeholder?: boolean;
};

export type Client = {
  name: string;
  logo: ImageAsset;
  placeholder?: boolean;
};

export type Cta = {
  title: string | string[];
  text?: string;
  button: Link;
};
