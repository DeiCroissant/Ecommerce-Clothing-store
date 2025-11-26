'use client';

import { useState, useEffect, useMemo } from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

// Helper to get proper hex color value
const getHexColor = (color) => {
  if (!color) return '#808080'; // Default xám thay vì đen
  // If hex exists and is valid
  if (color.hex && color.hex.startsWith('#')) {
    return color.hex;
  }
  // Fallback color mapping by common names (bao gồm cả có dấu và không dấu)
  const colorMap = {
    // Black / Đen
    'black': '#000000', 'đen': '#000000', 'den': '#000000',
    // White / Trắng  
    'white': '#FFFFFF', 'trắng': '#FFFFFF', 'trang': '#FFFFFF',
    // Gray / Xám
    'gray': '#9CA3AF', 'grey': '#9CA3AF', 'xám': '#9CA3AF', 'xam': '#9CA3AF',
    // Red / Đỏ
    'red': '#EF4444', 'đỏ': '#EF4444', 'do': '#EF4444',
    // Blue / Xanh dương
    'blue': '#3B82F6', 'xanh dương': '#3B82F6', 'xanh duong': '#3B82F6', 'xanh': '#3B82F6',
    // Green / Xanh lá
    'green': '#22C55E', 'xanh lá': '#22C55E', 'xanh la': '#22C55E',
    // Yellow / Vàng
    'yellow': '#EAB308', 'vàng': '#EAB308', 'vang': '#EAB308',
    // Pink / Hồng
    'pink': '#EC4899', 'hồng': '#EC4899', 'hong': '#EC4899',
    // Purple / Tím
    'purple': '#A855F7', 'tím': '#A855F7', 'tim': '#A855F7',
    // Orange / Cam
    'orange': '#F97316', 'cam': '#F97316',
    // Brown / Nâu
    'brown': '#92400E', 'nâu': '#92400E', 'nau': '#92400E',
    // Beige / Be
    'beige': '#D4B896', 'be': '#D4B896', 'kem': '#D4B896',
    // Navy
    'navy': '#1E3A8A',
    // Olive
    'olive': '#6B8E23',
    // Khaki
    'khaki': '#C3B091',
  };
  const slug = (color.slug || color.name || '').toLowerCase().trim();
  return colorMap[slug] || color.hex || '#808080'; // Default xám thay vì đen
};

export default function GooeyColorSwatches({ 
  colors, 
  selectedColor, 
  onColorChange 
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize SVG filter to prevent re-renders
  const svgFilter = useMemo(() => (
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
  ), []);

  return (
    <>
      {/* SVG Filter for Gooey Effect */}
      {mounted && svgFilter}

      <div className="flex flex-wrap gap-3">
        {colors && colors.length > 0 ? (
          colors.map((color, index) => {
            const isSelected = selectedColor === color.slug;
            const hexColor = getHexColor(color);
            return (
              <button
                key={color.slug ? `${color.slug}-${index}` : `color-${index}`}
                type="button"
                onClick={() => {
                  if (color.available && color.slug) {
                    onColorChange(color.slug);
                  }
                }}
                disabled={!color.available}
                className={`relative group ${!color.available ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                title={color.name}
              >
                {/* Outer ring for selected state */}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? 'bg-blue-600 scale-110 shadow-xl'
                      : 'bg-transparent scale-100'
                  }`}
                >
                  {/* Color swatch with gooey effect */}
                  <div
                    className={`w-11 h-11 rounded-full border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-white'
                        : 'border-gray-300 group-hover:border-gray-400'
                    }`}
                    style={{ 
                      backgroundColor: hexColor,
                      filter: mounted ? 'url(#gooey-effect)' : 'none',
                    }}
                  >
                    {/* Checkmark for selected - ONLY show if this is the selected color */}
                    {isSelected && (
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
                {color.available && !isSelected && (
                  <div className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-200" />
                )}

                {/* Tooltip */}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                  {color.name}
                  {!color.available && ' (Hết hàng)'}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-900" />
                </span>
              </button>
            );
          })
        ) : (
          <div className="text-sm text-gray-500">Chưa có màu sắc nào</div>
        )}
      </div>
    </>
  );
}
