/**
 * Lists every content item still marked `placeholder: true`.
 * Run: npm run placeholders   (exits with code 1 when placeholders remain, so it can gate a launch build)
 */
import { findPlaceholders } from "../src/content/placeholders";

const items = findPlaceholders();
if (!items.length) {
  console.log("No placeholders left.");
  process.exit(0);
}
console.log(`${items.length} placeholder item(s) left:\n`);
for (const { path, label } of items) console.log(`  • ${path}${label ? `  —  ${label}` : ""}`);
process.exit(1);
