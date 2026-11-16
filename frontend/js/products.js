/* ==========================================================================
   CAP SYNDICATE · products.js
   ------------------------------------------------------------------------
   THIS IS THE FILE THE OWNER EDITS.
   1. SHOP_SETTINGS  -> contact details, promo code, countdowns, Cap of the Week
   2. DEALS          -> weekly promos, past deals, drop calendar
   3. CATEGORIES     -> shop categories (tiles + filters)
   4. PRODUCTS       -> the catalog
   Anything in [SQUARE BRACKETS] is a placeholder. Replace it before going live.
   Dates use ISO format with the Philippine offset, e.g. "2026-11-21T20:00:00+08:00".
   ========================================================================== */

/* ---------- 1. SHOP SETTINGS ---------- */
window.SHOP_SETTINGS = {
  shopName: "Cap Syndicate",
  tagline: "Built for the Streets",

  // Contact details (from the shop's Instagram). These fill every [data-setting="..."] spot on the site.
  address: "25 Gen. Luna Ave, Iloilo City Proper, Iloilo City (beside Celestial Creations)",
  hours: "Open daily, 11:30 AM to 8:00 PM [EDIT: confirm, Instagram posts list different hours]",
  phone: "0916 574 2695",
  email: "[ADD EMAIL HERE]",          // e.g. "capsyndicate.ph@gmail.com". Order emails go here.

  // Social links
  facebookUrl: "https://www.facebook.com/profile.php?id=61573261537346",
  messengerUrl: "https://m.me/61573261537346",   // swap the number for your page username if you set one
  instagramHandle: "cap_syndicate",
  instagramUrl: "https://www.instagram.com/cap_syndicate/",
  instagramDmUrl: "https://ig.me/m/cap_syndicate",

  // Google Maps search used by the map embeds
  mapQuery: "25 Gen. Luna Ave, Iloilo City Proper, Iloilo City",

  // Optional: paste a Formspree / Getform endpoint to receive contact + sign-up forms by email.
  // Leave "" and the forms open the visitor's email app instead (nothing is lost).
  formEndpoint: "",

  // Rotating bar under the header. Add, remove or reword messages freely. href is optional.
  announcements: [
    { text: "Buy 1 Get 1 and 40% off on selected pieces", href: "deals.html" },
    { text: "Cap care: reblock ₱150, deep clean ₱400", href: "products.html#services-title" },
    { text: "Visit us: 25 Gen. Luna Ave, Iloilo City", href: "contact.html" }
  ],

  // Shows a yellow "sample catalog" notice on the shop page. Turn on while the catalog is being updated.
  showSampleNotice: false,

  // Only set to true if you add analytics/tracking. It turns on the cookie consent banner.
  usesTracking: false,

  // Cap of the Week: pick a product id from the PRODUCTS list below
  capOfTheWeek: {
    productId: "cs-001",
    story: "Black '47 snapback with the Detroit Tigers script in orange and the Old English D on the side. Clean, classic, goes with everything."
  },

  // This week's main deal. Leave endsAt "" to auto-end every Sunday 11:59 PM (Philippine time).
  // Leave code "" if the promo needs no code: the promo-code boxes hide themselves.
  weeklyDeal: {
    title: "Buy 1 Get 1 + 40% off",
    description: "Daily promos on selected pieces from New Era, '47 Brand, Carhartt, Stussy and more. Limited time. Ask in store or DM us which pieces are included.",
    code: "",
    endsAt: ""
  },

  // Next drop. Leave date "" to auto-count down to next Friday 8:00 PM (Philippine time).
  nextDrop: {
    name: "[EDIT] Next drop name",
    date: "",
    description: "New caps land in store and on Instagram. Turn on drop alerts so you don't miss it."
  }
};

/* ---------- 2. DEALS & DROPS ---------- */
window.DEALS = {
  // Cards on the Weekly Deals page. style: "hot" makes one card red.
  thisWeek: [
    { style: "hot", icon: "gift", big: "Buy 1 Get 1", title: "On selected pieces", text: "Double your rotation for less. Ask in store or DM us which caps are included." },
    { style: "",    icon: "tag",  big: "40% off", title: "Big names, smaller prices", text: "Selected pieces from New Era, '47 Brand, Carhartt, Stussy, Chrome Hearts, Essentials and more." },
    { style: "",    icon: "users", big: "From ₱150", title: "Cap care services", text: "Reblock ₱150, deep clean ₱400, repaint from ₱450, customization ₱350 to ₱950." }
  ],

  // Past deals (shown with an ENDED stamp)
  past: [
    { title: "Launch week", text: "[EDIT] Free sticker with every order." },
    { title: "Snapback Saturday", text: "[EDIT] ₱100 off all snapbacks." },
    { title: "Buy 2 tees", text: "[EDIT] Second tee 50% off." },
    { title: "Rainy day sale", text: "[EDIT] 15% off bucket hats." }
  ],

  // Drop calendar. Dates are shown in the order listed.
  calendar: [
    { date: "2026-11-20", type: "Drop",  title: "[EDIT] Drop 04: Late Night Pack", text: "Three new snapback colorways." },
    { date: "2026-11-27", type: "Restock", title: "[EDIT] Fitted restock", text: "Popular fitted sizes back in." },
    { date: "2026-12-05", type: "Event", title: "[EDIT] Store blessing & opening party", text: "[ADD VENUE] Food, music, first-day freebies." },
    { date: "2026-12-11", type: "Drop",  title: "[EDIT] Holiday hoodie drop", text: "Heavyweight hoodies just in time for December." },
    { date: "2026-12-18", type: "Promo", title: "[EDIT] Christmas gift week", text: "Gift wrap and a free sticker pack on every order." },
    { date: "2027-01-08", type: "Drop",  title: "[EDIT] New year, new caps", text: "First drop of 2027." }
  ]
};

/* ---------- 3. CATEGORIES ---------- */
// id is used in links like products.html?cat=mlb. Categories with no products are hidden automatically,
// so you can add types like { id: "fitted", name: "Fitted", art: "fitted" } before stocking them.
// art picks the placeholder drawing used when a product has no photo
// (snapback, fitted, dad, bucket, tee, hoodie, accessory).
window.CATEGORIES = [
  { id: "mlb",       name: "MLB",       art: "snapback" },
  { id: "nfl",       name: "NFL",       art: "snapback" },
  { id: "college",   name: "College",   art: "snapback" },
  { id: "nhl",       name: "NHL",       art: "snapback" },
  { id: "lifestyle", name: "Lifestyle", art: "dad" }
];

/* ---------- 4. PRODUCTS ---------- */
/*
  HOW TO ADD A PRODUCT: copy one { ... } block, paste it, change the values.
  id        unique, no spaces (used in order messages)
  name      product name
  category  one of the CATEGORIES ids above
  price     regular price in pesos (number, no ₱ or commas)
  salePrice optional sale price (number) or null
  sizes     list of sizes, or ["One size / adjustable"]
  stock     "in" | "low" | "out"
  isNew     true shows a NEW badge
  added     date added (YYYY-MM-DD). Used for "Newest" sort and New Arrivals.
  images    list of photo paths, e.g. ["images/products/cap-front.jpg", "images/products/cap-side.jpg"]
            Leave [] to show a drawn placeholder in the product colors.
  color / accent   placeholder drawing colors (only used when images is empty)
  description      2-3 short lines

  The caps below come from the shop's Instagram posts (September 15, 2026).
  [EDIT] Update stock as pieces sell.
*/
window.PRODUCTS = [
  {
    id: "cs-001", name: "'47 Brand Detroit Tigers Cap", category: "mlb",
    price: 1140, salePrice: null, sizes: ["One size / adjustable"], stock: "in", isNew: false, added: "2026-09-15",
    images: ["images/products/47-detroit-tigers.jpg"], color: "#151515", accent: "#F26722",
    description: "Black snapback with the Detroit Tigers script in orange and the Old English D on the side panel."
  },
  {
    id: "cs-002", name: "'47 Brand Houston Astros Cap", category: "mlb",
    price: 1140, salePrice: null, sizes: ["One size / adjustable"], stock: "in", isNew: false, added: "2026-09-15",
    images: ["images/products/47-houston-astros.jpg"], color: "#EFE9DC", accent: "#1F2A44",
    description: "Cream crown with a navy brim. ASTROS arched over the Texas star logo and a Baseball banner."
  },
  {
    id: "cs-003", name: "'47 Brand Atlanta Falcons Cap", category: "nfl",
    price: 1140, salePrice: null, sizes: ["One size / adjustable"], stock: "in", isNew: false, added: "2026-09-15",
    images: ["images/products/47-atlanta-falcons.jpg"], color: "#151515", accent: "#D8CFA8",
    description: "Black snapback with ATLANTA FALCONS arched in cream over the falcon logo."
  },
  {
    id: "cs-004", name: "'47 Brand Washington Commanders Rope Cap", category: "nfl",
    price: 1140, salePrice: null, sizes: ["One size / adjustable"], stock: "in", isNew: false, added: "2026-09-15",
    images: ["images/products/47-washington-commanders-rope.jpg"], color: "#7A735C", accent: "#F2E3A6",
    description: "Olive crown with a cream rope across the front. Washington Commanders, Est. 1932, around the W logo."
  },
  {
    id: "cs-005", name: "'47 Brand Las Vegas Raiders Cap", category: "nfl",
    price: 1140, salePrice: null, sizes: ["One size / adjustable"], stock: "in", isNew: false, added: "2026-09-15",
    images: ["images/products/47-las-vegas-raiders.jpg"], color: "#151515", accent: "#E5E5E5",
    description: "All-black structured cap with the Raiders shield in white and silver. Curved brim."
  },
  {
    id: "cs-006", name: "'47 Brand Vegas Golden Knights Corduroy Cap", category: "nhl",
    price: 1140, salePrice: null, sizes: ["One size / adjustable"], stock: "in", isNew: false, added: "2026-09-15",
    images: ["images/products/47-vegas-golden-knights-corduroy.jpg"], color: "#E3D19A", accent: "#3A3A3A",
    description: "Gold corduroy crown with a gray corduroy brim. Vegas Golden Knights shield between laurels, 20 17."
  },
  {
    id: "cs-007", name: "'47 Brand Hitch Nebraska Cornhuskers Rope Cap", category: "college",
    price: 1140, salePrice: null, sizes: ["One size / adjustable"], stock: "in", isNew: false, added: "2026-09-15",
    images: ["images/products/47-nebraska-hitch-rope.jpg"], color: "#EFE6CF", accent: "#D00000",
    description: "Cream crown, red brim and red rope. Cornhuskers Nebraska with the N over a green field graphic."
  },
  {
    id: "cs-008", name: "'47 Brand Corduroy Cap \"St. Paul\"", category: "lifestyle",
    price: 1140, salePrice: null, sizes: ["One size / adjustable"], stock: "in", isNew: false, added: "2026-09-15",
    images: ["images/products/47-st-paul-corduroy.jpg"], color: "#6B7488", accent: "#EFE6CF",
    description: "Washed blue-gray corduroy with ST. PAUL stitched in cream. Soft, worn-in look."
  },
  {
    id: "cs-009", name: "'47 Brand Atlanta Braves Rope Cap", category: "mlb",
    price: 1140, salePrice: null, sizes: ["One size / adjustable"], stock: "in", isNew: false, added: "2026-09-15",
    images: ["images/products/47-atlanta-braves-rope.jpg"], color: "#1C2333", accent: "#EFE6CF",
    description: "Navy crown with a cream rope. BRAVES arched over a stars-and-stripes A."
  },
  {
    id: "cs-010", name: "'47 Brand Florida Gators Rope Cap", category: "college",
    price: 1140, salePrice: null, sizes: ["One size / adjustable"], stock: "in", isNew: false, added: "2026-09-15",
    images: ["images/products/47-florida-gators-rope.jpg"], color: "#F2F2F2", accent: "#0021A5",
    description: "White crown, royal blue brim and white rope. Gators Florida in an orange-to-blue fade over the gator head."
  }
];
