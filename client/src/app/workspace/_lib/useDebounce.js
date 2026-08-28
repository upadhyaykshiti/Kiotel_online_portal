"use client";

import { useCallback, useRef } from "react";

// Change 4: React-safe debounce using ref — no closure leak across re-renders
export function useDebounce(fn, delayMs) {
  const timerRef = useRef(null);

  return useCallback(
    (...args) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fn(...args), delayMs);
    },
    [fn, delayMs]
  );
}