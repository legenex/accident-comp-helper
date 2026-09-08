/**
 * ACH photography config.
 * -----------------------------------------------------------------
 * EVERY photo on the public site is defined here and nowhere else.
 * To swap an image, change ONLY the `id` string on that entry.
 *
 * Two supported sources:
 *
 * 1) Unsplash (default, free licence, no attribution required)
 *    Copy the id out of any Unsplash image URL, e.g.
 *    https://images.unsplash.com/photo-1541888946425-d81bb19240f5?...
 *                               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *    and paste that whole `photo-...` string as the `id`.
 *
 * 2) Your own / licensed files
 *    Drop the file in /public/img/ and set the id to an absolute path
 *    starting with a slash, e.g. id: "/img/hero-highway.jpg".
 *    Anything starting with "/" or "http" is used verbatim.
 *
 * Recommended when you buy proper stock: 2400px wide, landscape,
 * with meaningful empty space on the LEFT third (the headline sits
 * there and the subject should not fight it).
 */

const UNSPLASH = "https://images.unsplash.com/";

/** Build a responsive, cropped, auto-format URL for an image id. */
export function photo(id, { w = 1800, q = 70, ar } = {}) {
  if (!id) return "";
  if (id.startsWith("/") || id.startsWith("http")) return id;
  const crop = ar ? `&ar=${ar}&fit=crop&crop=entropy` : `&fit=crop`;
  return `${UNSPLASH}${id}?auto=format&w=${w}&q=${q}${crop}`;
}

/**
 * HERO — cross-fades slowly behind the headline with a Ken Burns drift.
 * Keep this to 3 frames; more than that and the rotation feels restless.
 * `focus` sets CSS object-position so the subject survives the crop.
 */
export const HERO_SLIDES = [
  {
    id: "photo-1597328290883-50c5787b7c7e",
    alt: "Damaged vehicle with a crushed hood at the scene of a collision",
    focus: "55% 50%",
  },
  {
    id: "photo-1662541547523-118842914aa7",
    alt: "Car with a smashed front end after an accident",
    focus: "55% 50%",
  },
  {
    id: "photo-1673187139211-1e7ec3dd60ec",
    alt: "A vehicle loaded onto a flatbed tow truck after a collision",
    focus: "55% 50%",
  },
];

/**
 * ACCIDENT TYPES — one photo per card on the home page grid.
 * Keys MUST match the `slug` values in siteContent.jsx ACCIDENT_TYPES.
 */
export const ACCIDENT_PHOTOS = {
  "auto-accidents": "photo-1503376780353-7e6692767b70",
  "truck-accidents": "photo-1502877338535-766e1452684a",
  "motorcycle-accidents": "photo-1449965408869-eaa3f722e40d",
  "workplace-injury": "photo-1436450412740-6b988f486c6b",
  "pedestrian-accidents": "photo-1444723121867-7a241cacace9",
  "rideshare-accidents": "photo-1502224562085-639556652f33",
};

/** Wide editorial band used beside the "how it works" / trust copy. */
export const SUPPORT_PHOTOS = {
  consultation: "photo-1600880292203-757bb62b4baf",
  paperwork: "photo-1554224155-6726b3ff858f",
  recovery: "photo-1576091160399-112ba8d25d1d",
  handshake: "photo-1521791136064-7986c2920216",
  team: "photo-1521737711867-e3b97375f902",
  notes: "photo-1450101499163-c8848c66ca85",
};

/**
 * PAGE HEROES — the banner photo behind the title on every inner page.
 * Keys are the route paths. Anything not listed here falls back to a
 * plain navy gradient, which is a perfectly fine default.
 */
export const PAGE_HERO_PHOTOS = {
  "/accident-types": { id: "photo-1444723121867-7a241cacace9", focus: "50% 60%" },
  "/how-it-works": { id: "photo-1454165804606-c3d57bc86b40", focus: "60% 45%" },
  "/about": { id: "photo-1521737711867-e3b97375f902", focus: "55% 40%" },
  "/resources": { id: "photo-1450101499163-c8848c66ca85", focus: "50% 50%" },
  "/blog": { id: "photo-1423666639041-f56000c27a9a", focus: "50% 45%" },
  "/faq": { id: "photo-1517048676732-d65bc937f952", focus: "55% 45%" },
  "/contact": { id: "photo-1521791136064-7986c2920216", focus: "50% 45%" },
  legal: { id: "photo-1554224155-6726b3ff858f", focus: "50% 50%" },
};

/**
 * Fallback covers for blog posts that have no `featured_image` set yet.
 * Picked deterministically from the post slug so a given article always
 * shows the same image rather than shuffling on every render.
 */
export const BLOG_FALLBACK_COVERS = [
  "photo-1450101499163-c8848c66ca85",
  "photo-1554224155-6726b3ff858f",
  "photo-1423666639041-f56000c27a9a",
  "photo-1517048676732-d65bc937f952",
  "photo-1454165804606-c3d57bc86b40",
];

/** Stable index into BLOG_FALLBACK_COVERS derived from any string key. */
export function coverFor(key = "") {
  let h = 0;
  for (let i = 0; i < key.length; i += 1) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return BLOG_FALLBACK_COVERS[h % BLOG_FALLBACK_COVERS.length];
}

/**
 * A 1px transparent GIF used as the <img> src until the real file has
 * decoded, so nothing ever pops in as a grey box.
 */
export const BLANK =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";