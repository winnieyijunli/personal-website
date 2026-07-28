import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TRIGGER_START = "top 90%";
const TRIGGER_END = "top 20%";
const SCRUB = 0.35; // slight smoothing on the scroll link, not 1:1-instant

const LINE_EPSILON = 4; // px tolerance for grouping letters onto the same visual line
const LIT_OPACITY = "1";
const DIM_OPACITY = "0.14";
const LIT_COLOR = "var(--ink)";
const DIM_COLOR = "var(--ink-faint)";

type LetterRevealProps = {
  text: string;
  className?: string;
};

// Line-by-line, letter-by-letter reveal, mapped to live scroll progress
// (not a one-shot trigger): every character is its own span, and each is
// assigned a threshold in 0..1 — line-weighted (each visual line gets an
// equal share of the range, characters spread evenly within their line's
// share) so the reveal still reads as "scan this line, then the next"
// rather than a flat per-character ramp. As scroll progress crosses a
// letter's threshold it lights up; scrolling back past it dims it again
// — genuinely bidirectional, not a played-once animation. Lit/dim state
// is written as both a class and inline opacity/color (belt-and-braces:
// a plain class toggle was found not to reliably repaint in testing).
export default function LetterReveal({ text, className }: LetterRevealProps) {
  const wrapRef = useRef<HTMLParagraphElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const letters = letterRefs.current.filter((el): el is HTMLSpanElement => !!el);

    function setLit(el: HTMLSpanElement, on: boolean) {
      el.classList.toggle("is-lit", on);
      el.style.opacity = on ? LIT_OPACITY : DIM_OPACITY;
      el.style.color = on ? LIT_COLOR : DIM_COLOR;
    }

    if (reduceMotion) {
      // land directly on "fully revealed" — no transition, no scroll link.
      letters.forEach((el) => {
        el.style.transition = "none";
        setLit(el, true);
      });
      return;
    }

    // Thresholds, not delays: each letter gets a point in 0..1 along the
    // scroll range. Grouped by measured line (not a fixed character
    // count) so lines naturally get an equal share of the range
    // regardless of how many characters they hold at the current
    // viewport width — a long line no longer needs capping the way a
    // fixed per-character delay did, since everything is normalised.
    let thresholds: number[] = [];

    function assignThresholds() {
      const lineOf: number[] = [];
      const lineLengths: number[] = [0];
      let lineIndex = 0;
      let lineTop: number | null = null;
      letters.forEach((el) => {
        const top = el.getBoundingClientRect().top;
        if (lineTop === null) {
          lineTop = top;
        } else if (Math.abs(top - lineTop) > LINE_EPSILON) {
          lineIndex += 1;
          lineLengths.push(0);
          lineTop = top;
        }
        lineOf.push(lineIndex);
        lineLengths[lineIndex] += 1;
      });

      const lineCount = lineLengths.length;
      let indexInLine = 0;
      let currentLine = 0;
      thresholds = letters.map((_, i) => {
        if (lineOf[i] !== currentLine) {
          currentLine = lineOf[i];
          indexInLine = 0;
        }
        const t = (currentLine + indexInLine / lineLengths[currentLine]) / lineCount;
        indexInLine += 1;
        return t;
      });
    }

    assignThresholds();
    const resizeObserver = new ResizeObserver(() => assignThresholds());
    resizeObserver.observe(wrap);

    // cursor-based: only the letters whose state actually changes get
    // touched each frame, instead of re-checking all of them every tick.
    let litUpTo = 0;

    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: TRIGGER_START,
      end: TRIGGER_END,
      scrub: SCRUB,
      onUpdate: (self) => {
        let count = 0;
        while (count < thresholds.length && thresholds[count] <= self.progress) count++;
        if (count === litUpTo) return;
        if (count > litUpTo) {
          for (let i = litUpTo; i < count; i++) setLit(letters[i], true);
        } else {
          for (let i = count; i < litUpTo; i++) setLit(letters[i], false);
        }
        litUpTo = count;
      },
    });

    return () => {
      resizeObserver.disconnect();
      trigger.kill();
    };
  }, [text]);

  return (
    <p className={className} ref={wrapRef}>
      <span className="u-sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split("").map((ch, i) => (
          <span
            className="reveal-letter"
            key={i}
            ref={(el) => {
              letterRefs.current[i] = el;
            }}
          >
            {ch}
          </span>
        ))}
      </span>
    </p>
  );
}
