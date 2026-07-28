export {};

declare global {
  interface Window {
    __lenis?: {
      stop: () => void;
      start: () => void;
      destroy: () => void;
    };
  }
}
