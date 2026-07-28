// Winnie Yijun Li — Portfolio
// Structure: core interactions (nav, about panel) run first and have zero
// external dependencies, so they still work even if the GSAP/Lenis CDN
// scripts fail to load. Animation enhancements are wrapped separately and
// degrade gracefully (content falls back to fully visible, not stuck hidden).

document.addEventListener("DOMContentLoaded", () => {
  // ---------- about: slide-over panel (Monolog-style) — no dependencies ----------
  const aboutTriggers = document.querySelectorAll("[data-about-open]");
  const aboutClose = document.querySelector("[data-about-close]");
  const aboutOverlay = document.querySelector("[data-about-overlay]");
  const aboutPanel = document.querySelector(".about-panel");

  function openAbout() {
    document.body.classList.add("is-about-open");
    if (aboutPanel) aboutPanel.setAttribute("aria-hidden", "false");
    if (window.__lenis) window.__lenis.stop();
  }
  function closeAbout() {
    document.body.classList.remove("is-about-open");
    if (aboutPanel) aboutPanel.setAttribute("aria-hidden", "true");
    if (window.__lenis) window.__lenis.start();
  }
  aboutTriggers.forEach((t) => t.addEventListener("click", openAbout));
  if (aboutClose) aboutClose.addEventListener("click", closeAbout);
  if (aboutOverlay) aboutOverlay.addEventListener("click", closeAbout);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("is-about-open")) {
      closeAbout();
    }
  });

  // ---------- stats slider — no dependencies ----------
  const statsTrack = document.querySelector("[data-stats-track]");
  if (statsTrack) {
    const items = statsTrack.querySelectorAll("[data-stats-item]");
    const bar = document.querySelector("[data-stats-bar]");
    const currentEl = document.querySelector("[data-stats-current]");
    const totalEl = document.querySelector("[data-stats-total]");
    const prevBtn = document.querySelector("[data-stats-prev]");
    const nextBtn = document.querySelector("[data-stats-next]");
    let index = 0;
    const total = items.length;
    if (totalEl) totalEl.textContent = String(total).padStart(2, "0");

    function render() {
      statsTrack.style.transform = `translateX(-${index * 100}%)`;
      if (bar) bar.style.width = `${((index + 1) / total) * 100}%`;
      if (currentEl) currentEl.textContent = String(index + 1).padStart(2, "0");
    }
    if (prevBtn) prevBtn.addEventListener("click", () => {
      index = (index - 1 + total) % total;
      render();
    });
    if (nextBtn) nextBtn.addEventListener("click", () => {
      index = (index + 1) % total;
      render();
    });
    render();
  }

  // ---------- FAQ accordion (grid-template-rows technique) — no dependencies ----------
  document.querySelectorAll("[data-accordion-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const wasOpen = item.classList.contains("is-open");
      item.parentElement.querySelectorAll(".faq-item.is-open").forEach((open) => {
        open.classList.remove("is-open");
      });
      if (!wasOpen) item.classList.add("is-open");
    });
  });

  // ---------- footer year — no dependencies ----------
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- footer: "hold to disrupt" particle canvas — no dependencies ----------
  // Vanilla Canvas 2D text-particle system: a deliberate simplification of
  // the reference site's Three.js version. Same interaction (drag to scatter,
  // release to spring back), no WebGL required.
  const disruptWrap = document.querySelector("[data-disrupt-wrap]");
  const disruptCanvas = document.querySelector("[data-disrupt-canvas]");
  if (disruptWrap && disruptCanvas && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const ctx = disruptCanvas.getContext("2d");
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];
    const pointer = { x: -9999, y: -9999, active: false };
    let raf = null;

    function buildParticles() {
      const w = disruptWrap.clientWidth;
      const h = Math.max(110, Math.round(w * 0.14));
      disruptCanvas.width = w * DPR;
      disruptCanvas.height = h * DPR;
      disruptCanvas.style.height = h + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      // draw the wordmark once, off-canvas-visible, purely to sample pixel
      // positions for particles — then wipe it, since particles do the
      // actual on-screen drawing.
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.font = `700 ${Math.round(h * 0.58)}px Inter, sans-serif`;
      ctx.fillText("WINNIE LI", w / 2, h / 2);
      const data = ctx.getImageData(0, 0, w, h).data;
      ctx.clearRect(0, 0, w, h);

      particles = [];
      const step = 4;
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          if (data[(y * w + x) * 4 + 3] > 120) {
            particles.push({ ox: x, oy: y, x, y, vx: 0, vy: 0 });
          }
        }
      }
    }

    function render() {
      const w = disruptCanvas.width / DPR;
      const h = disruptCanvas.height / DPR;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#f3f1ea"; // --dark-ink: readable text colour on the dark footer
      let moving = false;
      const radius = 90;
      particles.forEach((p) => {
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < radius) {
            const force = ((radius - dist) / radius) * 6;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }
        p.vx += (p.ox - p.x) * 0.02;
        p.vy += (p.oy - p.y) * 0.02;
        p.vx *= 0.85;
        p.vy *= 0.85;
        p.x += p.vx;
        p.y += p.vy;
        if (Math.abs(p.vx) > 0.05 || Math.abs(p.vy) > 0.05) moving = true;
        ctx.fillRect(p.x, p.y, 2, 2);
      });
      raf = moving || pointer.active ? requestAnimationFrame(render) : null;
    }

    function ensureLoop() {
      if (!raf) raf = requestAnimationFrame(render);
    }

    function setPointer(clientX, clientY, active) {
      const rect = disruptCanvas.getBoundingClientRect();
      pointer.x = clientX - rect.left;
      pointer.y = clientY - rect.top;
      pointer.active = active;
      ensureLoop();
    }

    buildParticles();
    render();

    disruptWrap.addEventListener("pointerdown", (e) => setPointer(e.clientX, e.clientY, true));
    window.addEventListener("pointermove", (e) => {
      if (pointer.active) setPointer(e.clientX, e.clientY, true);
    });
    window.addEventListener("pointerup", () => {
      pointer.active = false;
      ensureLoop();
    });
    window.addEventListener("resize", () => {
      buildParticles();
      ensureLoop();
    });
  }

  // ---------- everything below enhances the page with GSAP + Lenis ----------
  // Guarded: if the CDN scripts didn't load, we log a warning and force
  // every scroll-reveal element visible instead of leaving it hidden forever.
  try {
    if (typeof gsap === "undefined") {
      throw new Error("GSAP did not load (check network / ad-blocker / CDN)");
    }
    gsap.registerPlugin(ScrollTrigger);

    // Lenis smooth scroll
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // split-line hero reveal
    document.querySelectorAll("[data-split]").forEach((el) => {
      const lines = el.innerHTML.split("<br>");
      el.innerHTML = lines
        .map((line) => `<span class="split-line"><span>${line}</span></span>`)
        .join("<br>");
      el.setAttribute("data-reveal", "");

      gsap.to(el.querySelectorAll(".split-line > span"), {
        y: "0%",
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.08,
        delay: 0.15,
      });
    });

    // fade-up on scroll
    gsap.utils.toArray("[data-fade]").forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        onEnter: () => el.classList.add("is-visible"),
        once: true,
      });
    });

    // work cards: staggered reveal
    gsap.utils.toArray(".work-card").forEach((card, i) => {
      gsap.from(card, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: card, start: "top 90%" },
        delay: (i % 2) * 0.08,
      });
    });

    // hero background parallax
    const parallaxEl = document.querySelector("[data-parallax]");
    if (parallaxEl) {
      gsap.to(parallaxEl, {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: parallaxEl.closest("section"),
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    // footer: curtain peel-reveal, scroll-scrubbed
    const curtain = document.querySelector("[data-footer-curtain]");
    if (curtain) {
      gsap.to(curtain, {
        yPercent: -100,
        ease: "none",
        scrollTrigger: {
          trigger: curtain.closest(".footer"),
          start: "top bottom",
          end: "top top",
          scrub: true,
        },
      });
    }

    // approach section: pinned stacking cards
    const stackPanels = gsap.utils.toArray("[data-stack-panel]");
    stackPanels.forEach((panel, i) => {
      if (i === stackPanels.length - 1) return; // last panel just scrolls in normally
      ScrollTrigger.create({
        trigger: panel,
        start: "top top",
        end: () => "+=" + panel.offsetHeight,
        pin: true,
        pinSpacing: false,
      });
    });

    // navbar theme swap (dark hero -> light sections)
    const navbar = document.querySelector("[data-navbar]");
    document.querySelectorAll("[data-theme-section]").forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top 80px",
        end: "bottom 80px",
        onToggle: (self) => {
          if (self.isActive) {
            navbar.setAttribute("data-theme", section.getAttribute("data-theme-section"));
          }
        },
      });
    });

    // custom cursor
    const cursor = document.querySelector("[data-cursor]");
    const cursorText = document.querySelector("[data-cursor-text]");
    if (cursor && matchMedia("(hover:hover) and (pointer:fine)").matches) {
      window.addEventListener("mousemove", (e) => {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      });
      document.querySelectorAll("[data-cursor-hover]").forEach((el) => {
        el.addEventListener("mouseenter", () => {
          cursor.classList.add("is-active");
          cursorText.textContent = el.getAttribute("data-cursor-label") || "View";
        });
        el.addEventListener("mouseleave", () => cursor.classList.remove("is-active"));
      });
    }
  } catch (err) {
    console.warn("[winnie-portfolio] animation layer disabled:", err.message);
    // fallback: make sure nothing is stuck invisible
    document.querySelectorAll("[data-fade]").forEach((el) => el.classList.add("is-visible"));
    document.querySelectorAll(".split-line > span").forEach((span) => {
      span.style.transform = "translateY(0%)";
    });
  }
});
