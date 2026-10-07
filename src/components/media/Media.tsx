import Image from "next/image";
import type { MediaAsset } from "@/content/types";
import { VideoTile, type VideoMode } from "./VideoTile";

/** Renders any MediaAsset filling its parent (parent sets the size / aspect ratio). */
export function Media({
  media,
  className = "",
  sizes,
  priority,
  mode = "inview",
  active,
  fit = "cover",
}: {
  media: MediaAsset;
  className?: string;
  sizes?: string;
  priority?: boolean;
  mode?: VideoMode;
  active?: boolean;
  fit?: "cover" | "contain";
}) {
  if (media.kind === "video") {
    return (
      <VideoTile
        media={media}
        mode={mode}
        active={active}
        className={`size-full ${className}`}
        sizes={sizes}
        priority={priority}
        fit={fit}
      />
    );
  }
  return (
    <div className={`relative size-full overflow-hidden ${className}`}>
      <Image
        src={media.src}
        alt={media.alt}
        fill
        sizes={sizes ?? "(min-width: 768px) 50vw, 100vw"}
        priority={priority}
        className={fit === "cover" ? "object-cover" : "object-contain"}
      />
    </div>
  );
}
