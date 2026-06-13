import { useState, useEffect } from 'react';

/**
 * Hook to detect responsive breakpoints.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/** True when viewport is mobile-sized (<768px) */
export function useIsMobile() {
  return useMediaQuery('(max-width: 767px)');
}

/** True when viewport is tablet-sized (768px–1279px) */
export function useIsTablet() {
  return useMediaQuery('(min-width: 768px) and (max-width: 1279px)');
}

/** True when viewport is desktop-sized (≥1280px) */
export function useIsDesktop() {
  return useMediaQuery('(min-width: 1280px)');
}
