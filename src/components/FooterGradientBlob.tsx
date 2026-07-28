import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// S-path keyframes — left/top as % of .footer itself (this component is
// a direct child of <footer>, not nested inside the narrower
// .footer-visual-col — that column's overflow:hidden was clipping
// ~1/4 of the shape before). Not GSAP's xPercent/yPercent (relative to
// the element's own size, which wouldn't trace a path across the
// container). Entirely independent of the Hero's own orange field/
// S-path: separate component, separate ScrollTrigger, scoped only to
// the footer's own entry range.
const PATH_START = { left: "10%", top: "-22%", scale: 0.65, opacity: 0.3 };
const PATH_MID = { left: "42%", top: "14%", scale: 0.9, opacity: 0.7 };
const PATH_END = { left: "60%", top: "30%", scale: 1.05, opacity: 1 };

// Widened considerably (was "top 25%", ~75vh of scroll) — the S-path
// was completing well before a normal-speed scroll had a chance to
// show it. Now spans ~150vh.
const TRIGGER_START = "top bottom";
const TRIGGER_END = "top -50%";

// Gentle cursor-attraction, layered on a separate inner element so it
// composes with the scroll-driven left/top above instead of fighting
// it. Restrained — editorial, not a playful magnet effect.
const HOVER_STRENGTH_X = 0.06; // max cursor offset — fraction of footer width
const HOVER_STRENGTH_Y = 0.08; // fraction of footer height
const HOVER_SMOOTH_DURATION = 0.6; // seconds, quickTo lag

export default function FooterGradientBlob() {
  const blobRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blob = blobRef.current;
    const hover = hoverRef.current;
    const footer = blob?.closest(".footer") as HTMLElement | null;
    if (!blob || !hover || !footer) return;

    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (reduceMotion) {
      // frozen at the settled (right-side) position — no scroll-path,
      // no hover response; the idle wobble is separately skipped via a
      // CSS media query on .footer-blob-idle.
      gsap.set(blob, PATH_END);
      gsap.set(hover, { x: 0, y: 0 });
      return;
    }

    gsap.set(blob, PATH_START);

    let onMove: ((e: PointerEvent) => void) | null = null;
    let onLeave: (() => void) | null = null;

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: { trigger: footer, start: TRIGGER_START, end: TRIGGER_END, scrub: true },
        })
        .to(blob, { ...PATH_MID, ease: "none", duration: 0.5 }, 0)
        .to(blob, { ...PATH_END, ease: "none", duration: 0.5 }, 0.5);

      if (canHover) {
        const setX = gsap.quickTo(hover, "x", { duration: HOVER_SMOOTH_DURATION, ease: "power3.out" });
        const setY = gsap.quickTo(hover, "y", { duration: HOVER_SMOOTH_DURATION, ease: "power3.out" });

        onMove = (e: PointerEvent) => {
          const rect = footer.getBoundingClientRect();
          const relX = (e.clientX - rect.left) / rect.width - 0.5;
          const relY = (e.clientY - rect.top) / rect.height - 0.5;
          setX(relX * 2 * rect.width * HOVER_STRENGTH_X);
          setY(relY * 2 * rect.height * HOVER_STRENGTH_Y);
        };
        onLeave = () => {
          setX(0);
          setY(0);
        };
        footer.addEventListener("pointermove", onMove);
        footer.addEventListener("pointerleave", onLeave);
      }
    }, footer);

    return () => {
      if (onMove) footer.removeEventListener("pointermove", onMove);
      if (onLeave) footer.removeEventListener("pointerleave", onLeave);
      ctx.revert();
    };
  }, []);

  return (
    <div className="footer-blob" ref={blobRef} aria-hidden="true">
      <div className="footer-blob-hover" ref={hoverRef}>
        <div className="footer-blob-idle">
          <div className="footer-blob-layer footer-blob-layer-outer" />
          <div className="footer-blob-layer footer-blob-layer-inner" />
        </div>
      </div>
    </div>
  );
}
