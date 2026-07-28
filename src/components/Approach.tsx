import { approachItems } from "../data/approach";
import { approachCarousels } from "../data/approachCarousels";
import ApproachCarousel from "./ApproachCarousel";

// Reproduces the teardown's data-stacking-cards-item technique: each panel
// pins full-viewport while the next one scrolls up to cover it (see
// useScrollAnimations for the ScrollTrigger.pin wiring).
export default function Approach() {
  return (
    <section id="approach" data-theme-section="dark">
      <div className="approach-stack" data-approach-stack>
        {approachItems.map((item, i) => {
          const carousel = approachCarousels[item.index];
          return (
            <div className="approach-panel" data-stack-panel key={item.index}>
              <div className="wrap approach-panel-inner">
                <div className="approach-carousel-slot">
                  {carousel && (
                    <ApproachCarousel
                      slides={carousel.slides}
                      aspect={carousel.aspect}
                      captionStyle={carousel.captionStyle}
                      mediaFit={carousel.mediaFit}
                    />
                  )}
                </div>
                <div className="approach-content">
                  {i === 0 && (
                    <p className="eyebrow approach-eyebrow">
                      <span className="dot" /> Selected work
                    </p>
                  )}
                  <span className="approach-num mono">{item.index}</span>
                  <div className="approach-body">
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                    {item.caseStudyUrl && (
                      <a
                        className="approach-case-link"
                        href={item.caseStudyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View full case study <span aria-hidden="true">→</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
