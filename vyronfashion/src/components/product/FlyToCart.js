'use client';

import { useEffect, useRef } from 'react';

export default function FlyToCart({ 
  isActive, 
  productImage, 
  productName,
  startPosition,
  onComplete 
}) {
  const flyingImageRef = useRef(null);
  
  useEffect(() => {
    if (!isActive || !startPosition) return;

    const cartIcon = document.querySelector('[data-cart-icon]');
    if (!cartIcon) {
      onComplete?.();
      return;
    }

    const cartRect = cartIcon.getBoundingClientRect();
    const flyingImg = flyingImageRef.current;
    
    if (!flyingImg) {
      onComplete?.();
      return;
    }

    // Set start position
    flyingImg.style.left = `${startPosition.x}px`;
    flyingImg.style.top = `${startPosition.y}px`;
    flyingImg.style.opacity = '1';
    flyingImg.style.transform = 'scale(1)';

    // Trigger animation after a small delay
    setTimeout(() => {
      flyingImg.style.left = `${cartRect.left + cartRect.width / 2}px`;
      flyingImg.style.top = `${cartRect.top + cartRect.height / 2}px`;
      flyingImg.style.transform = 'scale(0.2)';
      flyingImg.style.opacity = '0.8';
    }, 10);

    // Complete animation
    const timer = setTimeout(() => {
      onComplete?.();
    }, 800);

    return () => clearTimeout(timer);
  }, [isActive, startPosition, onComplete]);

  if (!isActive) return null;

  return (
    <div
      ref={flyingImageRef}
      className="fixed z-[9999] pointer-events-none transition-all duration-700 ease-out"
      style={{
        width: '100px',
        height: '100px',
        opacity: 0,
      }}
    >
      <img
        src={productImage}
        alt={productName}
        className="w-full h-full object-cover rounded-lg shadow-2xl"
      />
    </div>
  );
}
