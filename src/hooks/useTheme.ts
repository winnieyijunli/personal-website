import { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "theme-preference";

// Reads the value the inline script in index.html already applied to
// <html data-color-mode> before React ever mounted, so there's no
// mismatch/flash between first paint and hydration.
function getInitialMode(): ThemeMode {
  return document.documentElement.getAttribute("data-color-mode") === "dark" ? "dark" : "light";
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  useEffect(() => {
    document.documentElement.setAttribute("data-color-mode", mode);
  }, [mode]);

  function setTheme(next: ThemeMode) {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable (private browsing etc.) — mode still
      // applies for this session, it just won't persist.
    }
    setMode(next);
  }

  function toggleTheme() {
    setTheme(mode === "dark" ? "light" : "dark");
  }

  return { mode, setTheme, toggleTheme };
}
