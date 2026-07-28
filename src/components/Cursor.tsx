import { useEffect, useRef } from "react";
import gsap from "gsap";

const CURSOR_SMOOTH_DURATION = 0.45; // seconds — GSAP quickTo lag, keeps the follow soft rather than glued to the pointer

// Broad, semantic-first selector for "content the cursor should invert
// over" — headings/paragraphs/links/buttons/images cover the vast
// majority of real content across every component automatically. The
// few container classes catch cards whose image sits behind an overlay
// (so hovering the caption still counts, not just the raw <img> pixels
// underneath it). Extend via a data-cursor-invert attribute rather than
// growing this list piecemeal.
const INVERT_SELECTOR = [
  "img",
  "a",
  "button",
  "h1",
  "h2",
  "h3",
  "h4",
  "p",
  ".approach-carousel-slide",
  ".opening-loop-media",
  ".stats-loop",
  "[data-cursor-invert]",
].join(", ");

// A second layer over the native cursor — never hides or replaces it.
// Default: a small solid accent-orange dot. Over qualifying content it
// grows and switches to mix-blend-mode:difference (see index.css for
// why that specific technique produces a true visual invert of
// whatever's underneath, not just a colour change on the dot itself).
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let currentMatch: Element | null = null;
    let onMove: ((e: PointerEvent) => void) | null = null;
    let onOver: ((e: PointerEvent) => void) | null = null;
    let onLeaveWindow: (() => void) | null = null;

    const ctx = gsap.context(() => {
      gsap.set(dot, { xPercent: -50, yPercent: -50 });

      // Reduced motion: position updates instantly (no smoothing lag),
      // but the invert-on-hover state change is a discrete toggle, not
      // continuous motion, so it stays exactly as-is either way.
      const setX = reduceMotion
        ? (x: number) => gsap.set(dot, { x })
        : gsap.quickTo(dot, "x", { duration: CURSOR_SMOOTH_DURATION, ease: "power3.out" });
      const setY = reduceMotion
        ? (y: number) => gsap.set(dot, { y })
        : gsap.quickTo(dot, "y", { duration: CURSOR_SMOOTH_DURATION, ease: "power3.out" });

      onMove = (e: PointerEvent) => {
        setX(e.clientX);
        setY(e.clientY);
        dot!.classList.add("is-visible");
      };
      onOver = (e: PointerEvent) => {
        const target = e.target as Element | null;
        const match = target?.closest?.(INVERT_SELECTOR) ?? null;
        if (match === currentMatch) return;
        currentMatch = match;
        dot!.classList.toggle("is-inverting", !!match);
      };
      onLeaveWindow = () => dot!.classList.remove("is-visible");

      window.addEventListener("pointermove", onMove);
      document.addEventListener("pointerover", onOver);
      document.addEventListener("mouseleave", onLeaveWindow);
    });

    return () => {
      if (onMove) window.removeEventListener("pointermove", onMove);
      if (onOver) document.removeEventListener("pointerover", onOver);
      if (onLeaveWindow) document.removeEventListener("mouseleave", onLeaveWindow);
      ctx.revert();
    };
  }, []);

  return <div className="cursor-dot" ref={dotRef} aria-hidden="true" />;
}
