'use client';

import { useState, useEffect } from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

export default function GooeyColorSwatches({ 
  colors, 
  selectedColor, 
  onColorChange 
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* SVG Filter for Gooey Effect */}
      {mounted && (
        <svg className="absolute w-0 h-0">
          <defs>
            <filter id="gooey-effect">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                result="gooey"
              />
              <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
            </filter>
          </defs>
        </svg>
      )}

      <div className="flex flex-wrap gap-3">
        {colors.map((color) => (
          <button
            key={color.slug}
            onClick={() => color.available && onColorChange(color.slug)}
            disabled={!color.available}
            className={`relative group ${!color.available ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            title={color.name}
          >
            {/* Outer ring for selected state */}
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                selectedColor === color.slug
                  ? 'bg-blue-600 scale-110 shadow-xl'
                  : 'bg-transparent scale-100'
              }`}
            >
              {/* Color swatch with gooey effect */}
              <div
                className={`w-11 h-11 rounded-full border-2 transition-all duration-300 ${
                  selectedColor === color.slug
                    ? 'border-white'
                    : 'border-gray-300 group-hover:border-gray-400'
                }`}
                style={{ 
                  backgroundColor: color.hex,
                  filter: mounted ? 'url(#gooey-effect)' : 'none',
                }}
              >
                {/* Checkmark for selected */}
                {selectedColor === color.slug && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md animate-scale-in">
                      <CheckIcon className="w-4 h-4 text-gray-900" />
                    </div>
                  </div>
                )}

                {/* Out of stock indicator */}
                {!color.available && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-gray-500 rotate-45" />
                  </div>
                )}
              </div>
            </div>

            {/* Animated pulse ring on hover */}
            {color.available && selectedColor !== color.slug && (
              <div className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300" />
            )}

            {/* Tooltip */}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
              {color.name}
              {!color.available && ' (Hết hàng)'}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-900" />
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
