/**
 * Mock Categories Data for Admin Dashboard
 * Danh sách danh mục đơn giản để quản lý
 */

// Lưu bản gốc để có thể reset
const _originalCategories = [
  // Danh mục chính
  {
    id: '1',
    name: 'Áo Nam',
    slug: 'ao-nam',
    description: 'Tất cả các loại áo dành cho nam',
    parent_id: null,
    product_count: 156,
    image: '/images/categories/men-tshirts.jpg',
    status: 'active',
    created_at: '2024-09-01',
    updated_at: '2024-11-04'
  },
  {
    id: '2',
    name: 'Quần Nam',
    slug: 'quan-nam',
    description: 'Quần jean, kaki, tây, short...',
    parent_id: null,
    product_count: 89,
    image: '/images/categories/men-pants.jpg',
    status: 'active',
    created_at: '2024-09-01',
    updated_at: '2024-11-03'
  },
  {
    id: '3',
    name: 'Áo Nữ',
    slug: 'ao-nu',
    description: 'Tất cả các loại áo dành cho nữ',
    parent_id: null,
    product_count: 124,
    image: '/images/categories/women-tops.jpg',
    status: 'active',
    created_at: '2024-09-01',
    updated_at: '2024-11-02'
  },
  {
    id: '4',
    name: 'Váy Nữ',
    slug: 'vay-nu',
    description: 'Váy, đầm các loại',
    parent_id: null,
    product_count: 67,
    image: '/images/categories/women-dresses.jpg',
    status: 'active',
    created_at: '2024-09-01',
    updated_at: '2024-11-01'
  },
  {
    id: '5',
    name: 'Quần Nữ',
    slug: 'quan-nu',
    description: 'Quần jean, legging, culottes...',
    parent_id: null,
    product_count: 92,
    image: '/images/categories/women-pants.jpg',
    status: 'active',
    created_at: '2024-09-01',
    updated_at: '2024-10-30'
  },
  {
    id: '6',
    name: 'Áo Khoác',
    slug: 'ao-khoac',
    description: 'Áo khoác nam và nữ',
    parent_id: null,
    product_count: 45,
    image: '/images/categories/jackets.jpg',
    status: 'active',
    created_at: '2024-09-15',
    updated_at: '2024-10-29'
  },
  {
    id: '7',
    name: 'Phụ Kiện',
    slug: 'phu-kien',
    description: 'Túi xách, ví, thắt lưng, mũ...',
    parent_id: null,
    product_count: 200,
    image: '/images/categories/accessories.jpg',
    status: 'active',
    created_at: '2024-09-01',
    updated_at: '2024-10-28'
  },
  // Danh mục con của Áo Nam
  {
    id: '11',
    name: 'Áo Thun',
    slug: 'ao-thun-nam',
    description: 'Áo thun nam các loại',
    parent_id: '1',
    product_count: 45,
    image: '/images/categories/men-tshirts.jpg',
    status: 'active',
    created_at: '2024-09-05',
    updated_at: '2024-11-04'
  },
  {
    id: '12',
    name: 'Áo Sơ Mi',
    slug: 'ao-so-mi-nam',
    description: 'Áo sơ mi nam công sở',
    parent_id: '1',
    product_count: 38,
    image: '/images/categories/men-shirts.jpg',
    status: 'active',
    created_at: '2024-09-05',
    updated_at: '2024-11-03'
  },
  {
    id: '13',
    name: 'Áo Polo',
    slug: 'ao-polo-nam',
    description: 'Áo polo nam thể thao',
    parent_id: '1',
    product_count: 32,
    image: '/images/categories/men-polo.jpg',
    status: 'active',
    created_at: '2024-09-05',
    updated_at: '2024-11-02'
  },
  // Danh mục con của Quần Nam
  {
    id: '21',
    name: 'Quần Jean',
    slug: 'quan-jean-nam',
    description: 'Quần jean nam các loại',
    parent_id: '2',
    product_count: 42,
    image: '/images/categories/men-jeans.jpg',
    status: 'active',
    created_at: '2024-09-05',
    updated_at: '2024-11-01'
  },
  {
    id: '22',
    name: 'Quần Kaki',
    slug: 'quan-kaki-nam',
    description: 'Quần kaki nam',
    parent_id: '2',
    product_count: 28,
    image: '/images/categories/men-khaki.jpg',
    status: 'active',
    created_at: '2024-09-05',
    updated_at: '2024-10-30'
  },
  // Danh mục con của Váy Nữ
  {
    id: '41',
    name: 'Váy Ngắn',
    slug: 'vay-ngan',
    description: 'Váy ngắn nữ',
    parent_id: '4',
    product_count: 25,
    image: '/images/categories/women-short-skirt.jpg',
    status: 'active',
    created_at: '2024-09-05',
    updated_at: '2024-10-29'
  },
  {
    id: '42',
    name: 'Váy Dài',
    slug: 'vay-dai',
    description: 'Váy dài, maxi nữ',
    parent_id: '4',
    product_count: 22,
    image: '/images/categories/women-maxi.jpg',
    status: 'active',
    created_at: '2024-09-05',
    updated_at: '2024-10-28'
  }
]

// Export mutable array
export const mockCategories = [..._originalCategories]

/**
 * Tìm kiếm danh mục
 */
export function searchCategories(query) {
  if (!query || query.trim() === '') {
    return mockCategories
  }
  
  const lowerQuery = query.toLowerCase()
  return mockCategories.filter(category => 
    category.name.toLowerCase().includes(lowerQuery) ||
    category.slug.toLowerCase().includes(lowerQuery) ||
    (category.description && category.description.toLowerCase().includes(lowerQuery))
  )
}

/**
 * Lấy danh mục theo ID
 */
export function getCategoryById(id) {
  return mockCategories.find(c => c.id === id)
}

/**
 * Lấy danh mục theo slug
 */
export function getCategoryBySlug(slug) {
  return mockCategories.find(c => c.slug === slug)
}

/**
 * Lấy danh mục chính (parent_id = null)
 */
export function getMainCategories() {
  return mockCategories.filter(c => c.parent_id === null)
}

/**
 * Lấy danh mục con theo parent_id
 */
export function getSubCategories(parentId) {
  return mockCategories.filter(c => c.parent_id === parentId)
}

/**
 * Lấy tất cả danh mục con của một danh mục chính
 */
export function getCategoryTree(parentId = null) {
  const mainCategories = getMainCategories()
  return mainCategories.map(category => ({
    ...category,
    children: getSubCategories(category.id)
  }))
}

/**
 * Xóa danh mục và tất cả danh mục con, sản phẩm liên quan
 */
export function deleteCategory(categoryId) {
  const category = getCategoryById(categoryId)
  if (!category) return false

  // Lấy tất cả danh mục con
  const subCategories = getSubCategories(categoryId)
  const allSubCategoryIds = subCategories.map(sc => sc.id)

  // Xóa tất cả danh mục con
  subCategories.forEach(subCat => {
    const index = mockCategories.findIndex(c => c.id === subCat.id)
    if (index !== -1) {
      mockCategories.splice(index, 1)
    }
  })

  // Xóa danh mục chính
  const mainIndex = mockCategories.findIndex(c => c.id === categoryId)
  if (mainIndex !== -1) {
    mockCategories.splice(mainIndex, 1)
  }

  return {
    deletedCategory: category,
    deletedSubCategories: subCategories,
    deletedSubCategoryIds: allSubCategoryIds
  }
}

