'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

/**
 * Welcome Screen - Initial landing animation
 * Fades out when user scrolls or clicks skip button
 */
export default function WelcomeScreen({ onComplete }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Hide on scroll
    const handleScroll = () => {
      if (window.scrollY > 50) { // Scroll threshold
        setShow(false);
        setTimeout(() => onComplete?.(), 800); // Wait for exit animation
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onComplete]);

  const handleSkip = () => {
    setShow(false);
    setTimeout(() => onComplete?.(), 800);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }} />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center px-4">
            {/* Logo/Brand Name */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-white" />
                <h1 className="text-6xl md:text-7xl font-bold text-white tracking-tight">
                  VyronFashion
                </h1>
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            {/* Tagline */}
            <motion.p
              className="text-xl md:text-2xl text-zinc-300 font-light tracking-wide"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Discover Your Style Story
            </motion.p>

            {/* Scroll Indicator */}
            <motion.div
              className="absolute bottom-12 left-1/2 -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 2 }}
            >
              <div className="flex flex-col items-center gap-2 text-zinc-400">
                <span className="text-sm font-medium">Scroll to explore</span>
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ChevronDown className="w-6 h-6" />
                </motion.div>
              </div>
            </motion.div>

            {/* Skip Button */}
            <motion.button
              onClick={handleSkip}
              className="absolute top-8 right-8 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Skip Intro
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
