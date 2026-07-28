import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Loop-1.svg deliberately excluded — 5.5MB, would hurt scroll-scrub
// performance, especially on mobile.
const IMAGES = [
  "/opening_loop/Loop-2.svg",
  "/opening_loop/Loop-3.svg",
  "/opening_loop/Loop-4.svg",
  "/opening_loop/Loop-5.svg",
];

const LOOP_HOLD = 1.8; // seconds each image holds before crossfading to the next
const LOOP_TRANSITION = 0.9; // seconds for the crossfade itself

const MEDIA_INSET_MIN = 0; // % — clip-path inset when the section is centred in the viewport
const MEDIA_INSET_MAX = 8; // % — clip-path inset at the far edges of the scroll range
const MEDIA_INSET_REDUCED = 3; // % — frozen inset under prefers-reduced-motion
const MEDIA_RADIUS = 4; // px — rounded-corner radius baked into the same clip-path

// Each line still slides in from its own side (line 1 from the left,
// line 2 from the right) — only where they land changed: two stacked
// rows now, not a single left/right-assembled line.
const TEXT_SLIDE_DESKTOP = 38; // vw — how far each line starts offset from centre, horizontally
const TEXT_SLIDE_MOBILE = 16; // vh — how far each line starts offset on mobile (vertical axis instead)
const DESKTOP_QUERY = "(min-width: 769px)";
const MOBILE_QUERY = "(max-width: 768px)";

// Per-letter settle, layered on top of the big container-level slide —
// each letter fades/squashes in individually rather than the line
// arriving as one flat block.
const LETTER_OFFSET_Y = 14; // px — each letter starts this far below its resting position
const LETTER_SCALE_Y = 0.82; // each letter starts squashed to this scaleY
const LETTER_STAGGER = 0.016; // seconds between consecutive letters within the scrubbed timeline
const LETTER_DURATION = 0.35; // seconds each individual letter's own settle takes
const LINE2_DELAY = 0.06; // seconds line 2's letters start after line 1's
// Every tween in the scrubbed timeline needs an explicit duration that
// fits within this span — GSAP's default (0.5s) was shorter than the
// letter-stagger tail end, so the *timeline's own* total duration ended
// up longer than the x/y convergence tween, meaning convergence finished
// at whatever fraction of the scroll range that ratio worked out to
// (around 40%) rather than spanning the full range end to end.
const TIMELINE_SPAN = 1;

// Widened (end pushed further past the viewport's top) so the
// convergence spreads across roughly 1.7x more scroll distance —
// previously it was finishing well before the section had actually
// scrolled into a comfortable reading position.
// Total span was 270vh (95 + 175); cut 20% to 216vh (95 + 121) — start
// left as-is, end pulled back in.
const TRIGGER_START = "top 95%";
const TRIGGER_END = "top -121%";
// true, not a number — zero smoothing lag, so the animation reads as
// exact 1:1 scrollbar tracking rather than something that visibly
// catches up after the fact (a number like 0.35 was technically still
// bidirectional/scrub-driven, but over this ~700px range a normal-speed
// scroll made the lag itself look like a directional snap).
const SCRUB = true;

function insetClip(percent: number) {
  return `inset(${percent}% round ${MEDIA_RADIUS}px)`;
}

type Segment = { text: string; script?: boolean };
const LINE1_SEGMENTS: Segment[] = [{ text: "we design" }];
const LINE2_SEGMENTS: Segment[] = [{ text: "to taste life, " }, { text: "twice", script: true }];

function LetterSpans({
  segments,
  onRef,
}: {
  segments: Segment[];
  onRef: (index: number, el: HTMLSpanElement | null) => void;
}) {
  let i = -1;
  return (
    <>
      {segments.map((seg, si) => {
        // Script segments stay as one unit — Pinyon Script's strokes
        // connect/overlap between letters, and isolating each character
        // in its own inline-block box would clip those connections. It
        // still participates in the same stagger sequence, just as a
        // single step rather than N.
        if (seg.script) {
          i += 1;
          const idx = i;
          return (
            <span key={si} className="opening-loop-letter hero-title-script" ref={(el) => onRef(idx, el)}>
              {seg.text}
            </span>
          );
        }
        return seg.text.split("").map((ch, ci) => {
          i += 1;
          const idx = i;
          // A literal " " inside a display:inline-block span collapses to
          // zero visual width under whitespace-collapsing rules in most
          // engines. The previous attempt at this used a plain " " in the
          // JSX text position, which is indistinguishable from a normal
          // space once written to the file — it never actually inserted
          // U+00A0, so the bug was never fixed.   (an explicit escape,
          // not a literal character) guarantees the correct codepoint.
          const content = ch === " " ? " " : ch;
          return (
            <span key={`${si}-${ci}`} className="opening-loop-letter" ref={(el) => onRef(idx, el)}>
              {content}
            </span>
          );
        });
      })}
    </>
  );
}

// The "opening" scroll block between the intro stats and the work grid:
// three stacked rows, in normal document flow (no overlap at all) —
// "we design", the looping image, "to taste life, twice". The two text
// rows slide in from opposite sides (line 1 from the left, line 2 from
// the right) to their centred resting position; the image never moves,
// only its own clip-path zoom changes as the section passes the
// viewport's centre.
export default function OpeningLoop() {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const line1Ref = useRef<HTMLHeadingElement>(null);
  const line2Ref = useRef<HTMLHeadingElement>(null);
  const line1LetterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const line2LetterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const media = mediaRef.current;
    const line1 = line1Ref.current;
    const line2 = line2Ref.current;
    if (!section || !media || !line1 || !line2) return;

    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const images = imgRefs.current.filter((el): el is HTMLImageElement => !!el);
    const line1Letters = line1LetterRefs.current.filter((el): el is HTMLSpanElement => !!el);
    const line2Letters = line2LetterRefs.current.filter((el): el is HTMLSpanElement => !!el);

    if (reduceMotion) {
      // frozen: both lines already assembled at their resting (0,0)
      // position, every letter already settled, image at a medium
      // size — no scroll-driven zoom/slide, no crossfade loop. The
      // travel distance above doesn't matter here: "settled" is always
      // x:0/y:0 regardless of how far a line travelled to get there.
      gsap.set(media, { clipPath: insetClip(MEDIA_INSET_REDUCED) });
      gsap.set(images, { opacity: 0 });
      if (images[0]) gsap.set(images[0], { opacity: 1 });
      gsap.set([line1, line2], { x: 0, y: 0 });
      gsap.set([...line1Letters, ...line2Letters], { opacity: 1, y: 0, scaleY: 1 });
      return;
    }

    // Image crossfade loop + scroll-driven zoom live in their own
    // context, independent of the matchMedia below.
    const ctx = gsap.context(() => {
      if (images.length >= 2) {
        gsap.set(images, { opacity: 0 });
        gsap.set(images[0], { opacity: 1 });
        const tl = gsap.timeline({ repeat: -1 });
        images.forEach((img, i) => {
          const next = images[(i + 1) % images.length];
          tl.to({}, { duration: LOOP_HOLD })
            .to(img, { opacity: 0, duration: LOOP_TRANSITION, ease: "sine.inOut" })
            .to(next, { opacity: 1, duration: LOOP_TRANSITION, ease: "sine.inOut" }, "<");
        });
      }

      // scroll-driven zoom: clip-path inset is a continuous function of
      // distance between the section's centre and the viewport's centre.
      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: () => {
          const rect = section.getBoundingClientRect();
          const sectionCenter = rect.top + rect.height / 2;
          const viewportCenter = window.innerHeight / 2;
          const maxDist = window.innerHeight / 2 + rect.height / 2;
          const dist = Math.min(Math.abs(sectionCenter - viewportCenter), maxDist);
          const proximity = 1 - dist / maxDist;
          const inset = MEDIA_INSET_MAX - proximity * (MEDIA_INSET_MAX - MEDIA_INSET_MIN);
          gsap.set(media, { clipPath: insetClip(inset) });
        },
      });
    }, section);

    // Deliberately NOT nested inside the gsap.context() above —
    // gsap.matchMedia() already manages its own condition-scoped
    // lifecycle. Kept as an independent sibling.
    const mm = gsap.matchMedia();
    mm.add(DESKTOP_QUERY, () => {
      gsap.set(line1, { x: `-${TEXT_SLIDE_DESKTOP}vw`, y: 0 });
      gsap.set(line2, { x: `${TEXT_SLIDE_DESKTOP}vw`, y: 0 });
      gsap.set([...line1Letters, ...line2Letters], { opacity: 0, y: LETTER_OFFSET_Y, scaleY: LETTER_SCALE_Y });

      gsap
        .timeline({ scrollTrigger: { trigger: section, start: TRIGGER_START, end: TRIGGER_END, scrub: SCRUB } })
        .to(line1, { x: 0, ease: "none", duration: TIMELINE_SPAN }, 0)
        .to(line2, { x: 0, ease: "none", duration: TIMELINE_SPAN }, 0)
        .to(line1Letters, { opacity: 1, y: 0, scaleY: 1, stagger: LETTER_STAGGER, duration: LETTER_DURATION, ease: "power2.out" }, 0)
        .to(line2Letters, { opacity: 1, y: 0, scaleY: 1, stagger: LETTER_STAGGER, duration: LETTER_DURATION, ease: "power2.out" }, LINE2_DELAY);
    });
    mm.add(MOBILE_QUERY, () => {
      gsap.set(line1, { x: 0, y: `-${TEXT_SLIDE_MOBILE}vh` });
      gsap.set(line2, { x: 0, y: `${TEXT_SLIDE_MOBILE}vh` });
      gsap.set([...line1Letters, ...line2Letters], { opacity: 0, y: LETTER_OFFSET_Y, scaleY: LETTER_SCALE_Y });

      gsap
        .timeline({ scrollTrigger: { trigger: section, start: TRIGGER_START, end: TRIGGER_END, scrub: SCRUB } })
        .to(line1, { y: 0, ease: "none", duration: TIMELINE_SPAN }, 0)
        .to(line2, { y: 0, ease: "none", duration: TIMELINE_SPAN }, 0)
        .to(line1Letters, { opacity: 1, y: 0, scaleY: 1, stagger: LETTER_STAGGER, duration: LETTER_DURATION, ease: "power2.out" }, 0)
        .to(line2Letters, { opacity: 1, y: 0, scaleY: 1, stagger: LETTER_STAGGER, duration: LETTER_DURATION, ease: "power2.out" }, LINE2_DELAY);
    });
    // ScrollTriggers created inside a gsap.matchMedia() callback that
    // isn't itself nested in a gsap.context() don't get their start/end
    // pixel positions calculated until the next explicit refresh — this
    // forces that calculation immediately instead of leaving the trigger
    // silently stuck reporting start:0/end:undefined and never updating.
    ScrollTrigger.refresh();

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

  return (
    <section className="opening-loop section-light" data-theme-section="light" ref={sectionRef}>
      <div className="wrap opening-loop-inner">
        <h2 className="opening-loop-line opening-loop-line-1" ref={line1Ref}>
          <LetterSpans
            segments={LINE1_SEGMENTS}
            onRef={(i, el) => {
              line1LetterRefs.current[i] = el;
            }}
          />
        </h2>
        <div className="opening-loop-media" ref={mediaRef} style={{ clipPath: insetClip(MEDIA_INSET_MAX) }}>
          {IMAGES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              className="opening-loop-img"
              ref={(el) => {
                imgRefs.current[i] = el;
              }}
            />
          ))}
        </div>
        <h2 className="opening-loop-line opening-loop-line-2" ref={line2Ref}>
          <LetterSpans
            segments={LINE2_SEGMENTS}
            onRef={(i, el) => {
              line2LetterRefs.current[i] = el;
            }}
          />
        </h2>
      </div>
    </section>
  );
}
