'use client';

import { useState, useEffect } from 'react';
import GooeyColorSwatches from './GooeyColorSwatches';

export default function VariantSelector({ variants, onVariantChange }) {
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  // Initialize color when variants load
  useEffect(() => {
    if (variants?.colors && variants.colors.length > 0 && !selectedColor) {
      const firstColor = variants.colors.find(c => c.available) || variants.colors[0];
      if (firstColor?.slug) {
        setSelectedColor(firstColor.slug);
        onVariantChange({ color: firstColor.slug, size: null });
      }
    }
  }, [variants?.colors]);

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
                {variants?.colors?.find(c => c.slug === selectedColor)?.name}
              </span>
            )}
          </label>
        </div>
        
        {variants?.colors && variants.colors.length > 0 ? (
          <GooeyColorSwatches
            colors={variants.colors}
            selectedColor={selectedColor}
            onColorChange={handleColorChange}
          />
        ) : (
          <div className="text-sm text-gray-500 py-4">Chưa có màu sắc nào</div>
        )}
      </div>

      {/* Size Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-900">
            Kích cỡ: {selectedSize && (
              <span className="font-normal text-gray-600">{selectedSize}</span>
            )}
          </label>
          <button type="button" className="text-sm text-blue-600 hover:underline">
            Hướng dẫn chọn size
          </button>
        </div>

        {variants?.sizes && Array.isArray(variants.sizes) && variants.sizes.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {variants.sizes.map((size, index) => {
              // Lấy tên size - từ database sẽ là object với name, available, stock
              const sizeName = size?.name || '';
              const isSelected = selectedSize === sizeName;
              const isAvailable = size?.available !== false;
              
              // Bỏ qua nếu không có tên
              if (!sizeName) return null;
              
              return (
                <button
                  key={`size-${sizeName}-${index}`}
                  type="button"
                  onClick={() => {
                    console.log('Clicking size:', sizeName, 'Available:', isAvailable);
                    if (isAvailable) {
                      handleSizeChange(sizeName);
                    }
                  }}
                  disabled={!isAvailable}
                  className={`relative py-3 px-6 border-2 rounded-lg font-semibold text-sm transition-all ${
                    isSelected && isAvailable
                      ? 'border-blue-600 bg-blue-600 text-white shadow-lg'
                      : isAvailable
                      ? 'border-gray-300 bg-white text-gray-900 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                      : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  {sizeName}
                  {isSelected && isAvailable && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                  {!isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-full h-0.5 bg-gray-400 rotate-45" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-gray-500 py-4">
            Chưa có size nào. 
            {variants && console.log('Debug - variants.sizes:', variants.sizes)}
          </div>
        )}

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
