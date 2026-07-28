import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { CarouselAspect, CarouselCaptionStyle, CarouselMediaFit, CarouselSlide } from "../data/approachCarousels";

type Props = {
  slides: CarouselSlide[];
  aspect: CarouselAspect;
  captionStyle: CarouselCaptionStyle;
  mediaFit?: CarouselMediaFit;
};

const ASPECT_RATIO: Record<CarouselAspect, string> = {
  "4:3": "4 / 3",
  "16:9": "16 / 9",
  "1:1": "1 / 1",
};

// One reusable carousel, driven entirely by props — aspect ratio and
// caption verbosity differ per Approach panel (see approachCarousels.ts),
// the interaction/markup/CSS is shared. Embla handles the actual
// drag/scroll-snap mechanics; everything else (arrows, dots, hover,
// overlay) is plain React + CSS matching the rest of this project.
export default function ApproachCarousel({ slides, aspect, captionStyle, mediaFit = "cover" }: Props) {
  const mediaClassName = `approach-carousel-img${mediaFit === "contain" ? " approach-carousel-img-contain" : ""}`;
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: false });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [selected, setSelected] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Pause any video slide once it's scrolled off-screen (and off-panel,
  // since these carousels live inside Approach's pinned stacking
  // panels) — no point decoding frames nobody can see.
  useEffect(() => {
    const videos = videoRefs.current.filter((el): el is HTMLVideoElement => !!el);
    if (videos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) video.play().catch(() => {});
          else video.pause();
        });
      },
      { threshold: 0.25 },
    );
    videos.forEach((v) => observer.observe(v));
    return () => observer.disconnect();
  }, [slides]);

  return (
    <div className="approach-carousel">
      <div className="approach-carousel-viewport" ref={emblaRef}>
        <div className="approach-carousel-track">
          {slides.map((slide, i) => (
            <div
              className="approach-carousel-slide"
              key={i}
              style={{ aspectRatio: ASPECT_RATIO[aspect] }}
            >
              {slide.video ? (
                <video
                  className={mediaClassName}
                  src={slide.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                />
              ) : slide.image ? (
                <img src={slide.image} alt={slide.title} className={mediaClassName} />
              ) : (
                <div className="approach-carousel-placeholder" aria-hidden="true">
                  Image placeholder
                </div>
              )}
              <div className={`approach-carousel-overlay approach-carousel-overlay-${captionStyle}`}>
                <h4 className="approach-carousel-title">{slide.title}</h4>
                {slide.subtitle && <p className="approach-carousel-subtitle">{slide.subtitle}</p>}
                {captionStyle === "full" && slide.description && (
                  <p className="approach-carousel-desc">{slide.description}</p>
                )}
                {captionStyle === "full" && slide.link && (
                  <a
                    className="approach-carousel-readmore"
                    href={slide.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read more <span aria-hidden="true">→</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="approach-carousel-controls">
        <button
          type="button"
          className="approach-carousel-btn"
          onClick={() => emblaApi?.scrollPrev()}
          disabled={!canPrev}
          aria-label="Previous slide"
        >
          <svg viewBox="0 0 13 13" fill="none">
            <path
              d="M6.696 13L0 6.5L6.696 0L8.04 1.328L3.672 5.545H13V7.455H3.672L8.04 11.695L6.696 13Z"
              fill="currentColor"
            />
          </svg>
        </button>
        <div className="approach-carousel-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`approach-carousel-dot${i === selected ? " is-active" : ""}`}
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <button
          type="button"
          className="approach-carousel-btn"
          onClick={() => emblaApi?.scrollNext()}
          disabled={!canNext}
          aria-label="Next slide"
        >
          <svg viewBox="0 0 13 13" fill="none">
            <path
              d="M6.304 0L13 6.5L6.304 13L4.96 11.672L9.328 7.455H0V5.545H9.328L4.96 1.305L6.304 0Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
