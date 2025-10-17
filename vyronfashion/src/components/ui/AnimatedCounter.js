'use client';

import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

/**
 * AnimatedCounter Component
 * Animates a number from 0 to target value with easing
 * @param {number} value - Target value to count to
 * @param {number} duration - Animation duration in seconds (default: 2)
 * @param {string} suffix - Optional suffix (e.g., '+', 'K')
 * @param {number} decimals - Number of decimal places (default: 0)
 */
export default function AnimatedCounter({ 
  value, 
  duration = 2, 
  suffix = '', 
  decimals = 0 
}) {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 50,
    stiffness: 100,
    duration: duration * 1000
  });
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = latest.toFixed(decimals) + suffix;
      }
    });

    return () => unsubscribe();
  }, [springValue, suffix, decimals]);

  return <span ref={ref}>0{suffix}</span>;
}
