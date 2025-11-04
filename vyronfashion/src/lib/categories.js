/**
 * Gender-First Category Structure
 * Organized by target audience (Men, Women) for better UX
 */

export const CATEGORIES = {
  MEN: {
    id: 'men',
    label: 'Nam',
    slug: 'nam',
    subcategories: {
      tops: {
        label: 'Áo Nam',
        slug: 'ao-nam',
        items: [
          { id: 'men-tshirt', label: 'Áo Thun', slug: 'ao-thun-nam' },
          { id: 'men-shirt', label: 'Áo Sơ Mi', slug: 'ao-so-mi-nam' },
          { id: 'men-polo', label: 'Áo Polo', slug: 'ao-polo-nam' },
          { id: 'men-jacket', label: 'Áo Khoác', slug: 'ao-khoac-nam' },
          { id: 'men-hoodie', label: 'Áo Hoodie', slug: 'ao-hoodie-nam' }
        ]
      },
      bottoms: {
        label: 'Quần Nam',
        slug: 'quan-nam',
        items: [
          { id: 'men-jeans', label: 'Quần Jean', slug: 'quan-jean-nam' },
          { id: 'men-khaki', label: 'Quần Kaki', slug: 'quan-kaki-nam' },
          { id: 'men-trousers', label: 'Quần Tây', slug: 'quan-tay-nam' },
          { id: 'men-shorts', label: 'Quần Short', slug: 'quan-short-nam' }
        ]
      },
      accessories: {
        label: 'Phụ Kiện Nam',
        slug: 'phu-kien-nam',
        items: [
          { id: 'men-belt', label: 'Thắt Lưng', slug: 'that-lung-nam' },
          { id: 'men-wallet', label: 'Ví Nam', slug: 'vi-nam' },
          { id: 'men-bag', label: 'Balo/Túi', slug: 'balo-tui-nam' }
        ]
      }
    }
  },
  WOMEN: {
    id: 'women',
    label: 'Nữ',
    slug: 'nu',
    subcategories: {
      tops: {
        label: 'Áo Nữ',
        slug: 'ao-nu',
        items: [
          { id: 'women-tshirt', label: 'Áo Thun', slug: 'ao-thun-nu' },
          { id: 'women-shirt', label: 'Áo Sơ Mi', slug: 'ao-so-mi-nu' },
          { id: 'women-blouse', label: 'Áo Kiểu', slug: 'ao-kieu-nu' },
          { id: 'women-jacket', label: 'Áo Khoác', slug: 'ao-khoac-nu' },
          { id: 'women-sweater', label: 'Áo Len', slug: 'ao-len-nu' }
        ]
      },
      bottoms: {
        label: 'Quần & Váy',
        slug: 'quan-vay-nu',
        items: [
          { id: 'women-jeans', label: 'Quần Jean', slug: 'quan-jean-nu' },
          { id: 'women-trousers', label: 'Quần Tây', slug: 'quan-tay-nu' },
          { id: 'women-culottes', label: 'Quần Culottes', slug: 'quan-culottes-nu' },
          { id: 'women-skirt-short', label: 'Váy Ngắn', slug: 'vay-ngan' },
          { id: 'women-skirt-midi', label: 'Váy Midi', slug: 'vay-midi' },
          { id: 'women-skirt-maxi', label: 'Váy Maxi', slug: 'vay-maxi' }
        ]
      },
      dresses: {
        label: 'Đầm & Set',
        slug: 'dam-set-nu',
        items: [
          { id: 'women-dress-office', label: 'Đầm Công Sở', slug: 'dam-cong-so' },
          { id: 'women-dress-party', label: 'Đầm Dạ Hội', slug: 'dam-da-hoi' },
          { id: 'women-dress-casual', label: 'Đầm Dạo Phố', slug: 'dam-dao-pho' },
          { id: 'women-set', label: 'Set Đồ', slug: 'set-do-nu' }
        ]
      },
      accessories: {
        label: 'Phụ Kiện Nữ',
        slug: 'phu-kien-nu',
        items: [
          { id: 'women-bag', label: 'Túi Xách', slug: 'tui-xach-nu' },
          { id: 'women-scarf', label: 'Khăn/Mũ', slug: 'khan-mu-nu' },
          { id: 'women-jewelry', label: 'Trang Sức', slug: 'trang-suc' }
        ]
      }
    }
  }
};

/**
 * Flatten categories for easy iteration
 */
export const getAllCategories = () => {
  return Object.values(CATEGORIES);
};

/**
 * Get category by slug
 */
export const getCategoryBySlug = (slug) => {
  return Object.values(CATEGORIES).find(cat => cat.slug === slug);
};

/**
 * Featured categories for homepage (Gender-first approach)
 */
export const FEATURED_CATEGORIES = [
  {
    id: 1,
    name: 'Thời Trang Nam',
    slug: 'nam',
    gender: 'men',
    image: '/images/categories/men-collection.jpg',
    description: 'Phong cách lịch lãm, tự tin',
    productCount: 350
  },
  {
    id: 2,
    name: 'Thời Trang Nữ',
    slug: 'nu',
    gender: 'women',
    image: '/images/categories/women-collection.jpg',
    description: 'Thanh lịch, quyến rũ',
    productCount: 480
  },
  {
    id: 3,
    name: 'Áo Thun Nam',
    slug: 'nam/ao-thun-nam',
    gender: 'men',
    image: '/images/categories/men-tshirts.jpg',
    description: 'Basic đa năng',
    productCount: 120
  },
  {
    id: 4,
    name: 'Váy Đầm Nữ',
    slug: 'nu/dam-cong-so',
    gender: 'women',
    image: '/images/categories/women-dresses.jpg',
    description: 'Sang trọng, nữ tính',
    productCount: 95
  }
];
