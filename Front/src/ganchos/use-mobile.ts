import { useEffect, useState } from "react";

// Detecta si el viewport es considerado "móvil" según un breakpoint (md = 768px)
export function useIsMobile(breakpointPx: number = 768) {
  const query = `(max-width: ${breakpointPx - 1}px)`;
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined" || typeof window.matchMedia === "undefined") {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia === "undefined") return;
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    // Safari antiguo
    if (typeof (mql as MediaQueryList).addEventListener === "function") {
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }

    // Soporte legacy (Safari/antiguos): MediaQueryList puede exponer addListener/removeListener
    const legacyMql = mql as unknown as {
      addListener?: (listener: (e: MediaQueryListEvent) => void) => void;
      removeListener?: (listener: (e: MediaQueryListEvent) => void) => void;
    };
    legacyMql.addListener?.(handler);
    return () => legacyMql.removeListener?.(handler);
  }, [query]);

  return isMobile;
}
