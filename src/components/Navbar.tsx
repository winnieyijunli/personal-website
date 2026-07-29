import { useEffect, useId, useRef, useState } from "react";
import type { ThemeMode } from "../hooks/useTheme";

type NavbarProps = {
  onOpenAbout: () => void;
  mode: ThemeMode;
  onToggleTheme: () => void;
};

export default function Navbar({ onOpenAbout, mode, onToggleTheme }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  // Escape closes the mobile menu and returns focus to the toggle button —
  // the minimum keyboard-accessibility bar for a disclosure like this.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleAboutClick() {
    closeMenu();
    onOpenAbout();
  }

  return (
    <header className="navbar" data-theme="light" data-navbar data-menu-open={menuOpen}>
      <div className="navbar-row">
        <a href="#top" className="nav-mark" onClick={closeMenu}>
          Winnie&nbsp;Li
        </a>
        <nav className="nav-links">
          <a href="#approach">Work</a>
          <a href="#faq">Approach</a>
          <button type="button" onClick={onOpenAbout}>
            About
          </button>
          <a href="#contact">Contact</a>
        </nav>
        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {mode === "dark" ? (
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36A5.4 5.4 0 0 1 12 3Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
        <a
          href="https://drive.google.com/file/d/1jG7NmC3lHWAtQuysw_hNQDOclS7dnRRM/view?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-cta"
        >
          Download PDF Portfolio →
        </a>
        <button
          type="button"
          className="nav-menu-btn"
          ref={menuBtnRef}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="nav-menu-btn-bar" />
          <span className="nav-menu-btn-bar" />
        </button>
      </div>

      <div className="nav-menu-panel" aria-hidden={!menuOpen}>
        <nav id={menuId} className="nav-menu-panel-inner">
          <a href="#approach" onClick={closeMenu}>
            Work
          </a>
          <a href="#faq" onClick={closeMenu}>
            Approach
          </a>
          <button type="button" onClick={handleAboutClick}>
            About
          </button>
          <a href="#contact" onClick={closeMenu}>
            Contact
          </a>
          <a
            href="https://drive.google.com/file/d/1jG7NmC3lHWAtQuysw_hNQDOclS7dnRRM/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
          >
            Download PDF Portfolio →
          </a>
        </nav>
      </div>
    </header>
  );
}
