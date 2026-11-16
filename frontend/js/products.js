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

  // Contact details. These fill every [data-setting="..."] spot on the site.
  address: "[ADD ADDRESS HERE], Iloilo City, Philippines",
  hours: "[ADD STORE HOURS HERE]",
  phone: "[ADD PHONE NUMBER HERE]",
  email: "[ADD EMAIL HERE]",          // e.g. "capsyndicate.ph@gmail.com". Order emails go here.

  // Social links
  facebookUrl: "https://www.facebook.com/profile.php?id=61573261537346",
  messengerUrl: "https://m.me/61573261537346",   // swap the number for your page username if you set one
  instagramHandle: "cap_syndicate",
  instagramUrl: "https://www.instagram.com/cap_syndicate/",
  instagramDmUrl: "https://ig.me/m/cap_syndicate",

  // Google Maps search used by the map embeds. Put your exact address here once the store opens.
  mapQuery: "Iloilo City, Philippines",

  // Optional: paste a Formspree / Getform endpoint to receive contact + sign-up forms by email.
  // Leave "" and the forms open the visitor's email app instead (nothing is lost).
  formEndpoint: "",

  // Shows a yellow "sample catalog" notice on the shop page. Set to false once real photos/prices are in.
  showSampleNotice: true,

  // Only set to true if you add analytics/tracking. It turns on the cookie consent banner.
  usesTracking: false,

  // Cap of the Week: pick a product id from the PRODUCTS list below
  capOfTheWeek: {
    productId: "cs-001",
    story: "[EDIT] Our go-to all-black snapback with the red stitch. Flat brim, stiff front, sits right on the first try. It's the one the crew grabs on the way out the door."
  },

  // This week's main deal. Leave endsAt "" to auto-end every Sunday 11:59 PM (Philippine time).
  weeklyDeal: {
    title: "10% off all caps",
    description: "Use the code when you message your order. Valid on every cap in the shop this week.",
    code: "SYNDICATE10",               // [EDIT] change every week
    endsAt: ""
  },

  // Next drop. Leave date "" to auto-count down to next Friday 8:00 PM (Philippine time).
  nextDrop: {
    name: "[EDIT] Drop 04: Late Night Pack",
    date: "",
    description: "Three new colorways. Limited pieces each. Turn on drop alerts so you don't miss it."
  }
};

/* ---------- 2. DEALS & DROPS ---------- */
window.DEALS = {
  // Cards on the Weekly Deals page. style: "hot" makes one card red.
  thisWeek: [
    { style: "hot", icon: "tag",  big: "10% off", title: "All caps this week", text: "Message your order with the promo code. Discount applies to every cap in stock." },
    { style: "",    icon: "gift", big: "Free",    title: "Sticker pack with any cap", text: "Every cap order this week comes with a Cap Syndicate sticker pack. While supplies last." },
    { style: "",    icon: "users", big: "2 for ₱1,300", title: "Barkada bundle", text: "[EDIT] Any two dad caps for ₱1,300. Mix colors. Bring the crew." }
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
// id is used in links like products.html?cat=snapback. art picks the placeholder drawing.
window.CATEGORIES = [
  { id: "snapback",  name: "Snapbacks",   art: "snapback" },
  { id: "fitted",    name: "Fitted",      art: "fitted" },
  { id: "dad-cap",   name: "Dad Caps",    art: "dad" },
  { id: "bucket",    name: "Bucket Hats", art: "bucket" },
  { id: "shirt",     name: "Shirts",      art: "tee" },
  { id: "hoodie",    name: "Hoodies",     art: "hoodie" },
  { id: "accessory", name: "Accessories", art: "accessory" }
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
  images    list of photo paths, e.g. ["images/products/block-captain-1.jpg", "images/products/block-captain-2.jpg"]
            Leave [] to show a drawn placeholder in the product colors.
  color / accent   placeholder drawing colors (only used when images is empty)
  description      2-3 short lines

  SAMPLE DATA: names, prices and stock below are examples. Replace with the real catalog.
*/
window.PRODUCTS = [
  {
    id: "cs-001", name: "Block Captain Snapback", category: "snapback",
    price: 750, salePrice: null, sizes: ["One size / adjustable"], stock: "in", isNew: true, added: "2026-11-14",
    images: [], color: "#151515", accent: "#B3121B",
    description: "All-black six-panel snapback with a red embroidered CS on the front. Flat brim, structured crown, plastic snap closure."
  },
  {
    id: "cs-002", name: "Red Light Snapback", category: "snapback",
    price: 780, salePrice: null, sizes: ["One size / adjustable"], stock: "low", isNew: true, added: "2026-11-12",
    images: [], color: "#B3121B", accent: "#FFFFFF",
    description: "Street Red crown with white stitching. Loud on purpose. Flat brim, green under-visor, snap closure."
  },
  {
    id: "cs-003", name: "Concrete Snapback", category: "snapback",
    price: 720, salePrice: 650, sizes: ["One size / adjustable"], stock: "in", isNew: false, added: "2026-10-20",
    images: [], color: "#6E6E6E", accent: "#111111",
    description: "Concrete gray wool-blend snapback with a black tonal logo. Goes with every fit you own."
  },
  {
    id: "cs-004", name: "Syndicate Script Fitted", category: "fitted",
    price: 1150, salePrice: null, sizes: ["7", "7 1/8", "7 1/4", "7 3/8", "7 1/2", "7 5/8"], stock: "in", isNew: true, added: "2026-11-10",
    images: [], color: "#121212", accent: "#E8737A",
    description: "Fitted cap with the Syndicate script across the front in a red-to-white fade. Closed back, high crown. Check the size guide before you order."
  },
  {
    id: "cs-005", name: "Night Shift Fitted", category: "fitted",
    price: 1100, salePrice: null, sizes: ["7", "7 1/8", "7 1/4", "7 3/8", "7 1/2"], stock: "low", isNew: false, added: "2026-10-28",
    images: [], color: "#1E2A44", accent: "#FFFFFF",
    description: "Midnight navy fitted with a small white CS hit. Clean enough for school, sharp enough for the weekend."
  },
  {
    id: "cs-006", name: "Crimson Fitted", category: "fitted",
    price: 1200, salePrice: null, sizes: ["7 1/8", "7 1/4", "7 3/8"], stock: "out", isNew: false, added: "2026-10-05",
    images: [], color: "#7A0C12", accent: "#FFFFFF",
    description: "Deep Red fitted, the first one we ever dropped. Sold out for now. Message us to get on the restock list."
  },
  {
    id: "cs-007", name: "Late Night Dad Cap", category: "dad-cap",
    price: 590, salePrice: null, sizes: ["One size / adjustable"], stock: "in", isNew: true, added: "2026-11-08",
    images: [], color: "#1A1A1A", accent: "#FFFFFF",
    description: "Soft unstructured cotton dad cap in black. Curved brim, metal buckle strap. Gets better the more you wear it."
  },
  {
    id: "cs-008", name: "Washed Red Dad Cap", category: "dad-cap",
    price: 620, salePrice: null, sizes: ["One size / adjustable"], stock: "in", isNew: false, added: "2026-10-22",
    images: [], color: "#8C1D24", accent: "#F2F2F2",
    description: "Garment-washed red dad cap with a faded, broken-in look from day one. Buckle strap."
  },
  {
    id: "cs-009", name: "Sand Dad Cap", category: "dad-cap",
    price: 590, salePrice: null, sizes: ["One size / adjustable"], stock: "low", isNew: false, added: "2026-10-15",
    images: [], color: "#C8B89A", accent: "#111111",
    description: "Light sand dad cap with a black CS. The easy pick for hot days and light-colored fits."
  },
  {
    id: "cs-010", name: "Rain Check Bucket Hat", category: "bucket",
    price: 690, salePrice: null, sizes: ["S/M", "L/XL"], stock: "in", isNew: true, added: "2026-11-05",
    images: [], color: "#161616", accent: "#B3121B",
    description: "Black nylon bucket hat that shrugs off light rain. Red woven tab on the side. Packs flat."
  },
  {
    id: "cs-011", name: "Reversible Bucket Hat", category: "bucket",
    price: 790, salePrice: null, sizes: ["S/M", "L/XL"], stock: "out", isNew: false, added: "2026-09-30",
    images: [], color: "#B3121B", accent: "#111111",
    description: "Red on one side, black on the other. Two hats, one price. Sold out, restock coming."
  },
  {
    id: "cs-012", name: "Crew Logo Tee - Black", category: "shirt",
    price: 599, salePrice: null, sizes: ["S", "M", "L", "XL", "2XL"], stock: "in", isNew: false, added: "2026-10-18",
    images: [], color: "#151515", accent: "#B3121B",
    description: "Heavyweight cotton tee with the Cap Syndicate script on the chest. Boxy fit, drops at the shoulder."
  },
  {
    id: "cs-013", name: "Built for the Streets Tee - White", category: "shirt",
    price: 599, salePrice: 499, sizes: ["S", "M", "L", "XL"], stock: "low", isNew: false, added: "2026-10-12",
    images: [], color: "#EDEDED", accent: "#B3121B",
    description: "White tee with BUILT FOR THE STREETS across the back. Boxy fit, heavyweight cotton."
  },
  {
    id: "cs-014", name: "Syndicate Heavyweight Hoodie", category: "hoodie",
    price: 1650, salePrice: null, sizes: ["S", "M", "L", "XL"], stock: "in", isNew: true, added: "2026-11-02",
    images: [], color: "#141414", accent: "#E8737A",
    description: "Thick fleece pullover hoodie with a gradient Syndicate print. Double-layer hood, kangaroo pocket."
  },
  {
    id: "cs-015", name: "Block Zip Hoodie - Gray", category: "hoodie",
    price: 1790, salePrice: null, sizes: ["M", "L", "XL"], stock: "low", isNew: false, added: "2026-10-08",
    images: [], color: "#5E5E5E", accent: "#FFFFFF",
    description: "Concrete gray full-zip hoodie with a small chest logo. Made for aircon malls and late rides home."
  },
  {
    id: "cs-016", name: "Sticker Pack Vol. 1", category: "accessory",
    price: 120, salePrice: null, sizes: ["One size"], stock: "in", isNew: false, added: "2026-10-01",
    images: [], color: "#B3121B", accent: "#FFFFFF",
    description: "Six waterproof vinyl stickers. Slap them on your laptop, helmet or tumbler."
  },
  {
    id: "cs-017", name: "Cap Clip Strap", category: "accessory",
    price: 180, salePrice: null, sizes: ["One size"], stock: "in", isNew: false, added: "2026-10-03",
    images: [], color: "#1B1B1B", accent: "#B3121B",
    description: "Clip your cap to your bag so it keeps its shape and leaves your hands free."
  },
  {
    id: "cs-018", name: "Cap Care Kit", category: "accessory",
    price: 350, salePrice: null, sizes: ["One size"], stock: "low", isNew: false, added: "2026-10-10",
    images: [], color: "#2A2A2A", accent: "#FFFFFF",
    description: "Soft brush, gentle cleaner and a crown shaper. Everything in our cap cleaning guide, in one box."
  }
];
