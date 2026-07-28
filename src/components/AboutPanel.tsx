import { useEffect } from "react";
import { aboutBio, aboutOutside, aboutPractice, aboutPrinciples } from "../data/about";

type AboutPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AboutPanel({ isOpen, onClose }: AboutPanelProps) {
  useEffect(() => {
    document.body.classList.toggle("is-about-open", isOpen);
    if (isOpen) {
      window.__lenis?.stop();
    } else {
      window.__lenis?.start();
    }
  }, [isOpen]);

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) onClose();
    }
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [isOpen, onClose]);

  return (
    <>
      <div className="about-overlay" onClick={onClose} />
      <aside className="about-panel" aria-hidden={!isOpen} data-lenis-prevent>
        <button type="button" className="about-close" onClick={onClose}>
          <span>Close</span>
          <span aria-hidden="true">✕</span>
        </button>

        <div className="about-block">
          <p className="eyebrow">
            <span className="dot" /> Who I am
          </p>
          <div className="about-bio">
            {aboutBio.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="about-block">
          <div className="about-picture">
            <video src="/work/About.MOV" autoPlay loop muted playsInline />
          </div>
        </div>

        <div className="about-block">
          <p className="eyebrow">
            <span className="dot" /> Areas of Practice
          </p>
          <div className="about-practice-list">
            {aboutPractice.map((item) => (
              <div className="about-practice-item" key={item.title}>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="about-block">
          <p className="eyebrow">
            <span className="dot" /> Outside Design
          </p>
          <div className="about-outside-list">
            {aboutOutside.map((item) => (
              <div className="about-outside-item" key={item.title}>
                <h4>{item.title}</h4>
                {item.paragraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="about-block">
          <p className="eyebrow">
            <span className="dot" /> Design Principles
          </p>
          <div className="about-principles">
            {aboutPrinciples.map((principle) => (
              <div className="about-principle" key={principle.title}>
                <h4>{principle.title}</h4>
                <p>{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
