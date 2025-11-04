'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect if viewport is desktop size (>= 1024px)
 * Used for conditional scrollytelling features
 * 
 * Returns:
 * - null: During SSR and initial client render (before measurement)
 * - true: Desktop viewport (>= breakpoint)
 * - false: Mobile viewport (< breakpoint)
 */
export function useIsDesktop(breakpoint = 1024) {
  // Initialize as null to indicate "not yet measured"
  const [isDesktop, setIsDesktop] = useState(null);

  useEffect(() => {
    // Initial check - runs only on client
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= breakpoint);
    };

    checkDesktop();

    // Listen for resize
    const handleResize = () => {
      checkDesktop();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  // Return null during SSR and initial render to prevent hydration mismatch
  return isDesktop;
}
