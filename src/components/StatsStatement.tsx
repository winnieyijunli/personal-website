import { useEffect, useRef } from "react";
import gsap from "gsap";
import { statItems } from "../data/stats";
import LetterReveal from "./LetterReveal";

const LOOP_HOLD = 0.7; // seconds each statement stays fully visible
const LOOP_TRANSITION = 0.3; // seconds for the crossfade between statements
const LOOP_SLIDE = 12; // px of vertical travel during the crossfade
// HOLD + TRANSITION = 1000ms per statement, matching the requested interval.

// Replaces the old dark stats carousel: a calm, always-on-page-background
// section split into a looping stat (left, any number of items — see
// data/stats.ts) and a large letter-by-letter revealed statement (right).
// See index.css .stats-statement-grid and friends for the layout.
export default function StatsStatement() {
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const slides = slideRefs.current.filter((el): el is HTMLDivElement => !!el);

    const ctx = gsap.context(() => {
      // ---- left column: calm, repeating loop across however many
      // statements are in statItems. Panels are stacked (position:absolute)
      // so the crossfade never causes a layout jump. ----
      if (slides.length < 2) return;

      gsap.set(slides[0], { opacity: 1, y: 0 });
      gsap.set(slides.slice(1), { opacity: 0, y: LOOP_SLIDE });

      if (reduceMotion) return;

      const tl = gsap.timeline({ repeat: -1 });
      slides.forEach((slide, i) => {
        const next = slides[(i + 1) % slides.length];
        tl.to({}, { duration: LOOP_HOLD })
          .to(slide, { opacity: 0, y: -LOOP_SLIDE, duration: LOOP_TRANSITION, ease: "power2.inOut" })
          .to(next, { opacity: 1, y: 0, duration: LOOP_TRANSITION, ease: "power2.inOut" }, "<");
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="section-light section-pad stats-statement-section" data-theme-section="light">
      <div className="wrap stats-statement-grid">
        <div className="stats-loop">
          {statItems.map((item, i) => (
            <div
              className="stats-loop-slide"
              key={item.num + item.text}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
            >
              <div className="stats-loop-num">{item.num}</div>
              <p className="stats-loop-text">{item.text}</p>
            </div>
          ))}
        </div>
        <div className="stats-reveal">
          <LetterReveal
            className="stats-reveal-text"
            text="Restraint creates clarity, and attention to detail gives design its life. Each challenge requires its own response and visual language, yet across different projects, I seek to create a consistent thread that connects each piece into a larger narrative and creative voice."
          />
        </div>
      </div>
    </section>
  );
}
