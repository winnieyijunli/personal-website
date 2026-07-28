import { useEffect, useRef } from "react";

type Particle = {
  ox: number;
  oy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  color: string;
};

// Ambient particle typography for the footer: "WINNIE YIJUN LI" formed from
// many small dots that quietly wander in place, gently part when the
// pointer drifts near, and settle back slowly. No drag/hold required —
// this replaced the earlier "hold to disrupt" version, which needed an
// active mousedown to do anything.
const REPEL_RADIUS = 72;
const REPEL_FORCE = 2.4;
const SPRING_K = 0.012;
const DAMPING = 0.89;
const IDLE_AMP = 1.6;
const IDLE_SPEED_X = 0.55;
const IDLE_SPEED_Y = 0.4;
const TWO_LINE_BREAKPOINT = 560; // below this, "WINNIE" / "YIJUN LI" stack
const DOT = 1.5;

// Warm burnt-amber, derived from the brand accent (--accent: #e14a1f) but
// pulled toward the Hero's amber end so it stays soft against the dark
// footer rather than reading as a hot/neon orange. Each particle gets a
// random point between the two anchors plus its own alpha, so the wordmark
// reads as scattered warm stardust rather than a flat tint.
const COLOR_A: [number, number, number] = [206, 84, 38]; // deeper burnt orange
const COLOR_B: [number, number, number] = [232, 156, 92]; // soft amber
function randomParticleColor() {
  const t = Math.random();
  const r = Math.round(COLOR_A[0] + (COLOR_B[0] - COLOR_A[0]) * t);
  const g = Math.round(COLOR_A[1] + (COLOR_B[1] - COLOR_A[1]) * t);
  const b = Math.round(COLOR_A[2] + (COLOR_B[2] - COLOR_A[2]) * t);
  const alpha = (0.55 + Math.random() * 0.45).toFixed(2);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function FooterWordmark() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeLabelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let particles: Particle[] = [];
    const pointer = { x: -9999, y: -9999, active: false };
    let raf: number | null = null;
    let inView = true;
    const startTime = performance.now();

    function buildParticles() {
      const w = wrap!.clientWidth;
      if (w <= 0) return; // layout not settled yet — resize observer will retry

      // Measure first (a throwaway context — canvas size doesn't affect
      // font metrics), so the real canvas can be sized to the font that
      // actually fits, rather than guessing a fixed aspect ratio and
      // hoping the text matches it.
      const measure = document.createElement("canvas").getContext("2d")!;
      const twoLine = w < TWO_LINE_BREAKPOINT;
      let fontPx: number;
      let h: number;

      if (twoLine) {
        fontPx = Math.round(w * 0.28);
        measure.font = `700 ${fontPx}px Inter, sans-serif`;
        while (measure.measureText("YIJUN LI").width > w * 0.86 && fontPx > 14) {
          fontPx -= 2;
          measure.font = `700 ${fontPx}px Inter, sans-serif`;
        }
        h = Math.max(150, Math.round(fontPx * 2.7));
      } else {
        fontPx = Math.round(w * 0.2);
        measure.font = `700 ${fontPx}px Inter, sans-serif`;
        while (measure.measureText("WINNIE YIJUN LI").width > w * 0.9 && fontPx > 14) {
          fontPx -= 2;
          measure.font = `700 ${fontPx}px Inter, sans-serif`;
        }
        h = Math.max(110, Math.round(fontPx * 1.7));
      }

      canvas!.width = w * DPR;
      canvas!.height = h * DPR;
      canvas!.style.height = h + "px";
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);

      // Sample on a separate, un-scaled offscreen canvas (exactly w×h, no
      // DPR multiplier) — getImageData always reads device pixels
      // regardless of ctx.setTransform, so sampling directly off the
      // DPR-scaled visible canvas only ever captures a corner of it.
      const sample = document.createElement("canvas");
      sample.width = w;
      sample.height = h;
      const sctx = sample.getContext("2d");
      if (!sctx) return;
      sctx.fillStyle = "#fff";
      sctx.textBaseline = "middle";
      // left-anchored (was centred) — the canvas spans the same .wrap
      // as the grid above it, so x:0 here lines up with the form/
      // statement columns' own left edge instead of floating centred
      // with no shared edge to align against.
      sctx.textAlign = "left";
      sctx.font = `700 ${fontPx}px Inter, sans-serif`;

      if (twoLine) {
        const lineGap = fontPx * 1.15;
        sctx.fillText("WINNIE", 0, h / 2 - lineGap / 2);
        sctx.fillText("YIJUN LI", 0, h / 2 + lineGap / 2);
      } else {
        sctx.fillText("WINNIE YIJUN LI", 0, h / 2);
      }

      const data = sctx.getImageData(0, 0, w, h).data;
      particles = [];
      const step = 3;
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          if (data[(y * w + x) * 4 + 3] > 120) {
            particles.push({
              ox: x,
              oy: y,
              x,
              y,
              vx: 0,
              vy: 0,
              phase: Math.random() * Math.PI * 2,
              color: randomParticleColor(),
            });
          }
        }
      }
    }

    function drawStatic() {
      // reduced motion: one settled frame, no offsets, no forces, no loop.
      if (!canvas || !ctx) return;
      const w = canvas.width / DPR;
      const h = canvas.height / DPR;
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.ox, p.oy, DOT, DOT);
      });
    }

    function render() {
      if (!canvas || !ctx) return;
      const w = canvas.width / DPR;
      const h = canvas.height / DPR;
      ctx.clearRect(0, 0, w, h);

      const t = (performance.now() - startTime) / 1000;

      particles.forEach((p) => {
        // idle target drifts slowly around the particle's home position —
        // this is what keeps the piece quietly alive with no pointer
        // input at all (the entire mobile experience).
        const targetX = p.ox + Math.sin(t * IDLE_SPEED_X + p.phase) * IDLE_AMP;
        const targetY = p.oy + Math.cos(t * IDLE_SPEED_Y + p.phase * 1.7) * IDLE_AMP;

        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < REPEL_RADIUS) {
            const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_FORCE;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        p.vx += (targetX - p.x) * SPRING_K;
        p.vy += (targetY - p.y) * SPRING_K;
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, DOT, DOT);
      });

      raf = inView ? requestAnimationFrame(render) : null;
    }

    function ensureLoop() {
      if (!raf && inView) raf = requestAnimationFrame(render);
    }

    buildParticles();
    if (reduceMotion) {
      drawStatic();
    } else {
      render();
    }

    function setPointer(clientX: number, clientY: number) {
      const rect = canvas!.getBoundingClientRect();
      pointer.x = clientX - rect.left;
      pointer.y = clientY - rect.top;
    }
    const onPointerEnter = () => {
      pointer.active = true;
    };
    const onPointerMove = (e: PointerEvent) => setPointer(e.clientX, e.clientY);
    const onPointerLeave = () => {
      pointer.active = false;
    };

    if (!reduceMotion) {
      wrap.addEventListener("pointerenter", onPointerEnter);
      wrap.addEventListener("pointermove", onPointerMove);
      wrap.addEventListener("pointerleave", onPointerLeave);
    }

    const resizeObserver = new ResizeObserver(() => {
      buildParticles();
      if (reduceMotion) drawStatic();
      else ensureLoop();
    });
    resizeObserver.observe(wrap);

    // Pause entirely off-screen — idle wander now runs continuously
    // whenever visible, so this matters a lot more than it did for the
    // old drag-only version.
    let intersectionObserver: IntersectionObserver | null = null;
    if (!reduceMotion) {
      intersectionObserver = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        if (inView) ensureLoop();
        else if (raf) {
          cancelAnimationFrame(raf);
          raf = null;
        }
      });
      intersectionObserver.observe(wrap);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver?.disconnect();
      wrap.removeEventListener("pointerenter", onPointerEnter);
      wrap.removeEventListener("pointermove", onPointerMove);
      wrap.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  // Copenhagen local time — a genuinely functional readout, not a
  // decorative fake-dashboard number. Updated every 15s (minute-precision
  // display doesn't need finer polling than that).
  useEffect(() => {
    const el = timeLabelRef.current;
    if (!el) return;
    function tick() {
      el!.textContent = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Copenhagen",
      }).format(new Date());
    }
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="footer-wordmark" ref={wrapRef}>
      <div className="footer-wordmark-atmosphere" aria-hidden="true" />
      <canvas ref={canvasRef} aria-hidden="true" />
      <span className="u-sr-only">Winnie Yijun Li</span>
      <div className="footer-wordmark-status mono">
        <span>Copenhagen, DK</span>
        <span ref={timeLabelRef} />
      </div>
    </div>
  );
}
