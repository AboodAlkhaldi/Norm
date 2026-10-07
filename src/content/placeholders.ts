import { site } from "./site";
import { home } from "./home";
import { services, servicesPage } from "./services";
import { projects, portfolioPage } from "./projects";
import { reasons, whyPage } from "./why";
import { aboutPage } from "./about";
import { team } from "./team";
import { clients } from "./clients";
import { contactPage } from "./contact";
import { legalPages } from "./legal";
import { media } from "./media";

/**
 * Walks every content export and lists each item marked `placeholder: true`.
 * Used by `npm run placeholders` and by the dev-only console report.
 */
export type PlaceholderItem = { path: string; label: string };

const roots: Record<string, unknown> = {
  site,
  home,
  services,
  servicesPage,
  projects,
  portfolioPage,
  reasons,
  whyPage,
  aboutPage,
  team,
  clients,
  contactPage,
  legalPages,
  media,
};

function describe(v: Record<string, unknown>) {
  return String(v.title ?? v.name ?? v.label ?? v.src ?? v.address ?? v.text ?? "").slice(0, 80);
}

export function findPlaceholders(): PlaceholderItem[] {
  const out: PlaceholderItem[] = [];
  const seen = new Set<string>();
  const walk = (value: unknown, path: string) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach((v, i) => walk(v, `${path}[${i}]`));
      return;
    }
    const obj = value as Record<string, unknown>;
    if (obj.placeholder === true) {
      // Each media file is listed once (where it is first used), however often it is reused.
      const key = typeof obj.src === "string" ? `src:${obj.src}` : path;
      if (!seen.has(key)) {
        seen.add(key);
        out.push({ path, label: describe(obj) });
      }
    }
    for (const [k, v] of Object.entries(obj)) {
      if (k !== "placeholder") walk(v, `${path}.${k}`);
    }
  };
  for (const [name, value] of Object.entries(roots)) walk(value, name);
  return out;
}
