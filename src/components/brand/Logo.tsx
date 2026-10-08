import { WORDMARK_DOT, WORDMARK_PATH, WORDMARK_VIEWBOX } from "./logo-geometry";

/**
 * NORM logo — the official wordmark (logo-geometry.ts). The nav logo and the giant
 * footer wordmark share this geometry.
 */
export function Logo({ className, title = "NORM" }: { className?: string; title?: string }) {
  const { width, height } = WORDMARK_VIEWBOX;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={WORDMARK_PATH} fill="currentColor" fillRule="evenodd" />
      <circle cx={WORDMARK_DOT.cx} cy={WORDMARK_DOT.cy} r={WORDMARK_DOT.r} fill="var(--c-accent)" />
    </svg>
  );
}
