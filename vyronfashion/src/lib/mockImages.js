// Mock product images for demo
export const PRODUCT_IMAGES = {
  'ao-thun-basic-cotton-nam': [
    {
      url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop',
      alt: 'Áo Thun Basic Cotton Nam - Mặt trước',
      type: 'image'
    },
    {
      url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1000&fit=crop',
      alt: 'Áo Thun Basic Cotton Nam - Mặt sau',
      type: 'image'
    },
    {
      url: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800&h=1000&fit=crop',
      alt: 'Áo Thun Basic Cotton Nam - Chi tiết',
      type: 'image'
    },
    {
      url: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800&h=1000&fit=crop',
      alt: 'Áo Thun Basic Cotton Nam - Model mặc',
      type: 'image'
    }
  ]
};

// Helper function to get images or fallback
export function getProductImages(slug) {
  return PRODUCT_IMAGES[slug] || PRODUCT_IMAGES['ao-thun-basic-cotton-nam'];
}
