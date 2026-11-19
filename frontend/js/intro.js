/* ==========================================================================
   CAP SYNDICATE · intro.js  (home page only)
   1. Loader: logo wipes in as the page really loads (fonts, images, window load).
   2. Hero animation: headline letters rise, embers drift, the red glow breathes,
      the artwork moves with the mouse. The background image itself is unchanged.
   Everything respects prefers-reduced-motion. If this file fails, the page still shows:
   the loader and hidden hero states are cleared by a CSS fail-safe after a few seconds.
   ========================================================================== */
(() => {
  "use strict";
  const root = document.documentElement;
  root.classList.add("js");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const loader = document.getElementById("loader");
  const stage = document.querySelector(".hero-stage");

  /* ---------- Headline: split into words and letters for the reveal ---------- */
  function splitTitle() {
    const h1 = document.querySelector(".hs-title");
    if (!h1 || reduced || h1.dataset.split) return;
    h1.dataset.split = "1";
    h1.setAttribute("aria-label", h1.textContent.replace(/\s+/g, " ").trim());
    let n = 0;
    const fill = (target, text) => {
      text.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { target.append(" "); return; }
        const word = document.createElement("span");
        word.className = "hs-word";
        word.setAttribute("aria-hidden", "true");
        [...part].forEach((ch) => {
          const l = document.createElement("span");
          l.className = "hs-ch";
          l.style.setProperty("--i", String(n++));
          l.textContent = ch;
          word.append(l);
        });
        target.append(word);
      });
    };
    const nodes = [...h1.childNodes];
    h1.textContent = "";
    nodes.forEach((node) => {
      if (node.nodeType === 3) fill(h1, node.textContent);
      else { const wrap = node.cloneNode(false); fill(wrap, node.textContent); h1.append(wrap); }
    });
  }

  /* ---------- Embers: a few drifting sparks on a canvas over the artwork ---------- */
  function embers() {
    const canvas = document.querySelector(".hs-fx");
    if (!canvas || reduced || !stage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, parts = [], raf = 0, last = 0, visible = true;
    const make = (initial) => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 10,
      r: 0.7 + Math.random() * 1.9,
      vy: 10 + Math.random() * 26,            // px per second, upward
      sway: 6 + Math.random() * 16,
      ph: Math.random() * 6.28,
      sp: 0.4 + Math.random() * 0.9,
      a: 0.25 + Math.random() * 0.55,
      red: Math.random() < 0.72
    });
    const resize = () => {
      const r = stage.getBoundingClientRect();
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(46, Math.max(16, w / 34)));
      parts = Array.from({ length: count }, () => make(true));
    };
    const frame = (t) => {
      raf = 0;
      if (!visible || document.hidden) return;
      const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      parts.forEach((p, i) => {
        p.y -= p.vy * dt;
        p.ph += p.sp * dt;
        const x = p.x + Math.sin(p.ph) * p.sway;
        if (p.y < -12) parts[i] = make(false);
        const fade = Math.min(1, Math.max(0, (p.y / h) * 2.2));       // dims toward the top
        const tw = 0.6 + 0.4 * Math.sin(p.ph * 3);
        const alpha = p.a * fade * tw;
        const g = ctx.createRadialGradient(x, p.y, 0, x, p.y, p.r * 5);
        g.addColorStop(0, p.red ? `rgba(255,60,48,${alpha})` : `rgba(255,255,255,${alpha * 0.8})`);
        g.addColorStop(1, "rgba(255,40,30,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, p.y, p.r * 5, 0, 6.2832); ctx.fill();
      });
      raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } };
    resize();
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(stage); else window.addEventListener("resize", resize);
    if ("IntersectionObserver" in window) new IntersectionObserver(([en]) => { visible = en.isIntersecting; kick(); }).observe(stage);
    document.addEventListener("visibilitychange", kick);
    canvas.classList.add("is-on");
    kick();
  }

  /* ---------- Parallax: artwork follows the pointer a little (mouse devices only) ---------- */
  function parallax() {
    if (reduced || !stage || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const loop = () => {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      stage.style.setProperty("--mx", cx.toFixed(3));
      stage.style.setProperty("--my", cy.toFixed(3));
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      kick();
    }, { passive: true });
    stage.addEventListener("pointerleave", () => { tx = 0; ty = 0; kick(); });
  }

  /* ---------- Start the hero animation (after the loader wipes away) ---------- */
  let started = false;
  function startHero() {
    if (started) return;
    started = true;
    root.classList.add("hero-go");
    embers();
    parallax();
  }

  splitTitle();

  /* ---------- Loader ---------- */
  if (!loader) { startHero(); return; }
  root.classList.add("is-loading");
  const fill = loader.querySelector(".loader-fill");
  const MIN = reduced ? 300 : 1500;   // shortest time the loader stays up
  const MAX = 5500;                   // never keep a visitor waiting longer than this
  const t0 = performance.now();
  const done = { fonts: false, load: document.readyState === "complete", hero: false };
  let p = 0, finished = false;

  const heroImg = document.querySelector(".hs-bg img");
  const imgDone = () => { done.hero = true; };
  if (!heroImg || (heroImg.complete && heroImg.naturalWidth)) done.hero = true;
  else { heroImg.addEventListener("load", imgDone); heroImg.addEventListener("error", imgDone); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { done.fonts = true; }, () => { done.fonts = true; });
  else done.fonts = true;
  if (!done.load) window.addEventListener("load", () => { done.load = true; });

  function finish() {
    if (finished) return;
    finished = true;
    loader.classList.add("is-done");
    loader.setAttribute("aria-hidden", "true");
    setTimeout(startHero, reduced ? 0 : 380);
    setTimeout(() => { root.classList.remove("is-loading"); loader.remove(); }, reduced ? 350 : 1100);
  }

  function tick(now) {
    if (finished) return;
    const elapsed = now - t0;
    const real = 0.1 + 0.25 * done.fonts + 0.3 * done.hero + 0.35 * done.load;   // what has really loaded
    const timed = Math.min(1, elapsed / MIN);                                       // never races ahead of the minimum
    const target = Math.min(real, timed);
    p += (target - p) * 0.14;
    if (target >= 0.999 && p > 0.992) p = 1;
    loader.style.setProperty("--p", p.toFixed(4));
    if (fill) fill.style.transform = `scaleX(${p.toFixed(4)})`;
    if (p >= 1 || elapsed > MAX) { loader.style.setProperty("--p", "1"); if (fill) fill.style.transform = "scaleX(1)"; finish(); return; }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
