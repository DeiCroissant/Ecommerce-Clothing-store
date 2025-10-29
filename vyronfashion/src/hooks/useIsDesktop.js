'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect if viewport is desktop size (>= 1024px)
 * Used for conditional scrollytelling features
 */
export function useIsDesktop(breakpoint = 1024) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Initial check
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

  // Return false during SSR to avoid hydration mismatch
  return isClient ? isDesktop : false;
}
