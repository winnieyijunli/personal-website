import { useState } from "react";
import GrainOverlay from "./components/GrainOverlay";
import Cursor from "./components/Cursor";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import StatsStatement from "./components/StatsStatement";
import OpeningLoop from "./components/OpeningLoop";
import Approach from "./components/Approach";
import Faq from "./components/Faq";
import Footer from "./components/Footer";
import AboutPanel from "./components/AboutPanel";
import { useScrollAnimations } from "./hooks/useScrollAnimations";
import { useTheme } from "./hooks/useTheme";

export default function App() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const { mode, toggleTheme } = useTheme();

  useScrollAnimations();

  return (
    <>
      <GrainOverlay />
      <Cursor />

      <Navbar onOpenAbout={() => setIsAboutOpen(true)} mode={mode} onToggleTheme={toggleTheme} />

      <main id="top">
        <Hero />
        <StatsStatement />
        <OpeningLoop />
        <Approach />
        <Faq />
        <Footer />
      </main>

      <AboutPanel isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
}
