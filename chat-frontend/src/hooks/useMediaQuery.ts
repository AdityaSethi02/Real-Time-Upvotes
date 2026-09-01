"use client";

import { useEffect, useState } from "react";

function getInitialMatch(query: string): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(query).matches;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => getInitialMatch(query));

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
