"use client";

import { useEffect } from "react";
import { findPlaceholders } from "@/content/placeholders";

/** Development only: lists remaining placeholder content in the browser console once per load. */
export function PlaceholderReport() {
  useEffect(() => {
    const items = findPlaceholders();
    if (!items.length) return;
    console.groupCollapsed(`[NORM] ${items.length} placeholder items left — run "npm run placeholders" for the full list`);
    console.table(items);
    console.groupEnd();
  }, []);
  return null;
}
