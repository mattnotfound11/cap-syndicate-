/* ==========================================================================
   CAP SYNDICATE · main.js
   Vanilla JS, no libraries. Content lives in js/products.js.
   Sections:
     1. Helpers           6. Product modal        11. Forms
     2. Settings binding  7. Order list (cart)    12. Cookie notice
     3. Icons + art       8. Countdowns           13. Reveal on scroll
     4. Product cards     9. Promo code copy      14. Boot
     5. Page renderers   10. Navigation drawer
   Security: any text that came from a visitor (search, form fields, saved
   order list) is written with textContent or escaped with esc().
   ========================================================================== */
(() => {
  "use strict";
  document.documentElement.classList.add("js");

  /* ---------- 1. Helpers ---------- */
  const S = window.SHOP_SETTINGS || {};
  const PRODUCTS = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
  const CATS = Array.isArray(window.CATEGORIES) ? window.CATEGORIES : [];
  const DEALS = window.DEALS || { thisWeek: [], past: [], calendar: [] };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ESC[c]);
  const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });
  const money = (n) => peso.format(Number(n) || 0);
  const isPlaceholder = (v) => !v || /\[(ADD|EDIT)[^\]]*\]/i.test(String(v));
  const validEmail = (v) => /^[^\s@<>()]+@[^\s@<>()]+\.[a-z]{2,}$/i.test(String(v || "").trim());
  const catName = (id) => (CATS.find((c) => c.id === id) || {}).name || id;
  const activeCats = () => CATS.filter((c) => PRODUCTS.some((p) => p.category === c.id));
  const catArt = (id) => (CATS.find((c) => c.id === id) || {}).art || "snapback";
  const findProduct = (id) => PRODUCTS.find((p) => p.id === id);
  const onSale = (p) => typeof p.salePrice === "number" && p.salePrice < p.price;
  const priceNow = (p) => (onSale(p) ? p.salePrice : p.price);
  const STOCK = {
    in: { label: "In Stock", cls: "in" },
    low: { label: "Low Stock", cls: "low" },
    out: { label: "Sold Out", cls: "out" }
  };
  const safeColor = (c, fallback) => (/^#[0-9a-f]{3,8}$/i.test(String(c)) ? c : fallback);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
      catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode: ignore */ }
    }
  };

  let toastTimer;
  function toast(message) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 3200);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(() => true, () => legacyCopy(text));
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.className = "sr-only";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    ta.remove();
    return ok;
  }

  function openExternal(url) {
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w) window.location.href = url;
  }

  /* Philippine time (UTC+8, no daylight saving) */
  const PH_OFFSET = 8 * 3600 * 1000;
  const phParts = (ts) => {
    const d = new Date(ts + PH_OFFSET);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), dow: d.getUTCDay() };
  };
  const phTime = (y, m, d, h, mi, s) => Date.UTC(y, m, d, h, mi, s) - PH_OFFSET;
  function endOfWeek(now = Date.now()) {
    const p = phParts(now);
    return phTime(p.y, p.m, p.d + ((7 - p.dow) % 7), 23, 59, 59);
  }
  function nextFriday8pm(now = Date.now()) {
    const p = phParts(now);
    const add = (5 - p.dow + 7) % 7;
    let t = phTime(p.y, p.m, p.d + add, 20, 0, 0);
    if (t <= now) t = phTime(p.y, p.m, p.d + add + 7, 20, 0, 0);
    return t;
  }
  const parseTime = (v) => { const t = Date.parse(v); return Number.isFinite(t) ? t : NaN; };
  const dealEnd = () => { const t = parseTime((S.weeklyDeal || {}).endsAt); return t > Date.now() ? t : endOfWeek(); };
  const dropTime = () => { const t = parseTime((S.nextDrop || {}).date); return t > Date.now() ? t : nextFriday8pm(); };
  const fmtLong = new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  /* ---------- 2. Settings binding ---------- */
  function bindSettings() {
    $$("[data-setting]").forEach((el) => {
      const value = S[el.dataset.setting];
      if (typeof value !== "string") return;
      el.textContent = value;
      el.classList.toggle("ph", isPlaceholder(value));
    });

    const links = {
      facebook: S.facebookUrl,
      messenger: S.messengerUrl,
      instagram: S.instagramUrl,
      instagramDm: S.instagramDmUrl,
      email: validEmail(S.email) ? `mailto:${S.email.trim()}` : "",
      phone: /\d{7,}/.test(String(S.phone).replace(/\D/g, "")) ? `tel:${String(S.phone).replace(/[^\d+]/g, "")}` : ""
    };
    $$("[data-href]").forEach((a) => {
      const url = links[a.dataset.href];
      if (url) a.href = url;
    });

    const deal = S.weeklyDeal || {};
    $$("[data-promo-code]").forEach((el) => {
      el.textContent = deal.code || "";
      // No code this week: hide the code box (and its copy button) instead of showing an empty one
      const box = el.closest(".promo-box") || el.closest(".promo-row");
      if (box) box.hidden = !deal.code;
    });
    $$("[data-deal-title]").forEach((el) => { el.textContent = deal.title || ""; });
    $$("[data-deal-desc]").forEach((el) => { el.textContent = deal.description || ""; });
    $$("[data-drop-name]").forEach((el) => {
      el.textContent = (S.nextDrop || {}).name || "";
      el.classList.toggle("ph", isPlaceholder((S.nextDrop || {}).name));
    });
    $$("[data-drop-desc]").forEach((el) => { el.textContent = (S.nextDrop || {}).description || ""; });

    setupAnnouncements();

    $$("iframe[data-map]").forEach((frame) => {
      const q = encodeURIComponent(S.mapQuery || "Iloilo City, Philippines");
      frame.src = `https://www.google.com/maps?q=${q}&output=embed`;
    });
    $$("[data-map-link]").forEach((a) => {
      a.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(S.mapQuery || "Iloilo City")}`;
    });
  }

  /* Rotating announcement bar under the header. Messages: SHOP_SETTINGS.announcements,
     or a default built from the weekly deal. Arrows always work; auto-rotate stops for reduced motion. */
  function setupAnnouncements() {
    const el = $("[data-topbar]");
    if (!el) return;
    const deal = S.weeklyDeal || {};
    const list = Array.isArray(S.announcements) && S.announcements.length
      ? S.announcements
      : [{ text: `Use code ${deal.code || ""} for ${String(deal.title || "a discount").toLowerCase()}`, href: "deals.html" }];
    let i = 0;
    let timer;
    const show = (n) => {
      i = (n + list.length) % list.length;
      const msg = list[i];
      el.textContent = "";
      if (msg.href) {
        const a = document.createElement("a");
        a.href = msg.href;
        a.textContent = msg.text;
        el.append(a);
      } else {
        el.textContent = msg.text;
      }
    };
    const restart = () => {
      clearInterval(timer);
      if (!reducedMotion && list.length > 1) timer = setInterval(() => show(i + 1), 5500);
    };
    $("[data-topbar-prev]")?.addEventListener("click", () => { show(i - 1); restart(); });
    $("[data-topbar-next]")?.addEventListener("click", () => { show(i + 1); restart(); });
    if (list.length < 2) $$(".topbar-btn").forEach((b) => { b.hidden = true; });
    show(0);
    restart();
  }

  /* ---------- 3. Icons + placeholder art ---------- */
  const icon = (name, cls = "") => `<svg class="icon ${cls}" aria-hidden="true" focusable="false"><use href="#i-${name}"></use></svg>`;

  /* Neutral drawn placeholders shown until the owner adds real photos. */
  const SHAPES = {
    snapback: (c, a) => `
      <path d="M92 300C92 186 146 136 200 136s108 50 108 164Z" fill="${c}"/>
      <path d="M118 290C112 220 140 168 186 150" fill="none" stroke="#fff" stroke-opacity=".1" stroke-width="10" stroke-linecap="round"/>
      <path d="M200 140c-22 38-36 98-40 160M200 140c22 38 36 98 40 160" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="3"/>
      <circle cx="200" cy="138" r="9" fill="${c}" stroke="#000" stroke-opacity=".35" stroke-width="2"/>
      <path d="M58 300q142-14 284 0l8 18q-150 22-300 0Z" fill="${c}"/>
      <path d="M58 300q142-14 284 0l8 18q-150 22-300 0Z" fill="#000" fill-opacity=".3"/>
      <text x="200" y="256" text-anchor="middle" font-family="Permanent Marker, cursive" font-size="46" fill="${a}">CS</text>`,
    fitted: (c, a) => `
      <path d="M96 302C96 178 148 126 200 126s104 52 104 176Z" fill="${c}"/>
      <path d="M120 292C114 216 142 160 186 141" fill="none" stroke="#fff" stroke-opacity=".1" stroke-width="10" stroke-linecap="round"/>
      <path d="M200 130c-22 40-36 104-40 172M200 130c22 40 36 104 40 172" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="3"/>
      <circle cx="200" cy="128" r="9" fill="${c}" stroke="#000" stroke-opacity=".35" stroke-width="2"/>
      <path d="M60 302q140-14 280 0l8 18q-148 22-296 0Z" fill="${c}"/>
      <path d="M60 302q140-14 280 0l8 18q-148 22-296 0Z" fill="#000" fill-opacity=".3"/>
      <text x="200" y="252" text-anchor="middle" font-family="Permanent Marker, cursive" font-size="34" fill="${a}">Syndicate</text>`,
    dad: (c, a) => `
      <path d="M104 300c0-90 46-128 96-128s96 38 96 128Z" fill="${c}"/>
      <path d="M128 292c-4-56 18-92 58-104" fill="none" stroke="#fff" stroke-opacity=".1" stroke-width="10" stroke-linecap="round"/>
      <path d="M200 175c-18 30-28 72-30 125M200 175c18 30 28 72 30 125" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="3"/>
      <circle cx="200" cy="174" r="8" fill="${c}" stroke="#000" stroke-opacity=".35" stroke-width="2"/>
      <path d="M70 296q130-26 260 0 6 34-130 56-136-22-130-56Z" fill="${c}"/>
      <path d="M70 296q130-26 260 0 6 34-130 56-136-22-130-56Z" fill="#000" fill-opacity=".28"/>
      <text x="200" y="266" text-anchor="middle" font-family="Permanent Marker, cursive" font-size="38" fill="${a}">CS</text>`,
    bucket: (c, a) => `
      <path d="M128 296l16-110q56-20 112 0l16 110Z" fill="${c}"/>
      <path d="M150 288l10-92" stroke="#fff" stroke-opacity=".1" stroke-width="10" stroke-linecap="round"/>
      <path d="M70 290q130-22 260 0l26 44q-156 28-312 0Z" fill="${c}"/>
      <path d="M70 290q130-22 260 0l26 44q-156 28-312 0Z" fill="#000" fill-opacity=".3"/>
      <path d="M128 296q72-12 144 0" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="3"/>
      <rect x="258" y="236" width="14" height="26" fill="${a}"/>
      <text x="200" y="258" text-anchor="middle" font-family="Permanent Marker, cursive" font-size="34" fill="${a}">CS</text>`,
    tee: (c, a) => `
      <path d="M146 130l-42 12-52 54 40 44 28-24v176h160V216l28 24 40-44-52-54-42-12q-54 38-108 0Z" fill="${c}"/>
      <path d="M146 130q54 38 108 0" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="5"/>
      <path d="M120 216v176" stroke="#000" stroke-opacity=".12" stroke-width="6"/>
      <text x="200" y="250" text-anchor="middle" font-family="Permanent Marker, cursive" font-size="44" fill="${a}">CS</text>`,
    hoodie: (c, a) => `
      <path d="M132 158l-48 26-28 154 42 6 20-108v162h164V236l20 108 42-6-28-154-48-26Z" fill="${c}"/>
      <path d="M146 160q54-74 108 0-54 26-108 0Z" fill="${c}"/>
      <path d="M146 160q54-74 108 0-54 26-108 0Z" fill="#000" fill-opacity=".3"/>
      <path d="M150 320h100l12 50H138Z" fill="#000" fill-opacity=".2"/>
      <path d="M186 172v44M214 172v44" stroke="${a}" stroke-width="3" stroke-linecap="round"/>
      <text x="200" y="290" text-anchor="middle" font-family="Permanent Marker, cursive" font-size="40" fill="${a}">CS</text>`,
    accessory: (c, a) => `
      <g transform="rotate(-7 200 260)">
        <rect x="112" y="150" width="176" height="220" rx="10" fill="#EDEDED"/>
        <circle cx="160" cy="205" r="30" fill="${c}"/>
        <circle cx="240" cy="205" r="30" fill="#111"/>
        <rect x="132" y="252" width="136" height="44" rx="6" fill="${c}"/>
        <circle cx="160" cy="330" r="24" fill="#111"/>
        <circle cx="240" cy="330" r="24" fill="${c}"/>
        <text x="160" y="214" text-anchor="middle" font-family="Permanent Marker, cursive" font-size="22" fill="${a}">CS</text>
        <text x="240" y="214" text-anchor="middle" font-family="Permanent Marker, cursive" font-size="22" fill="#B3121B">CS</text>
        <text x="200" y="281" text-anchor="middle" font-family="Bebas Neue, sans-serif" font-size="20" fill="${a}">SYNDICATE</text>
      </g>`
  };

  /* view: 0 = front, 1 = mirrored, 2 = close-up of the logo */
  function artSVG(type, color, accent, { label = "", view = 0, bg = true, cls = "", decorative = false } = {}) {
    const c = safeColor(color, "#1a1a1a");
    const a = safeColor(accent, "#B3121B");
    const shape = (SHAPES[type] || SHAPES.snapback)(c, a);
    const transforms = ["", "translate(400 0) scale(-1 1)", "translate(-200 -260) scale(2)"];
    const a11y = decorative || !label ? 'aria-hidden="true"' : `role="img" aria-label="${esc(label)}"`;
    return `<svg class="${cls}" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" ${a11y} focusable="false">
      ${bg ? '<rect width="400" height="500" fill="#1b1b1b"/><rect width="400" height="500" fill="url(#g-floor)"/>' : ""}
      <ellipse cx="200" cy="${type === "tee" || type === "hoodie" ? 420 : 392}" rx="130" ry="12" fill="#000" fill-opacity=".35"/>
      <g transform="${transforms[view] || ""}">${shape}</g>
      ${bg && label ? '<text x="200" y="474" text-anchor="middle" font-family="Poppins, sans-serif" font-size="12" letter-spacing="3" fill="#8A8A8A">PHOTO COMING SOON</text>' : ""}
    </svg>`;
  }

  /* Media for a product: real photo if provided, drawn placeholder otherwise */
  function productMedia(p, index = 0, { eager = false } = {}) {
    const imgs = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
    if (imgs.length) {
      const src = imgs[Math.min(index, imgs.length - 1)];
      return `<img src="${esc(src)}" alt="${esc(p.name)}${index ? ` (photo ${index + 1})` : ""}" width="800" height="1000" ${eager ? "" : 'loading="lazy"'} decoding="async">`;
    }
    const views = ["front", "side", "logo close-up"];
    return artSVG(catArt(p.category), p.color, p.accent, { label: `${p.name}, placeholder drawing (${views[index] || "front"})`, view: index });
  }
  const galleryCount = (p) => (Array.isArray(p.images) && p.images.filter(Boolean).length) || 3;

  /* ---------- 4. Product cards ---------- */
  function badgesHTML(p) {
    const st = STOCK[p.stock] || STOCK.in;
    let html = `<span class="badge badge--${st.cls}">${st.label}</span>`;
    if (p.isNew && p.stock !== "out") html = `<span class="badge badge--new">New</span>` + html;
    if (onSale(p) && p.stock !== "out") html += `<span class="badge badge--sale">Sale</span>`;
    return html;
  }
  function priceHTML(p) {
    return onSale(p)
      ? `<span class="now">${money(p.salePrice)}</span><s aria-label="Was ${money(p.price)}">${money(p.price)}</s>`
      : `<span class="now">${money(p.price)}</span>`;
  }
  const sizesText = (p) => (p.sizes || []).length > 1 ? `Sizes: ${p.sizes.join(", ")}` : (p.sizes || ["One size"])[0];

  function cardHTML(p) {
    const out = p.stock === "out";
    return `<article class="p-card${out ? " is-out" : ""}">
      <button class="p-media" type="button" tabindex="-1" data-open-product="${esc(p.id)}" aria-label="View details: ${esc(p.name)}">
        <span class="p-badges">${badgesHTML(p)}</span>
        ${productMedia(p)}
      </button>
      <div class="p-info">
        <span class="p-cat">${esc(catName(p.category))}</span>
        <h3 class="p-name"><a href="products.html?item=${encodeURIComponent(p.id)}" data-open-product="${esc(p.id)}">${esc(p.name)}</a></h3>
        <p class="p-price">${priceHTML(p)}</p>
        <p class="p-sizes">${esc(sizesText(p))}</p>
      </div>
      <button class="btn ${out ? "btn--ghost" : "btn--primary"} btn--sm btn--block" type="button" data-open-product="${esc(p.id)}">${out ? "Ask for restock" : "Inquire / Order"}</button>
    </article>`;
  }
  /* --i (stagger index) is set via CSSOM so the CSP can keep blocking inline style attributes */
  function renderCards(container, list) {
    container.innerHTML = list.map(cardHTML).join("");
    $$(".p-card", container).forEach((el, i) => el.style.setProperty("--i", i % 8));
  }

  /* ---------- 5. Page renderers ---------- */
  function renderHome() {
    const cotwEl = $("#cotw");
    if (cotwEl) {
      const cfg = S.capOfTheWeek || {};
      const p = findProduct(cfg.productId) || PRODUCTS[0];
      if (p) {
        $("[data-cotw-media]", cotwEl).innerHTML = `<button class="p-media" type="button" data-open-product="${esc(p.id)}" aria-label="View details: ${esc(p.name)}"><span class="p-badges">${badgesHTML(p)}</span>${productMedia(p, 0, { eager: true })}</button>`;
        $("[data-cotw-name]", cotwEl).textContent = p.name;
        $("[data-cotw-cat]", cotwEl).textContent = catName(p.category);
        $("[data-cotw-price]", cotwEl).innerHTML = priceHTML(p);
        $("[data-cotw-story]", cotwEl).textContent = cfg.story || p.description;
        $$("[data-cotw-open]", cotwEl).forEach((b) => { b.dataset.openProduct = p.id; });
        $$("[data-cotw-add]", cotwEl).forEach((b) => { b.dataset.quickAdd = p.id; b.hidden = p.stock === "out" || (p.sizes || []).length > 1; });
      }
    }

    const arrivals = $("#new-arrivals");
    if (arrivals) {
      const list = [...PRODUCTS].sort((a, b) => String(b.added).localeCompare(String(a.added))).slice(0, 4);
      renderCards(arrivals, list);
    }

    const tiles = $("#category-tiles");
    if (tiles) {
      /* Only categories that have products, on a 12-column grid with no empty cells:
         up to 4 share one row; otherwise the first row takes 2 (or 4) tiles so the rest fill rows of 3.
         Mobile is 2 across, with the first tile full width when the count is odd. */
      const cats = activeCats();
      const n = cats.length;
      const firstRow = n <= 4 ? n : n % 3 === 2 ? 2 : n % 3 === 1 ? 4 : 3;
      const spans = cats.map((_, i) => (i < firstRow ? 12 / firstRow : 4));
      tiles.innerHTML = cats.map((c, i) => {
        const items = PRODUCTS.filter((p) => p.category === c.id);
        const photo = items.map((p) => (Array.isArray(p.images) ? p.images[0] : "")).find(Boolean);
        const media = photo
          ? `<img class="cat-photo" src="${esc(photo)}" alt="" loading="lazy" decoding="async">`
          : artSVG(c.art, i % 2 ? "#262626" : "#B3121B", i % 2 ? "#B3121B" : "#ffffff", { bg: false, cls: "cat-art", decorative: true });
        return `<a class="cat-tile${spans[i] >= 6 ? " cat-tile--lg" : ""}" href="products.html?cat=${encodeURIComponent(c.id)}">
          ${media}
          <span class="cat-label"><h3>${esc(c.name)}</h3><span class="count">${items.length} ${items.length === 1 ? "item" : "items"}</span></span>
        </a>`;
      }).join("");
      $$(".cat-tile", tiles).forEach((el, i) => {
        el.style.setProperty("--span", spans[i]);
        el.style.setProperty("--span-m", n % 2 && i === 0 ? 2 : 1);
      });
      $$("svg.cat-art", tiles).forEach((svg) => svg.setAttribute("preserveAspectRatio", "xMidYMin meet"));
    }
  }

  function renderShop() {
    const grid = $("#product-grid");
    if (!grid) return;
    const params = new URLSearchParams(location.search);
    const PRICE = { all: [0, Infinity], u600: [0, 599], "600-1000": [600, 1000], "1000-1500": [1001, 1500], "1500+": [1501, Infinity] };
    const SORTS = ["newest", "price-asc", "price-desc"];
    const state = {
      cat: CATS.some((c) => c.id === params.get("cat")) ? params.get("cat") : "all",
      q: (params.get("q") || "").slice(0, 60),
      price: PRICE[params.get("price")] ? params.get("price") : "all",
      sort: SORTS.includes(params.get("sort")) ? params.get("sort") : "newest"
    };

    const chips = $("#category-chips");
    const search = $("#shop-search");
    const priceSel = $("#price-filter");
    const sortSel = $("#sort-filter");
    const meta = $("#results-count");
    const empty = $("#empty-state");

    chips.innerHTML = [{ id: "all", name: "All" }, ...activeCats()].map((c) => {
      const n = c.id === "all" ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === c.id).length;
      return `<button class="chip" type="button" data-cat="${esc(c.id)}" aria-pressed="false">${esc(c.name)} <span class="muted">(${n})</span></button>`;
    }).join("");

    search.value = state.q;
    priceSel.value = state.price;
    sortSel.value = state.sort;

    function apply() {
      const q = state.q.trim().toLowerCase();
      const [min, max] = PRICE[state.price];
      let list = PRODUCTS.filter((p) =>
        (state.cat === "all" || p.category === state.cat) &&
        priceNow(p) >= min && priceNow(p) <= max &&
        (!q || `${p.name} ${catName(p.category)} ${p.description}`.toLowerCase().includes(q))
      );
      if (state.sort === "price-asc") list.sort((a, b) => priceNow(a) - priceNow(b));
      else if (state.sort === "price-desc") list.sort((a, b) => priceNow(b) - priceNow(a));
      else list.sort((a, b) => String(b.added).localeCompare(String(a.added)));

      $$(".chip", chips).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cat === state.cat)));
      renderCards(grid, list);
      grid.hidden = !list.length;
      empty.hidden = !!list.length;
      if (!list.length) $("[data-empty-query]", empty).textContent = state.q ? `Nothing matches "${state.q}".` : "Nothing matches those filters.";
      meta.textContent = `Showing ${list.length} of ${PRODUCTS.length} items`;

      const next = new URLSearchParams();
      if (state.cat !== "all") next.set("cat", state.cat);
      if (state.q) next.set("q", state.q);
      if (state.price !== "all") next.set("price", state.price);
      if (state.sort !== "newest") next.set("sort", state.sort);
      const item = new URLSearchParams(location.search).get("item");
      if (item) next.set("item", item);
      const qs = next.toString();
      history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
    }

    chips.addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat]");
      if (!b) return;
      state.cat = b.dataset.cat;
      apply();
    });
    let t;
    search.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => { state.q = search.value.slice(0, 60); apply(); }, 150);
    });
    $("#shop-search-form").addEventListener("submit", (e) => { e.preventDefault(); state.q = search.value.slice(0, 60); apply(); });
    priceSel.addEventListener("change", () => { state.price = priceSel.value; apply(); });
    sortSel.addEventListener("change", () => { state.sort = sortSel.value; apply(); });
    $$("[data-reset-filters]").forEach((b) => b.addEventListener("click", () => {
      Object.assign(state, { cat: "all", q: "", price: "all", sort: "newest" });
      search.value = ""; priceSel.value = "all"; sortSel.value = "newest";
      apply();
    }));

    apply();
    if (params.get("search")) search.focus();
    const item = params.get("item");
    if (item && findProduct(item)) openProduct(item);
  }

  function renderDeals() {
    const cards = $("#promo-cards");
    if (cards) {
      cards.innerHTML = (DEALS.thisWeek || []).map((d) => `
        <article class="promo-card${d.style === "hot" ? " promo-card--hot" : ""}">
          <span class="icon-wrap">${icon(["tag", "gift", "users"].includes(d.icon) ? d.icon : "tag")}</span>
          <p class="big">${esc(d.big)}</p>
          <h3>${esc(d.title)}</h3>
          <p>${esc(d.text)}</p>
        </article>`).join("");
      cards.classList.add("reveal-stagger");
    }

    const past = $("#past-deals");
    if (past) {
      past.innerHTML = (DEALS.past || []).map((d) => `
        <article class="past-card"><h3>${esc(d.title)}</h3><p>${esc(d.text)}</p><span class="stamp">Ended</span></article>`).join("");
    }

    const cal = $("#drop-calendar");
    if (cal) {
      const today = phParts(Date.now());
      const todayKey = `${today.y}-${String(today.m + 1).padStart(2, "0")}-${String(today.d).padStart(2, "0")}`;
      const upcoming = (DEALS.calendar || []).filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date) && e.date >= todayKey);
      const fmtM = new Intl.DateTimeFormat("en-PH", { month: "short", timeZone: "UTC" });
      cal.innerHTML = upcoming.map((e) => {
        const [y, m, d] = e.date.split("-").map(Number);
        const date = new Date(Date.UTC(y, m - 1, d));
        return `<li class="cal-item">
          <time class="cal-date" datetime="${esc(e.date)}"><span class="m">${esc(fmtM.format(date))}</span><span class="d">${d}</span></time>
          <div><span class="type">${esc(e.type)}</span><h3>${esc(e.title)}</h3><p>${esc(e.text)}</p></div>
        </li>`;
      }).join("");
      const emptyCal = $("#calendar-empty");
      if (emptyCal) emptyCal.hidden = upcoming.length > 0;
    }
  }

  /* ---------- 6. Product modal ---------- */
  function openProduct(id) {
    const p = findProduct(id);
    const modal = $("#product-modal");
    if (!p || !modal) return;
    const out = p.stock === "out";
    const st = STOCK[p.stock] || STOCK.in;
    const sizes = p.sizes && p.sizes.length ? p.sizes : ["One size"];
    const count = galleryCount(p);
    const thumbs = count > 1
      ? `<div class="gallery-thumbs" role="group" aria-label="Product photos">${Array.from({ length: count }, (_, i) =>
          `<button type="button" data-gallery="${i}" aria-label="Show photo ${i + 1}" aria-current="${i === 0}">${productMedia(p, i)}</button>`).join("")}</div>`
      : "";

    $("#pm-body", modal).innerHTML = `
      <div class="modal-grid">
        <div class="gallery">
          <div class="gallery-main" data-gallery-main>${productMedia(p, 0, { eager: true })}</div>
          ${thumbs}
        </div>
        <div class="modal-info">
          <div class="p-badges p-badges--static">${badgesHTML(p)}</div>
          <div>
            <span class="p-cat">${esc(catName(p.category))}</span>
            <h2 id="pm-title">${esc(p.name)}</h2>
          </div>
          <p class="price">${onSale(p) ? `${money(p.salePrice)} <s>${money(p.price)}</s>` : money(p.price)}</p>
          <p class="desc">${esc(p.description)}</p>
          <form class="stack" data-add-form="${esc(p.id)}" novalidate>
            <fieldset class="size-options">
              <legend><span>${sizes.length > 1 ? "Pick your size" : "Size"}</span><a href="tips.html#size-guide">Size guide</a></legend>
              <div class="size-list">${sizes.map((s, i) => `
                <label><input type="radio" name="size" value="${esc(s)}" ${sizes.length === 1 && i === 0 ? "checked" : ""} ${out ? "disabled" : ""}><span>${esc(s)}</span></label>`).join("")}
              </div>
              <p class="field-error" data-size-error hidden>Pick a size first.</p>
            </fieldset>
            <div class="modal-actions">
              ${out
                ? `<button class="btn btn--primary btn--block" type="button" data-ask-restock="${esc(p.id)}">${icon("messenger")}Ask about restock</button>`
                : `<button class="btn btn--primary btn--block" type="submit">${icon("messenger")}Add &amp; message on Messenger</button>
                   <button class="btn btn--ghost btn--block" type="button" data-inquire="${esc(p.id)}">${icon("messenger")}Inquire on Messenger</button>`}
            </div>
          </form>
          <div class="modal-meta">
            <span>Status: <strong>${st.label}</strong></span>
            <span>No online payment here. We confirm stock, shipping and payment with you in chat.</span>
          </div>
        </div>
      </div>`;
    modal.showModal();
    $("#pm-body", modal).scrollTop = 0;
    $(".modal-close", modal).focus();
  }

  function setupModal() {
    const modal = $("#product-modal");
    if (!modal) return;
    modal.addEventListener("click", (e) => {
      if (e.target === modal) { modal.close(); return; }
      const g = e.target.closest("[data-gallery]");
      if (g) {
        const p = findProduct($("[data-add-form]", modal).dataset.addForm);
        const i = Number(g.dataset.gallery);
        $("[data-gallery-main]", modal).innerHTML = productMedia(p, i, { eager: true });
        $$("[data-gallery]", modal).forEach((b) => b.setAttribute("aria-current", String(b === g)));
      }
      const inq = e.target.closest("[data-inquire], [data-ask-restock]");
      if (inq) {
        const p = findProduct(inq.dataset.inquire || inq.dataset.askRestock);
        const size = ($("input[name=size]:checked", modal) || {}).value;
        const msg = inq.dataset.askRestock
          ? `Hi Cap Syndicate! Is the ${p.name} getting restocked? Please let me know when it's back.`
          : `Hi Cap Syndicate! I'm interested in the ${p.name}${size ? ` (${size})` : ""} - ${money(priceNow(p))}. Is it available?`;
        sendToMessenger(msg);
      }
    });
    modal.addEventListener("submit", (e) => {
      const form = e.target.closest("[data-add-form]");
      if (!form) return;
      e.preventDefault();
      const size = ($("input[name=size]:checked", form) || {}).value;
      const err = $("[data-size-error]", form);
      if (!size) { err.hidden = false; $("input[name=size]", form).focus(); return; }
      err.hidden = true;
      if (addToCart(form.dataset.addForm, size)) {
        modal.close();
        bumpCartButton();
        // Added to the list, now send it to the shop's Messenger (same message the cart's checkout sends)
        sendToMessenger(orderMessage());
      }
    });
    $(".modal-close", modal).addEventListener("click", () => modal.close());
  }

  /* ---------- 7. Order list (saved in this browser only) ---------- */
  const CART_KEY = "cs-order-list-v1";
  const MAX_QTY = 20;
  let cart = loadCart();

  function loadCart() {
    const raw = store.get(CART_KEY, []);
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((i) => i && typeof i.id === "string" && typeof i.size === "string")
      .filter((i) => { const p = findProduct(i.id); return p && p.stock !== "out" && (p.sizes || []).includes(i.size); })
      .map((i) => ({ id: i.id, size: i.size, qty: Math.min(MAX_QTY, Math.max(1, parseInt(i.qty, 10) || 1)) }));
  }
  function saveCart() { store.set(CART_KEY, cart); renderCart(); }

  function addToCart(id, size) {
    const p = findProduct(id);
    if (!p || p.stock === "out" || !(p.sizes || []).includes(size)) return false;
    const line = cart.find((i) => i.id === id && i.size === size);
    if (line) line.qty = Math.min(MAX_QTY, line.qty + 1);
    else cart.push({ id, size, qty: 1 });
    saveCart();
    return true;
  }
  const cartTotal = () => cart.reduce((sum, i) => sum + priceNow(findProduct(i.id)) * i.qty, 0);
  const cartCount = () => cart.reduce((n, i) => n + i.qty, 0);

  function bumpCartButton() {
    if (reducedMotion) return;
    $$("[data-open-cart]").forEach((b) => b.animate([{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }], { duration: 400, easing: "ease-out" }));
  }

  function renderCart() {
    const n = cartCount();
    $$("[data-cart-count]").forEach((el) => { el.textContent = String(n); el.dataset.count = String(n); });
    $$("[data-open-cart] .sr-only").forEach((el) => { el.textContent = `Open order list (${n} ${n === 1 ? "item" : "items"})`; });

    const drawer = $("#cart-drawer");
    if (!drawer) return;
    const list = $("#cart-items", drawer);
    const has = cart.length > 0;
    $("#cart-empty", drawer).hidden = has;
    $("#cart-details", drawer).hidden = !has;
    $("#cart-foot", drawer).hidden = !has;
    list.innerHTML = cart.map((i, idx) => {
      const p = findProduct(i.id);
      return `<li class="cart-item">
        <div class="thumb">${productMedia(p)}</div>
        <div>
          <h3>${esc(p.name)}</h3>
          <p class="meta">${esc(i.size)} · ${money(priceNow(p))}</p>
          <div class="qty" role="group" aria-label="Quantity for ${esc(p.name)}">
            <button type="button" data-qty="-1" data-line="${idx}" aria-label="Decrease quantity">${icon("minus", "icon--sm")}</button>
            <output aria-live="polite">${i.qty}</output>
            <button type="button" data-qty="1" data-line="${idx}" aria-label="Increase quantity">${icon("plus", "icon--sm")}</button>
          </div>
        </div>
        <div>
          <p class="line-total">${money(priceNow(p) * i.qty)}</p>
          <button class="remove-btn" type="button" data-remove="${idx}">Remove</button>
        </div>
      </li>`;
    }).join("");
    $("#cart-subtotal", drawer).textContent = money(cartTotal());
  }

  function orderMessage() {
    const form = $("#cart-details");
    const field = (name, max) => (form && form.elements[name] ? form.elements[name].value.trim().slice(0, max) : "");
    const name = field("name", 60);
    const code = field("code", 30);
    const notes = field("notes", 300);
    const lines = cart.map((i, n) => {
      const p = findProduct(i.id);
      return `${n + 1}. ${p.name} (${i.size}) x${i.qty} - ${money(priceNow(p) * i.qty)}  [${p.id}]`;
    });
    return [
      "Hi Cap Syndicate! I'd like to order:",
      "",
      ...lines,
      "",
      `Estimated total: ${money(cartTotal())} (before shipping/discounts)`,
      code ? `Promo code: ${code}` : "",
      name ? `Name: ${name}` : "",
      notes ? `Notes: ${notes}` : "",
      "",
      "Sent from the Cap Syndicate website"
    ].filter((l, i, arr) => l !== "" || (arr[i - 1] !== "" && i > 0)).join("\n");
  }

  function sendToMessenger(message) {
    copyText(message);
    const url = `${S.messengerUrl || S.facebookUrl}?text=${encodeURIComponent(message)}`;
    openExternal(url);
    toast("Message copied. If the chat opens empty, just paste it.");
  }

  function setupCart() {
    const drawer = $("#cart-drawer");
    if (!drawer) return;
    renderCart();

    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-open-cart]")) { drawer.showModal(); return; }
      const quick = e.target.closest("[data-quick-add]");
      if (quick) {
        const p = findProduct(quick.dataset.quickAdd);
        if (p && addToCart(p.id, p.sizes[0])) { bumpCartButton(); sendToMessenger(orderMessage()); }
      }
    });
    drawer.addEventListener("click", (e) => {
      if (e.target === drawer) { drawer.close(); return; }
      const q = e.target.closest("[data-qty]");
      if (q) {
        const line = cart[Number(q.dataset.line)];
        if (line) {
          line.qty += Number(q.dataset.qty);
          if (line.qty < 1) cart.splice(Number(q.dataset.line), 1);
          else line.qty = Math.min(MAX_QTY, line.qty);
          saveCart();
        }
      }
      const r = e.target.closest("[data-remove]");
      if (r) { cart.splice(Number(r.dataset.remove), 1); saveCart(); toast("Removed from your order list"); }
      if (e.target.closest("[data-clear-cart]")) { cart = []; saveCart(); }
      if (e.target.closest("[data-send-messenger]")) sendToMessenger(orderMessage());
      if (e.target.closest("[data-send-email]")) {
        if (!validEmail(S.email)) { toast("Email orders aren't set up yet. Use Messenger for now."); return; }
        const href = `mailto:${S.email.trim()}?subject=${encodeURIComponent("Order inquiry - Cap Syndicate website")}&body=${encodeURIComponent(orderMessage())}`;
        window.location.href = href;
      }
    });
    $$("[data-close]", drawer).forEach((b) => b.addEventListener("click", () => drawer.close()));
  }

  /* ---------- 8. Countdowns ---------- */
  function setupCountdowns() {
    const timers = $$("[data-countdown]");
    if (!timers.length) return;
    const targetFor = (el) => {
      const kind = el.dataset.countdown;
      if (kind === "deal") return dealEnd();
      if (kind === "drop") return dropTime();
      return parseTime(kind);
    };
    timers.forEach((el) => {
      const end = targetFor(el);
      el.dataset.end = String(end);
      const cap = el.parentElement.querySelector("[data-countdown-end]");
      if (cap && Number.isFinite(end)) cap.textContent = fmtLong.format(new Date(end));
    });
    const pad = (n) => String(n).padStart(2, "0");
    function tick() {
      const now = Date.now();
      timers.forEach((el) => {
        let left = Math.max(0, Number(el.dataset.end) - now);
        if (!Number.isFinite(left)) left = 0;
        const d = Math.floor(left / 864e5);
        const h = Math.floor((left % 864e5) / 36e5);
        const m = Math.floor((left % 36e5) / 6e4);
        const s = Math.floor((left % 6e4) / 1e3);
        const set = (u, v) => { const n = el.querySelector(`[data-unit="${u}"]`); if (n && n.textContent !== v) n.textContent = v; };
        set("d", pad(d)); set("h", pad(h)); set("m", pad(m)); set("s", pad(s));
        if (left === 0 && !el.dataset.done) {
          el.dataset.done = "1";
          const done = el.parentElement.querySelector("[data-countdown-done]");
          if (done) done.hidden = false;
        }
      });
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- 9. Promo code copy ---------- */
  function setupCopy() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-copy-code]");
      if (!btn) return;
      const code = (S.weeklyDeal || {}).code || "";
      Promise.resolve(copyText(code)).then((ok) => {
        toast(ok === false ? `Copy didn't work. The code is ${code}` : `Code ${code} copied`);
        const label = $("[data-copy-label]", btn);
        if (label) {
          label.textContent = "Copied";
          setTimeout(() => { label.textContent = "Copy"; }, 2000);
        }
      });
    });
  }

  /* ---------- 10. Navigation drawer ---------- */
  function syncExpanded() {
    $$("[data-open-nav]").forEach((b) => b.setAttribute("aria-expanded", String(!!$("#nav-drawer")?.open)));
  }
  function setupNav() {
    const drawer = $("#nav-drawer");
    if (!drawer) return;
    $$("[data-open-nav]").forEach((b) => b.addEventListener("click", () => { drawer.showModal(); syncExpanded(); }));
    $$("[data-close]", drawer).forEach((b) => b.addEventListener("click", () => drawer.close()));
    drawer.addEventListener("click", (e) => { if (e.target === drawer) drawer.close(); });
    drawer.addEventListener("close", syncExpanded);
    // Close the drawer if the screen grows past the mobile breakpoint
    window.matchMedia("(min-width: 1024px)").addEventListener("change", (mq) => { if (mq.matches && drawer.open) drawer.close(); });
  }

  /* Open product details from any card or link */
  function setupProductLinks() {
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-open-product]");
      if (!trigger || trigger.closest("#product-modal")) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey) return; // let people open links in new tabs
      e.preventDefault();
      openProduct(trigger.dataset.openProduct);
    });
  }

  /* ---------- 11. Forms ---------- */
  function setStatus(el, msg, kind) {
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle("is-success", kind === "success");
    el.classList.toggle("is-error", kind === "error");
  }
  async function postForm(form) {
    const res = await fetch(S.formEndpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`Form endpoint returned ${res.status}`);
  }

  function setupSignup() {
    $$("[data-signup]").forEach((form) => {
      const status = $(".form-status", form);
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = form.elements.email.value.trim();
        if (form.elements.website && form.elements.website.value) return; // spam trap
        if (!validEmail(email)) {
          form.elements.email.setAttribute("aria-invalid", "true");
          setStatus(status, "That email doesn't look right. Check it and try again.", "error");
          form.elements.email.focus();
          return;
        }
        form.elements.email.removeAttribute("aria-invalid");
        if (S.formEndpoint) {
          try {
            await postForm(form);
            form.reset();
            setStatus(status, "You're on the list. Watch your inbox for the next drop.", "success");
          } catch {
            setStatus(status, "Couldn't sign you up right now. Try again in a bit or DM us on Instagram.", "error");
          }
        } else if (validEmail(S.email)) {
          window.location.href = `mailto:${S.email.trim()}?subject=${encodeURIComponent("Drop alerts sign-up")}&body=${encodeURIComponent(`Add me to Cap Syndicate drop alerts: ${email}`)}`;
          setStatus(status, "Your email app just opened. Hit send and you're on the list.", "success");
        } else {
          setStatus(status, `Email alerts are almost ready. For now, follow @${S.instagramHandle || "cap_syndicate"} for drop news.`, "success");
        }
      });
    });
  }

  function setupContact() {
    const form = $("#contact-form");
    if (!form) return;
    const success = $("#contact-success");
    const rules = {
      name: (v) => (v.length >= 2 ? "" : "Tell us your name."),
      email: (v) => (validEmail(v) ? "" : "Enter a valid email so we can reply."),
      topic: (v) => (v ? "" : "Pick a topic."),
      message: (v) => (v.length >= 10 ? "" : "Add a bit more detail (at least 10 characters).")
    };
    const check = (name) => {
      const input = form.elements[name];
      const msg = rules[name](input.value.trim());
      const err = $(`#${name}-error`, form);
      input.closest(".field").classList.toggle("has-error", !!msg);
      if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
      if (err) { err.textContent = msg; err.hidden = !msg; }
      return !msg;
    };
    Object.keys(rules).forEach((name) => {
      form.elements[name].addEventListener("blur", () => { if (form.elements[name].value) check(name); });
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (form.elements.website && form.elements.website.value) return; // spam trap
      const invalid = Object.keys(rules).filter((n) => !check(n));
      if (invalid.length) { form.elements[invalid[0]].focus(); return; }

      const name = form.elements.name.value.trim().slice(0, 80);
      const email = form.elements.email.value.trim().slice(0, 120);
      const topic = form.elements.topic.value;
      const message = form.elements.message.value.trim().slice(0, 2000);
      const status = $(".form-status", form);
      const submit = $("button[type=submit]", form);

      if (S.formEndpoint) {
        submit.disabled = true;
        setStatus(status, "Sending...", "");
        try {
          await postForm(form);
          showSuccess(name, "Got it. We'll reply to your email, usually within a day.");
        } catch {
          setStatus(status, "Couldn't send right now. Try again or message us on Messenger.", "error");
        } finally { submit.disabled = false; }
        return;
      }
      if (validEmail(S.email)) {
        const body = `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`;
        window.location.href = `mailto:${S.email.trim()}?subject=${encodeURIComponent(`[Website] ${topic}`)}&body=${encodeURIComponent(body)}`;
        showSuccess(name, "Your email app just opened with the message ready. Hit send and we'll get back to you.");
      } else {
        copyText(`Topic: ${topic}\n\n${message}\n\n- ${name} (${email})`);
        showSuccess(name, "Your message is copied. Paste it in Messenger and we'll reply there.");
      }
    });
    function showSuccess(name, text) {
      $("[data-success-name]", success).textContent = name.split(" ")[0];
      $("[data-success-text]", success).textContent = text;
      form.hidden = true;
      success.hidden = false;
      success.focus();
    }
    $("[data-contact-again]", success)?.addEventListener("click", () => {
      form.reset();
      success.hidden = true;
      form.hidden = false;
      form.elements.name.focus();
    });
  }

  /* ---------- 12. Cookie notice (only if tracking is switched on) ---------- */
  function setupConsent() {
    if (!S.usesTracking) return;
    const KEY = "cs-consent-v1";
    const saved = store.get(KEY, null);
    window.CS_CONSENT = saved === "accepted";
    if (saved) return;
    const box = document.createElement("div");
    box.className = "cookie-banner";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", "Cookie notice");
    box.innerHTML = `<p>We use cookies to see which pages people visit so we can improve the site. You can say no and everything still works. <a href="privacy.html#cookies">Privacy Policy</a></p>
      <div class="actions"><button class="btn btn--primary btn--sm" type="button" data-consent="accepted">Accept</button><button class="btn btn--ghost btn--sm" type="button" data-consent="declined">No thanks</button></div>`;
    box.addEventListener("click", (e) => {
      const b = e.target.closest("[data-consent]");
      if (!b) return;
      store.set(KEY, b.dataset.consent);
      window.CS_CONSENT = b.dataset.consent === "accepted";
      document.dispatchEvent(new CustomEvent("cs:consent", { detail: window.CS_CONSENT }));
      box.remove();
    });
    document.body.appendChild(box);
  }

  /* ---------- 13. Reveal on scroll ---------- */
  function setupReveal() {
    const els = $$(".reveal, .reveal-stagger");
    if (!els.length) return;
    $$(".reveal-stagger").forEach((group) => [...group.children].forEach((c, i) => c.style.setProperty("--i", i % 8)));
    if (reducedMotion || !("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("is-visible")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach((el) => io.observe(el));
  }

  function setupSampleNotice() {
    $$("[data-sample-notice]").forEach((el) => { el.hidden = !S.showSampleNotice; });
  }

  /* ---------- 14. Boot ---------- */
  function boot() {
    bindSettings();
    setupSampleNotice();
    renderHome();
    renderDeals();
    setupModal();
    setupProductLinks();
    setupCart();
    renderShop();
    setupCountdowns();
    setupCopy();
    setupNav();
    setupSignup();
    setupContact();
    setupConsent();
    setupReveal();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
