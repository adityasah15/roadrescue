/* =====================================================================
   RoadRescue — Shared Shell
   Injects a consistent footer, About/Contact links, scroll-reveal
   animations, animated counters and toasts into every page.
   Does NOT touch any existing element id, function or API call.
   ===================================================================== */
(function () {
  "use strict";

  var BRAND = "RoadRescue";
  var YEAR = "2026";

  /* ── Page metadata ───────────────────────────────────── */
  function fileName() {
    var p = window.location.pathname.split("/").pop();
    return p === "" ? "index.html" : p;
  }

  /* Determine "home" link based on role stored at login. */
  function homeLink() {
    var role = (localStorage.getItem("role") || "").toUpperCase();
    if (role === "ADMIN") return "admin.html";
    if (localStorage.getItem("shopUsername")) return "shop-dashboard.html";
    if (role === "CUSTOMER" || localStorage.getItem("username")) return "customer.html";
    return "index.html";
  }

  /* ── Toast helper (global) ───────────────────────────── */
  window.showToast = function (message, type) {
    try {
      var wrap = document.getElementById("rr-toast-wrap");
      if (!wrap) {
        wrap = document.createElement("div");
        wrap.id = "rr-toast-wrap";
        document.body.appendChild(wrap);
      }
      var t = document.createElement("div");
      t.className = "rr-toast " + (type || "info");
      t.textContent = message;
      wrap.appendChild(t);
      setTimeout(function () {
        t.classList.add("out");
        setTimeout(function () { t.remove(); }, 240);
      }, 3200);
    } catch (e) { /* no-op */ }
  };

  /* ── Footer ──────────────────────────────────────────── */
  function buildFooter() {
    var f = document.createElement("footer");
    f.className = "rr-footer";
    f.innerHTML =
      '<div class="rr-footer-inner">' +
        '<div class="rr-footer-brand">' +
          '<div class="rr-footer-logo">🛟</div>' +
          '<div>' +
            '<div class="rr-footer-name">' + BRAND + '</div>' +
            '<div class="rr-footer-tag">Roadside help, when it matters.</div>' +
          '</div>' +
        '</div>' +
        '<nav class="rr-footer-links" aria-label="Footer">' +
          '<a href="' + homeLink() + '">Home</a>' +
          '<a href="about.html">About</a>' +
          '<a href="contact.html">Contact</a>' +
          '<a href="nova.html">Nova Assistant</a>' +
        '</nav>' +
        '<div class="rr-footer-meta">' +
          '<div>© ' + YEAR + ' ' + BRAND + '</div>' +
          '<div>Built by <strong>Aditya Sah</strong> &amp; <strong>Aniket Pandey</strong></div>' +
          '<div class="rr-footer-license">MIT License</div>' +
        '</div>' +
      '</div>';
    return f;
  }

  function buildCompactFooter() {
    var f = document.createElement("footer");
    f.className = "rr-footer rr-footer-compact";
    f.innerHTML =
      '© ' + YEAR + ' ' + BRAND + ' · Built by <strong>Aditya Sah</strong> &amp; ' +
      '<strong>Aniket Pandey</strong> · <a href="about.html">About</a> · ' +
      '<a href="contact.html">Contact</a> · MIT';
    return f;
  }

  function mountFooter() {
    if (document.querySelector(".rr-footer")) return;         // already injected
    if (document.body.classList.contains("rr-no-footer")) return;

    // Login page has a two-column hero — use a compact footer inside the panel.
    var formContainer = document.querySelector(".form-container");
    if (formContainer) {
      formContainer.appendChild(buildCompactFooter());
      return;
    }

    // Sidebar dashboards: keep the footer inside the content column.
    var main = document.querySelector(".main-content");
    if (main) {
      main.appendChild(buildFooter());
      return;
    }

    var footer = buildFooter();

    // New About/Contact pages use a flex-column .rr-page wrapper.
    var rrPage = document.querySelector(".rr-page");
    if (rrPage) {
      rrPage.appendChild(footer);
      return;
    }

    // Block-layout pages with a .page wrapper.
    var page = document.querySelector(".page");
    if (page && page.parentNode === document.body) {
      document.body.appendChild(footer);
      return;
    }

    // Flex-column pages (nova): footer as a normal flex item.
    document.body.appendChild(footer);
  }

  /* ── Top-nav About/Contact links ─────────────────────── */
  function mountNavLinks() {
    var right = document.querySelector(".navbar .nav-right");
    if (!right || right.querySelector(".rr-nav-link")) return;
    var about = document.createElement("a");
    about.href = "about.html";
    about.className = "rr-nav-link";
    about.textContent = "About";
    var contact = document.createElement("a");
    contact.href = "contact.html";
    contact.className = "rr-nav-link";
    contact.textContent = "Contact";
    right.insertBefore(contact, right.firstChild);
    right.insertBefore(about, right.firstChild);
  }

  /* ── Sticky header shadow ────────────────────────────── */
  function bindHeader() {
    var nav = document.querySelector(".navbar");
    if (!nav) return;
    var onScroll = function () {
      if (window.scrollY > 8) nav.classList.add("rr-scrolled");
      else nav.classList.remove("rr-scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ── Scroll progress bar ─────────────────────────────── */
  function mountProgress() {
    var bar = document.createElement("div");
    bar.id = "rr-progress";
    document.body.appendChild(bar);
    window.addEventListener("scroll", function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    }, { passive: true });
  }

  /* ── Reveal-on-scroll ────────────────────────────────── */
  function mountReveal() {
    var targets = document.querySelectorAll(
      ".card, .stat-card, .rr-tile, .section-header, .rr-hero > *"
    );

    function revealAll() {
      targets.forEach(function (t) { t.classList.add("rr-reveal", "rr-in"); });
    }

    if (!("IntersectionObserver" in window)) { revealAll(); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("rr-reveal", "rr-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(function (t) { t.classList.add("rr-reveal"); io.observe(t); });

    // Safety net: never leave content invisible if the observer misses it
    // (fast scroll, print, unusual viewport, headless capture, etc.).
    setTimeout(revealAll, 1400);
  }

  /* ── Animated counters for stat values ───────────────── */
  function mountCounters() {
    var nodes = document.querySelectorAll(".stat-value");
    if (!nodes.length || !("MutationObserver" in window)) return;
    var seen = new WeakSet();
    function animate(el) {
      if (seen.has(el)) return;
      var end = parseInt((el.textContent || "").replace(/[^0-9]/g, ""), 10);
      if (isNaN(end)) return;
      seen.add(el);
      var start = 0, dur = 700, t0 = performance.now();
      function step(now) {
        var p = Math.min((now - t0) / dur, 1);
        var val = Math.floor(start + (end - start) * (1 - Math.pow(1 - p, 3)));
        el.textContent = String(val);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = String(end);
      }
      requestAnimationFrame(step);
    }
    var mo = new MutationObserver(function () {
      nodes.forEach(function (n) { animate(n); });
    });
    nodes.forEach(function (n) { mo.observe(n, { childList: true, characterData: true, subtree: true }); });
  }

  /* ── Boot ────────────────────────────────────────────── */
  function boot() {
    mountFooter();
    mountNavLinks();
    bindHeader();
    mountProgress();
    mountReveal();
    mountCounters();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
