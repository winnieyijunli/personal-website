import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

// Ported from the legacy static site's main.js. Ties together Lenis smooth
// scroll, GSAP ScrollTrigger, the split-line hero reveal, fade-ups, the
// pinned stacking cards in Approach, the footer curtain peel, and navbar
// dark/light swap. (The custom cursor lives in its own self-contained
// component, Cursor.tsx, same pattern as HeroField/FooterWordmark.)
// Runs once on mount.
export function useScrollAnimations() {
  useEffect(() => {
    // Lenis smooth scroll — anchors:true hands nav-link clicks (#approach,
    // #faq, #contact, #top) to Lenis's own scrollTo instead of the
    // browser's native instant jump, so they animate the same way the
    // rest of the page's scrolling does. Defaults to false, so this was
    // never actually wired up before now.
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: true });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    // split-line hero reveal
    // Guarded against re-processing: React StrictMode double-invokes effects
    // in dev (mount -> cleanup -> mount), and this innerHTML mutation isn't
    // idempotent — running it twice would wrap the already-wrapped markup
    // again and corrupt the title's layout.
    document.querySelectorAll<HTMLElement>("[data-split]:not([data-reveal])").forEach((el) => {
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
    gsap.utils.toArray<HTMLElement>("[data-fade]").forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        onEnter: () => el.classList.add("is-visible"),
        once: true,
      });
    });

    // work cards: staggered reveal
    gsap.utils.toArray<HTMLElement>(".work-card").forEach((card, i) => {
      gsap.from(card, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: card, start: "top 90%" },
        delay: (i % 2) * 0.08,
      });
    });

    // Note: the hero's own background motion (idle drift, cursor-bias,
    // scroll trail) is now handled inside HeroField.tsx, not here.

    // footer: curtain peel-reveal, scroll-scrubbed — end pulled in from
    // "top top" to "top 15%", cutting the scroll distance needed by 15%
    // (100vh -> 85vh) so it completes with less scrolling.
    const curtain = document.querySelector<HTMLElement>("[data-footer-curtain]");
    if (curtain) {
      gsap.to(curtain, {
        yPercent: -100,
        ease: "none",
        scrollTrigger: {
          trigger: curtain.closest(".footer"),
          start: "top bottom",
          end: "top 15%",
          scrub: true,
        },
      });
    }

    // approach section: pinned stacking cards
    const stackPanels = gsap.utils.toArray<HTMLElement>("[data-stack-panel]");
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
    const navbar = document.querySelector<HTMLElement>("[data-navbar]");
    document.querySelectorAll<HTMLElement>("[data-theme-section]").forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top 80px",
        end: "bottom 80px",
        onToggle: (self) => {
          if (self.isActive && navbar) {
            navbar.setAttribute("data-theme", section.getAttribute("data-theme-section") ?? "dark");
          }
        },
      });
    });

    // Recalculate all trigger start/end positions once the page has fully
    // settled (webfonts + the work-grid images can each shift layout after
    // ScrollTrigger's first pass, which otherwise leaves later sections'
    // triggers pointing at stale positions).
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);

    return () => {
      window.removeEventListener("load", refresh);
      ScrollTrigger.getAll().forEach((st) => st.kill());
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);
}
