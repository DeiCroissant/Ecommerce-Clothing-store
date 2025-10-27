'use client';

import { useEffect, useState } from 'react';

const CONFETTI_COUNT = 50;
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

function ConfettiPiece({ color, delay, startX }) {
  const randomRotation = Math.random() * 360;
  const randomEndX = startX + (Math.random() - 0.5) * 400;
  const randomEndY = Math.random() * 300 + 200;
  
  return (
    <div
      className="absolute w-2 h-2 animate-confetti-fall"
      style={{
        backgroundColor: color,
        left: `${startX}px`,
        top: '50%',
        animationDelay: `${delay}ms`,
        '--end-x': `${randomEndX}px`,
        '--end-y': `${randomEndY}px`,
        '--rotation': `${randomRotation}deg`,
      }}
    />
  );
}

export default function Confetti({ isActive, origin = { x: 0, y: 0 }, onComplete }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!isActive) {
      setPieces([]);
      return;
    }

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onComplete?.();
      return;
    }

    // Generate confetti pieces
    const newPieces = Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      id: i,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 100,
      startX: origin.x + (Math.random() - 0.5) * 100,
    }));

    setPieces(newPieces);

    // Clean up after animation
    const timer = setTimeout(() => {
      setPieces([]);
      onComplete?.();
    }, 1500);

    return () => clearTimeout(timer);
  }, [isActive, origin, onComplete]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998]">
      {pieces.map((piece) => (
        <ConfettiPiece
          key={piece.id}
          color={piece.color}
          delay={piece.delay}
          startX={piece.startX}
        />
      ))}
    </div>
  );
}
