'use client';

import { useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';
import GooeyColorSwatches from './GooeyColorSwatches';

export default function VariantSelector({ variants, onVariantChange }) {
  const [selectedColor, setSelectedColor] = useState(variants.colors[0]?.slug || null);
  const [selectedSize, setSelectedSize] = useState(null);

  const handleColorChange = (colorSlug) => {
    setSelectedColor(colorSlug);
    onVariantChange({ color: colorSlug, size: selectedSize });
  };

  const handleSizeChange = (sizeName) => {
    setSelectedSize(sizeName);
    onVariantChange({ color: selectedColor, size: sizeName });
  };

  return (
    <div className="space-y-6">
      {/* Color Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-900">
            Màu sắc: {selectedColor && (
              <span className="font-normal text-gray-600">
                {variants.colors.find(c => c.slug === selectedColor)?.name}
              </span>
            )}
          </label>
        </div>
        
        <GooeyColorSwatches
          colors={variants.colors}
          selectedColor={selectedColor}
          onColorChange={handleColorChange}
        />
      </div>

      {/* Size Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-900">
            Kích cỡ: {selectedSize && (
              <span className="font-normal text-gray-600">{selectedSize}</span>
            )}
          </label>
          <button className="text-sm text-blue-600 hover:underline">
            Hướng dẫn chọn size
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {variants.sizes.map((size) => (
            <button
              key={size.name}
              onClick={() => size.available && handleSizeChange(size.name)}
              disabled={!size.available}
              className={`relative py-3 px-4 border-2 rounded-lg font-medium transition-all ${
                selectedSize === size.name
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : size.available
                  ? 'border-gray-300 hover:border-gray-400 text-gray-900'
                  : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              {size.name}
              
              {/* Out of stock overlay */}
              {!size.available && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-0.5 bg-gray-400 rotate-45" />
                </div>
              )}

              {/* Low stock indicator */}
              {size.available && size.stock < 5 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" title="Sắp hết hàng" />
              )}
            </button>
          ))}
        </div>

        {/* Size warning */}
        {selectedSize && variants.sizes.find(s => s.name === selectedSize)?.stock < 5 && (
          <p className="mt-2 text-sm text-orange-600">
            ⚠️ Chỉ còn {variants.sizes.find(s => s.name === selectedSize)?.stock} sản phẩm với size này
          </p>
        )}
      </div>
    </div>
  );
}
