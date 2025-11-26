'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function ProductGallery({ images, productName, onImageClick }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Normalize images - đảm bảo format đúng
  const normalizedImages = images.map((img, index) => {
    if (typeof img === 'string') {
      return { url: img, alt: `${productName} - Ảnh ${index + 1}`, colorSlug: null };
    }
    return {
      url: img.url || img.src || '',
      alt: img.alt || `${productName} - Ảnh ${index + 1}`,
      colorSlug: img.colorSlug || null // Preserve color metadata
    };
  }).filter(img => img.url && img.url.trim() !== ''); // Lọc bỏ images không có URL

  // Reset to first image when images array changes (e.g., when color is selected)
  // Use ref to track previous images to detect structural changes
  const prevImagesRef = useRef(images);
  
  useEffect(() => {
    // Check if images array structure changed (not just same array reference)
    const imagesChanged = JSON.stringify(prevImagesRef.current) !== JSON.stringify(images);
    
    if (imagesChanged) {
      // Reset to first image when images change (e.g., color selection changes image order)
      setSelectedImage(0);
      prevImagesRef.current = images;
    }
  }, [images]);
  
  // Handle image click - just change selected image, don't auto-switch color
  const handleImageClick = (index) => {
    // Validate index
    if (index < 0 || index >= normalizedImages.length) {
      console.warn('Invalid image index:', index, 'out of', normalizedImages.length);
      return;
    }
    
    // Simply update selected image - no color switching to prevent reordering
    setSelectedImage(index);
  };
  
  // Check if image is base64 (data:image/...)
  const isBase64Image = (url) => {
    return url && url.startsWith('data:image/');
  };

  // Fallback nếu không có images
  if (normalizedImages.length === 0) {
    return (
      <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
        <p className="text-gray-400">Không có hình ảnh</p>
      </div>
    );
  }

  const handlePrevious = () => {
    setSelectedImage((prev) => (prev === 0 ? normalizedImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedImage((prev) => (prev === normalizedImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex gap-4 w-full">
      {/* Thumbnail Column - Desktop */}
      <div className="hidden md:flex flex-col gap-2.5 w-20 lg:w-24 flex-shrink-0">
        {normalizedImages.slice(0, 6).map((image, index) => {
          // Kiểm tra URL có hợp lệ không (bao gồm base64)
          const isValidUrl = image.url && (
            image.url.startsWith('/') || 
            image.url.startsWith('http') || 
            isBase64Image(image.url)
          );
          
          return (
            <button
              key={`thumb-desktop-${image.url}-${index}`}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleImageClick(index);
              }}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                selectedImage === index
                  ? 'border-blue-600 shadow-lg ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              title={image.colorSlug ? `Thuộc màu: ${image.colorSlug}` : ''}
            >
              {isValidUrl ? (
                isBase64Image(image.url) ? (
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="96px"
                    unoptimized={image.url.startsWith('http') && !image.url.includes('localhost')}
                  />
                )
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                  No image
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Gallery */}
      <div className="flex-1">
        {/* Main Image */}
        <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden group">
          {normalizedImages[selectedImage] && (
            (normalizedImages[selectedImage].url.startsWith('/') || 
             normalizedImages[selectedImage].url.startsWith('http') || 
             isBase64Image(normalizedImages[selectedImage].url)) ? (
              isBase64Image(normalizedImages[selectedImage].url) ? (
                <img
                  src={normalizedImages[selectedImage].url}
                  alt={normalizedImages[selectedImage].alt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={normalizedImages[selectedImage].url}
                  alt={normalizedImages[selectedImage].alt}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 58vw"
                  unoptimized={normalizedImages[selectedImage].url.startsWith('http') && !normalizedImages[selectedImage].url.includes('localhost')}
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Không có hình ảnh
              </div>
            )
          )}

          {/* Zoom Button */}
          <button
            onClick={() => setIsZoomed(true)}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-700" />
          </button>

          {/* Navigation Arrows */}
          {normalizedImages.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-700" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
            {selectedImage + 1} / {normalizedImages.length}
          </div>
        </div>

        {/* Thumbnail Row - Mobile */}
        <div className="md:hidden flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {normalizedImages.map((image, index) => {
            const isValidUrl = image.url && (
              image.url.startsWith('/') || 
              image.url.startsWith('http') || 
              isBase64Image(image.url)
            );
            
            return (
              <button
                key={`thumb-mobile-${image.url}-${index}`}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleImageClick(index);
                }}
                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === index
                    ? 'border-blue-600 shadow-md'
                    : 'border-gray-200'
                }`}
                title={image.colorSlug ? `Thuộc màu: ${image.colorSlug}` : ''}
              >
                {isValidUrl ? (
                  isBase64Image(image.url) ? (
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="64px"
                      unoptimized={image.url.startsWith('http') && !image.url.includes('localhost')}
                    />
                  )
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal - Simplified for now */}
      {isZoomed && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-4xl font-light"
          >
            ×
          </button>
          <div className="relative w-full h-full max-w-5xl max-h-[90vh]">
            {normalizedImages[selectedImage] && (
              (normalizedImages[selectedImage].url.startsWith('/') || 
               normalizedImages[selectedImage].url.startsWith('http') || 
               isBase64Image(normalizedImages[selectedImage].url)) ? (
                isBase64Image(normalizedImages[selectedImage].url) ? (
                  <img
                    src={normalizedImages[selectedImage].url}
                    alt={normalizedImages[selectedImage].alt}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image
                    src={normalizedImages[selectedImage].url}
                    alt={normalizedImages[selectedImage].alt}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    unoptimized={normalizedImages[selectedImage].url.startsWith('http') && !normalizedImages[selectedImage].url.includes('localhost')}
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  Không có hình ảnh
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
