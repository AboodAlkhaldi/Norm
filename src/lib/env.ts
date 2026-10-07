/**
 * Environment flags. See .env.example.
 * NEXT_PUBLIC_NOINDEX — "false" lets search engines index the site. Anything else
 * (including unset) keeps noindex ON, which is the default until launch.
 */
export const NOINDEX = process.env.NEXT_PUBLIC_NOINDEX !== "false";
