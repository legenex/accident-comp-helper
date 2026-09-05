/* ------------------------------------------------------------------ *
 *  Photography used across the public site.
 *
 *  All URLs are Unsplash CDN and were verified reachable from the app
 *  sandbox. Swap any `src` for your own licensed photography later and
 *  nothing else in the codebase needs to change.
 * ------------------------------------------------------------------ */

const U = (id, w = 1600, extra = "") =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80${extra}`;

export const PHOTOS = {
  // hero
  heroBackdrop: U("1449965408869-eaa3f722e40d", 2000),
  heroConsult: U("1521791136064-7986c2920216", 900),
  heroSupport: U("1573497019940-1c28c88b4f3e", 800),

  // supporting sections
  consultation: U("1560250097-0b93528c311a", 1200),
  paperwork: U("1554224155-1696413565d3", 1200),
  recovery: U("1519085360753-af0119f7cbe7", 1200),
  roadside: U("1502877338535-766e1452684a", 1400),
  cityDrive: U("1454165804606-c3d57bc86b40", 1400),
};

/* Reviewer portraits. These are stock faces standing in for real
   reviewer photos, matching the placeholder review copy in
   socialProof.js. Replace both together when real reviews land. */
export const AVATARS = [
  { src: U("1494790108377-be9c29b29330", 160) },
  { src: U("1507003211169-0a1dd7228f2d", 160) },
  { src: U("1438761681033-6461ffad8d80", 160) },
  { src: U("1500648767791-00dcc994a43e", 160) },
  { src: U("1573496359142-b8d87734a5a2", 160) },
  { src: U("1472099645785-5658abf4ff4e", 160) },
];
