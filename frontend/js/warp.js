/* ==========================================================================
   CAP SYNDICATE · warp.js  (home page hero)
   Moves the EXISTING hero background (images/hero-bg.jpg) like a liquid warp: the picture is drawn
   by a small WebGL shader that swirls and distorts it over time, and bends around the mouse.
   Same idea as a "Warp" background shader, but applied to your own image.
   No libraries. If WebGL is missing or the visitor prefers reduced motion, the normal still
   background stays exactly as it is.
   ========================================================================== */
(() => {
  "use strict";
  const canvas = document.querySelector(".hs-warp");
  const stage = document.querySelector(".hero-stage");
  if (!canvas || !stage) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power", premultipliedAlpha: false });
  if (!gl) return;

  const VERT = "attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }";
  const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D u_tex;
uniform vec2 u_res;     // canvas size in pixels
uniform vec2 u_img;     // picture size in pixels
uniform vec2 u_mouse;   // 0..1, smoothed pointer position
uniform float u_mouseOn;
uniform float u_t;      // seconds
uniform float u_amp;    // overall distortion strength

vec2 rot(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }

void main() {
  vec2 frag = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;

  // fit the picture like CSS object-fit: cover, with a small built-in zoom so warped edges never show
  float sc = max(u_res.x / u_img.x, u_res.y / u_img.y);
  vec2 uv = (frag - 0.5) * u_res / (u_img * sc) / 1.07 + 0.5;

  // warp field in aspect-corrected space
  vec2 p0 = (frag - 0.5) * vec2(aspect, 1.0);
  vec2 p = p0;
  float t = u_t * 0.2;

  // slow global swirl around the centre, easing in and out
  float r0 = length(p0);
  p = rot(p, 0.34 * u_amp * exp(-r0 * 1.7) * sin(t * 1.3));

  // layered flowing distortion (iterated, so it folds like smoke)
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    p += u_amp * 0.019 * vec2(
      sin(p.y * (2.3 + fi * 0.55) + t * (1.0 + fi * 0.17) + fi * 1.7),
      cos(p.x * (2.1 + fi * 0.6) - t * (0.85 + fi * 0.21) + fi * 2.3)
    ) / (1.0 + fi * 0.28);
  }

  // the pointer pulls a local whirl into the picture
  vec2 m = (u_mouse - 0.5) * vec2(aspect, 1.0);
  vec2 q = p0 - m;
  float k = u_mouseOn * 0.75 * exp(-dot(q, q) * 7.0);
  p += rot(q, k) - q;

  vec2 d = p - p0;
  d.x /= aspect;
  vec3 col = texture2D(u_tex, uv + d / 1.07).rgb;
  gl_FragColor = vec4(col, 1.0);
}`;

  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
  const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);  // one big triangle
  const loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  ["u_tex", "u_res", "u_img", "u_mouse", "u_mouseOn", "u_t", "u_amp"].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });

  let imgW = 1880, imgH = 836, ready = false, raf = 0, visible = true, started = 0;
  let mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5, on = 0, tOn = 0;

  const resize = () => {
    const r = stage.getBoundingClientRect();
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const maxPixels = 2.0e6;                                   // keeps phones and big monitors smooth
    dpr = Math.min(dpr, Math.sqrt(maxPixels / Math.max(1, r.width * r.height)));
    const w = Math.max(2, Math.round(r.width * dpr)), h = Math.max(2, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
  };

  const frame = (now) => {
    raf = 0;
    if (!ready || !visible || document.hidden) return;
    mx += (tmx - mx) * 0.06; my += (tmy - my) * 0.06; on += (tOn - on) * 0.05;
    gl.uniform2f(U.u_res, canvas.width, canvas.height);
    gl.uniform2f(U.u_img, imgW, imgH);
    gl.uniform2f(U.u_mouse, mx, 1 - my);
    gl.uniform1f(U.u_mouseOn, on);
    gl.uniform1f(U.u_t, (now - started) / 1000);
    gl.uniform1f(U.u_amp, 1.45);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!canvas.classList.contains("is-on") && document.documentElement.classList.contains("hero-go")) canvas.classList.add("is-on");
    raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf && ready && visible && !document.hidden) raf = requestAnimationFrame(frame); };

  const img = new Image();
  img.decoding = "async";
  img.onload = () => {
    imgW = img.naturalWidth; imgH = img.naturalHeight;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(U.u_tex, 0);
    ready = true; started = performance.now();
    resize(); kick();
  };
  img.src = (window.innerWidth < 900 && (window.devicePixelRatio || 1) < 2.5) ? "images/hero-bg-1280.jpg" : "images/hero-bg.jpg";

  if ("ResizeObserver" in window) new ResizeObserver(() => { resize(); kick(); }).observe(stage); else window.addEventListener("resize", resize);
  if ("IntersectionObserver" in window) new IntersectionObserver(([en]) => { visible = en.isIntersecting; kick(); }).observe(stage);
  document.addEventListener("visibilitychange", kick);

  // pointer bends the picture (mouse devices only)
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    stage.addEventListener("pointermove", (e) => { const r = stage.getBoundingClientRect(); tmx = (e.clientX - r.left) / r.width; tmy = (e.clientY - r.top) / r.height; tOn = 1; }, { passive: true });
    stage.addEventListener("pointerleave", () => { tOn = 0; });
  }

  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); ready = false; canvas.classList.remove("is-on"); });
})();
