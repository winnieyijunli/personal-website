import HeroField from "./HeroField";

// Homepage banner/hero. Background/text now track the global colour mode
// (see index.css .hero rule + Step 1 tokens) instead of being locked dark —
// per the light-mode sketch, the hero sits on the warm ivory background in
// light mode, and the warm near-black in dark mode.
export default function Hero() {
  return (
    <section className="hero" data-theme-section="light">
      <HeroField />
      <div className="wrap hero-inner">
        <h1 className="hero-title" data-split>
          Quiet clarity,
          <br />
          designed for <em className="hero-title-script">humanity.</em>
        </h1>
      </div>
    </section>
  );
}
