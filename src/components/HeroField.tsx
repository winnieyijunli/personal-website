import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ---- tunable motion constants ----
// All amplitudes are ratios of the field's own rendered size (not the
// viewport), so the whole system scales naturally on tablet/mobile
// instead of needing separate fixed-pixel breakpoints.
const IDLE_DRIFT_X_RATIO = 0.3; // idle wander, horizontal — fraction of field width
const IDLE_DRIFT_Y_RATIO = 0.09; // idle wander, vertical — fraction of field height
const IDLE_DRIFT_DURATION_X = 18; // seconds per one-way idle sweep — kept slow despite the larger range
const IDLE_DRIFT_DURATION_Y = 20;

const CURSOR_STRENGTH_X = 0.42; // max cursor-bias offset — fraction of field width
const CURSOR_STRENGTH_Y = 0.3; // fraction of field height
const CURSOR_SMOOTH_DURATION = 0.5; // quickTo lag — still eased, not a snap, but visibly responsive

const HOVER_RAMP_IN = 0.28; // seconds for cursor influence to take over on enter/move
const HOVER_RAMP_OUT = 1.4; // seconds to fade back to pure drift on leave — slower, softer
const DRIFT_SUPPRESSION = 0.9; // 0..1 — how much idle drift is muted at full hover

const SCROLL_S_AMP_RATIO = 0.4; // S-curve lateral swing — fraction of field width
const SCROLL_DROP_RATIO = 1.1; // vertical carry-through — fraction of field height
const SCROLL_EXIT_RATIO = 0.9; // extra distance past the left edge on exit — fraction of field width
const SCROLL_HANDOFF_DURATION = 0.7; // crossfade duration, scroll path -> idle/hover
const MOBILE_RESTRAINT = 0.55; // extra multiplier on the scroll path for touch/small screens
const SCROLL_ACTIVATE_EPSILON = 0.001; // scroll-path activation guard — see ScrollTrigger.onUpdate below

function smoothstep(t: number) {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

// The hero's orange-to-amber frosted gradient field, as one coherent
// motion system with three states that hand off into each other rather
// than fighting: autonomous idle drift, cursor-dominant hover response,
// and a scroll-scrubbed S-path that carries the field from wherever it
// currently is down into the second section. See index.css for the two
// layers this drives (.hero-field-motion outer position, .hero-field
// inner gradient/scale trail).
export default function HeroField() {
  const motionRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const motion = motionRef.current;
    const field = fieldRef.current;
    const section = motion?.closest("section");
    if (!motion || !field || !section) return;
    const secondSection = section.nextElementSibling as HTMLElement | null;

    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const isMobile = !canHover;

    // establishes the field's centred base position via GSAP's own tracked
    // xPercent/yPercent so later x/y/scaleY tweens compose on top of it
    // instead of clobbering a plain CSS transform (a classic GSAP gotcha).
    gsap.set(field, { xPercent: -50, yPercent: -8, transformOrigin: "50% 0%" });

    if (reduceMotion) {
      // static, motionless — no listeners, no tweens, no scroll path.
      return;
    }

    const heroRect = () => section.getBoundingClientRect();
    const fieldSize = () => field.getBoundingClientRect();

    let onMove: ((e: PointerEvent) => void) | null = null;
    let onLeave: (() => void) | null = null;
    let handoffTween: gsap.core.Tween | null = null;
    let removeIdleTicker: (() => void) | null = null;

    const ctx = gsap.context(() => {
      // ---- shared state: idle drift + cursor bias are tweened plain
      // objects (not DOM), blended every tick onto the one motion layer.
      // Keeping them as separate signals is what lets hover "take over"
      // without idle drift ever being switched off. ----
      const drift = { x: 0, y: 0 };
      const cursor = { x: 0, y: 0 };
      const hover = { t: 0 };
      let mode: "idle" | "scroll" = "idle";

      gsap.to(drift, {
        x: () => fieldSize().width * IDLE_DRIFT_X_RATIO,
        duration: IDLE_DRIFT_DURATION_X,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      gsap.to(drift, {
        y: () => fieldSize().height * IDLE_DRIFT_Y_RATIO,
        duration: IDLE_DRIFT_DURATION_Y,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0.6,
      });

      const setCursorX = gsap.quickTo(cursor, "x", { duration: CURSOR_SMOOTH_DURATION, ease: "power3.out" });
      const setCursorY = gsap.quickTo(cursor, "y", { duration: CURSOR_SMOOTH_DURATION, ease: "power3.out" });
      const setHoverIn = gsap.quickTo(hover, "t", { duration: HOVER_RAMP_IN, ease: "power2.out" });

      function composeIdle() {
        const t = hover.t;
        gsap.set(motion, {
          x: drift.x * (1 - t * DRIFT_SUPPRESSION) + cursor.x * t,
          y: drift.y * (1 - t * DRIFT_SUPPRESSION) + cursor.y * t,
        });
      }
      const tickIfIdle = () => {
        if (mode === "idle") composeIdle();
      };
      gsap.ticker.add(tickIfIdle);
      removeIdleTicker = () => gsap.ticker.remove(tickIfIdle);

      // ---- cursor tracking (desktop only). Always live-updates the
      // target regardless of mode, so hover response is immediately
      // current the instant control returns from a scroll excursion. ----
      if (canHover) {
        onMove = (e: PointerEvent) => {
          const rect = heroRect();
          const size = fieldSize();
          const relX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
          const relY = (e.clientY - rect.top) / rect.height - 0.5;
          setCursorX(relX * 2 * size.width * CURSOR_STRENGTH_X);
          setCursorY(relY * 2 * size.height * CURSOR_STRENGTH_Y);
          setHoverIn(1);
        };
        onLeave = () => {
          setCursorX(0);
          setCursorY(0);
          gsap.to(hover, { t: 0, duration: HOVER_RAMP_OUT, ease: "power2.out", overwrite: true });
        };
        section.addEventListener("pointermove", onMove);
        section.addEventListener("pointerleave", onLeave);
      }

      // ---- scroll path: an S-curve carrying the field down and out the
      // left edge by the second section's midpoint. `base` is captured
      // only at the instant idle hands off to scroll (onEnter, which by
      // construction only fires when crossing in from above the hero —
      // i.e. always from idle), so the path always starts from wherever
      // the field visually is, never a fixed origin. ----
      const base = { x: 0, y: 0 };

      function samplePath(p: number) {
        const hero = heroRect();
        const size = fieldSize();
        const restraint = isMobile ? MOBILE_RESTRAINT : 1;
        const sAmp = size.width * SCROLL_S_AMP_RATIO * restraint;
        const drop = size.height * SCROLL_DROP_RATIO * restraint;
        // exitX is an absolute translateX target (not relative to `base`):
        // the field's untransformed left edge sits at `hero.width*0.58 -
        // size.width*0.5` (from its CSS anchor, .hero-field{left:58%}), so
        // this solves for the translateX that clears the hero's own left
        // edge by a margin — guaranteed regardless of viewport width or
        // wherever `base` happened to be when the path started.
        const exitX = -(hero.width * 0.58 - size.width * 0.5) - size.width * SCROLL_EXIT_RATIO * restraint;

        if (p <= 0.35) {
          const t = smoothstep(p / 0.35);
          return { x: base.x + sAmp * t, y: base.y + drop * 0.4 * t };
        }
        if (p <= 0.7) {
          const t = smoothstep((p - 0.35) / 0.35);
          return { x: base.x + sAmp - sAmp * 1.6 * t, y: base.y + drop * 0.4 + drop * 0.45 * t };
        }
        const t = smoothstep((p - 0.7) / 0.3);
        const midX = base.x - sAmp * 0.6;
        return { x: midX + (exitX - midX) * t, y: base.y + drop * 0.85 + drop * 0.15 * t };
      }

      function handBackToIdle() {
        if (mode !== "scroll") return;
        mode = "idle";
        const from = {
          x: (gsap.getProperty(motion, "x") as number) || 0,
          y: (gsap.getProperty(motion, "y") as number) || 0,
        };
        const handoff = { t: 0 };
        handoffTween?.kill();
        handoffTween = gsap.to(handoff, {
          t: 1,
          duration: SCROLL_HANDOFF_DURATION,
          ease: "power2.out",
          onUpdate: () => {
            // re-targets onto the *live* idle/hover blend every frame,
            // so it converges smoothly instead of snapping onto a value
            // that's already moved on by the time the tween finishes.
            const th = hover.t;
            const idleX = drift.x * (1 - th * DRIFT_SUPPRESSION) + cursor.x * th;
            const idleY = drift.y * (1 - th * DRIFT_SUPPRESSION) + cursor.y * th;
            gsap.set(motion, {
              x: gsap.utils.interpolate(from.x, idleX, handoff.t),
              y: gsap.utils.interpolate(from.y, idleY, handoff.t),
            });
          },
          onComplete: () => {
            // only now does the idle ticker resume writing — starting it
            // any earlier would have the raw idle blend fight this tween
            // for control of `motion` on every frame instead of the two
            // converging smoothly.
            gsap.ticker.add(tickIfIdle);
          },
        });
      }

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => {
          // Full hero height (the scroll distance for it to completely
          // leave the viewport, since start:"top top" pins progress 0 to
          // the moment it begins leaving) plus half the second section's
          // height, so exit-complete lands at that section's midpoint —
          // this coefficient was previously 0.6, which finished the path
          // before the hero had even fully scrolled away.
          const secondHeight = secondSection?.getBoundingClientRect().height ?? heroRect().height;
          return "+=" + (heroRect().height + secondHeight * 0.5);
        },
        // Deliberately no `onEnter` here: ScrollTrigger evaluates and fires
        // its lifecycle callbacks during its *initial* calculation too, not
        // only on a later real crossing — and the hero sits exactly at
        // start:"top top" the instant the page loads, so an onEnter handler
        // would fire immediately at scrollY 0, before the visitor has
        // scrolled at all. Instead, activation is gated on `onUpdate`
        // itself only ever reporting genuine forward progress once real
        // scrolling has happened, past a small epsilon.
        onUpdate: (self) => {
          if (mode === "idle") {
            if (self.progress <= SCROLL_ACTIVATE_EPSILON) return; // still at rest — stay idle
            mode = "scroll";
            handoffTween?.kill();
            gsap.ticker.remove(tickIfIdle);
            base.x = (gsap.getProperty(motion, "x") as number) || 0;
            base.y = (gsap.getProperty(motion, "y") as number) || 0;
          }
          const pos = samplePath(self.progress);
          gsap.set(motion, { x: pos.x, y: pos.y });
        },
        onLeaveBack: () => {
          handBackToIdle();
        },
      });

      // scroll trail — as the hero scrolls out, the gradient itself
      // stretches downward, independent of the lateral motion above.
      gsap.to(field, {
        scaleY: 1.22,
        y: 36,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => {
      if (onMove) section.removeEventListener("pointermove", onMove);
      if (onLeave) section.removeEventListener("pointerleave", onLeave);
      handoffTween?.kill();
      removeIdleTicker?.();
      ctx.revert();
    };
  }, []);

  return (
    <div className="hero-field-motion" ref={motionRef} aria-hidden="true">
      <div className="hero-field" ref={fieldRef} />
    </div>
  );
}
