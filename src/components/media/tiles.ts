import type { CSSProperties } from "react";
import type { TileFormat } from "@/content/types";

/**
 * The three box sizes used on every rail (Featured Work, image strips). All share one
 * height so a rail reads as a single line; the width changes with the format.
 * Sizes at 1440 from Studio Size's slider_with_text: 427 × 534 (4:5), 356 × 534 (2:3),
 * 712 × 534 (4:3).
 */
export const TILE_HEIGHT = 534;
export const TILE_WIDTH: Record<TileFormat, number> = {
  portrait: 427,
  tall: 356,
  landscape: 712,
};

/** Fluid N-at-1440 size, clamped like the rest of the scale (×0.62 … ×1.34). */
export const fluid = (n: number) => `clamp(${Math.round(n * 0.62)}px, calc(${n} * var(--u)), ${Math.round(n * 1.34)}px)`;

export function tileStyle(format: TileFormat = "portrait"): CSSProperties {
  return { width: fluid(TILE_WIDTH[format]), height: fluid(TILE_HEIGHT) };
}

/** `sizes` hint for next/image inside a tile of this format. */
export const tileSizes = (format: TileFormat = "portrait") =>
  `(min-width: 768px) ${Math.ceil(TILE_WIDTH[format] / 14.4)}vw, ${Math.round(TILE_WIDTH[format] * 0.62)}px`;
