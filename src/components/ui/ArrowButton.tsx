import type { ComponentProps } from "react";

/** Circular carousel arrow (Figma: 50px, #242424). */
export function ArrowButton({
  direction,
  className = "",
  ...rest
}: { direction: "prev" | "next" } & Omit<ComponentProps<"button">, "children">) {
  return (
    <button
      type="button"
      aria-label={direction === "prev" ? "Previous" : "Next"}
      className={`grid size-[clamp(40px,calc(50*var(--u)),64px)] place-items-center rounded-full bg-surface text-fg transition-[background-color,color,opacity] duration-300 ease-ui hover:bg-fg hover:text-bg disabled:pointer-events-none disabled:opacity-35 ${className}`}
      {...rest}
    >
      <svg
        viewBox="0 0 16 16"
        className={`size-4 ${direction === "prev" ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M2 8h12M9 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
