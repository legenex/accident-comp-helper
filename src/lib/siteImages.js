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
    id: "photo-1541888946425-d81bb19240f5",
    alt: "Traffic moving along a road at dusk",
    focus: "60% 55%",
  },
  {
    id: "photo-1502224562085-639556652f33",
    alt: "View through a rain-covered windscreen",
    focus: "55% 50%",
  },
  {
    id: "photo-1454165804606-c3d57bc86b40",
    alt: "A conversation across a desk about next steps",
    focus: "65% 45%",
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
  "slip-and-fall": "photo-1450101499163-c8848c66ca85",
  "workplace-injury": "photo-1436450412740-6b988f486c6b",
  "pedestrian-accidents": "photo-1444723121867-7a241cacace9",
  "rideshare-accidents": "photo-1502224562085-639556652f33",
  "wrongful-death": "photo-1589829545856-d10d557cf95f",
};

/** Wide editorial band used beside the "how it works" / trust copy. */
export const SUPPORT_PHOTOS = {
  consultation: "photo-1600880292203-757bb62b4baf",
  paperwork: "photo-1554224155-6726b3ff858f",
  recovery: "photo-1576091160399-112ba8d25d1d",
};

/**
 * A 1px transparent GIF used as the <img> src until the real file has
 * decoded, so nothing ever pops in as a grey box.
 */
export const BLANK =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
