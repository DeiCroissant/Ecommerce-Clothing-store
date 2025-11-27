'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  Heart,
  TrendingUp,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react'
import { formatCurrency } from '@/lib/formatCurrency'
import * as productAPI from '@/lib/api/products'
import ProductFormModal from '@/components/admin/products/ProductFormModal'
import { getImageUrl } from '@/lib/imageHelper'

// Custom hook for debounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => clearTimeout(handler)
  }, [value, delay])
  
  return debouncedValue
}

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all') // all, active, inactive
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const ITEMS_PER_PAGE = 20 // Chỉ load 20 sản phẩm mỗi trang
  
  // Debounced search - đợi 300ms sau khi user ngừng gõ
  const debouncedSearch = useDebounce(searchQuery, 300)
  
  // Cache ref để tránh load lại khi không cần
  const cacheRef = useRef({})
  
  // Load products từ API với pagination
  const loadProducts = useCallback(async (forceRefresh = false) => {
    const cacheKey = `${filterStatus}_${debouncedSearch}_${currentPage}`
    
    // Check cache (nếu không force refresh)
    if (!forceRefresh && cacheRef.current[cacheKey]) {
      const cached = cacheRef.current[cacheKey]
      setProducts(cached.products)
      setTotalPages(cached.totalPages)
      setTotalProducts(cached.total)
      return
    }
    
    setLoading(true)
    try {
      const response = await productAPI.getProducts({
        status: filterStatus === 'all' ? undefined : filterStatus,
        search: debouncedSearch || undefined,
        page: currentPage,
        limit: ITEMS_PER_PAGE
      })
      
      const allProducts = response.products || []
      
      // Cache response
      cacheRef.current[cacheKey] = {
        products: allProducts,
        totalPages: response.totalPages || 1,
        total: response.total || 0
      }
      
      setProducts(allProducts)
      setTotalPages(response.totalPages || 1)
      setTotalProducts(response.total || 0)
    } catch (error) {
      console.error('Error loading products:', error)
      setProducts([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filterStatus, debouncedSearch, currentPage])
  
  // Load products khi dependencies thay đổi
  useEffect(() => {
    loadProducts()
  }, [loadProducts])
  
  // Reset page khi filter/search thay đổi
  useEffect(() => {
    setCurrentPage(1)
  }, [filterStatus, debouncedSearch])
  
  // Refresh handler
  const handleRefresh = () => {
    setRefreshing(true)
    cacheRef.current = {} // Clear cache
    loadProducts(true)
  }

  // Sản phẩm được yêu thích nhất - chỉ tính từ products đã load
  const mostLikedProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.wishlist_count || 0) - (a.wishlist_count || 0))
      .slice(0, 5)
  }, [products])

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div style={{ padding: 'var(--space-6)' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: 'var(--space-4)'
        }}>
          <div>
            <h1 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--text)',
              marginBottom: 'var(--space-1)',
              fontFamily: 'var(--font-display)'
            }}>
              Quản lý Sản phẩm
            </h1>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)'
            }}>
              Quản lý và theo dõi tất cả sản phẩm trong cửa hàng
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Làm mới dữ liệu"
            >
              <RefreshCw size={20} className={refreshing ? 'spin' : ''} style={{ 
                animation: refreshing ? 'spin 1s linear infinite' : 'none' 
              }} />
            </button>
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={20} />
              <span>Thêm sản phẩm</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-6)'
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search 
              size={20} 
              style={{
                position: 'absolute',
                left: 'var(--space-3)',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)'
              }}
            />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm (tên, SKU, danh mục)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input"
              style={{ paddingLeft: 'var(--space-10)' }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="admin-select"
            style={{ width: '200px' }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang bán</option>
            <option value="inactive">Ngừng bán</option>
          </select>
        </div>
      </div>

      {/* Most Liked Products Section */}
      <div className="admin-grid admin-grid-cols-1" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="admin-card">
          <div className="admin-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Heart size={20} style={{ color: 'var(--error-500)' }} />
              <h2 className="admin-card-title">Sản phẩm được yêu thích nhất</h2>
            </div>
            <p className="admin-card-description">
              Top 5 sản phẩm có nhiều lượt yêu thích nhất
            </p>
          </div>
          <div className="admin-table-container" style={{ border: 'none' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>SKU</th>
                  <th className="admin-table-cell-center">Số lượt yêu thích</th>
                  <th className="admin-table-cell-center">Đã bán</th>
                  <th className="admin-table-cell-right">Giá</th>
                  <th className="admin-table-cell-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {mostLikedProducts.map((product, index) => (
                  <tr key={product.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: 'var(--radius-base)',
                          backgroundColor: 'var(--neutral-100)',
                          backgroundImage: `url(${getImageUrl(product.image)})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }} />
                        <div>
                          <div style={{ fontWeight: 'var(--font-semibold)', marginBottom: '2px' }}>
                            {product.name}
                          </div>
                          <div style={{ 
                            fontSize: 'var(--text-xs)', 
                            color: 'var(--text-tertiary)' 
                          }}>
                            {product.category.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ 
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-secondary)'
                      }}>
                        {product.sku}
                      </span>
                    </td>
                    <td className="admin-table-cell-center">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Heart size={16} style={{ color: 'var(--error-500)' }} />
                        <span style={{ fontWeight: 'var(--font-semibold)' }}>
                          {product.wishlist_count}
                        </span>
                      </div>
                    </td>
                    <td className="admin-table-cell-center">
                      <span style={{ fontWeight: 'var(--font-medium)' }}>
                        {product.sold_count}
                      </span>
                    </td>
                    <td className="admin-table-cell-right">
                      <div>
                        <div style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text)' }}>
                          {formatCurrency(product.pricing.sale)}
                        </div>
                        {product.pricing.original && (
                          <div style={{ 
                            fontSize: 'var(--text-xs)', 
                            color: 'var(--text-tertiary)',
                            textDecoration: 'line-through'
                          }}>
                            {formatCurrency(product.pricing.original)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="admin-table-cell-center">
                      <div className="admin-table-actions">
                        <button 
                          className="admin-btn admin-btn-sm admin-btn-ghost"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="admin-btn admin-btn-sm admin-btn-ghost"
                          title="Chỉnh sửa"
                          onClick={() => {
                            setSelectedProduct(product)
                            setShowAddForm(true)
                          }}
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* All Products Section */}
      <div className="admin-grid admin-grid-cols-1">
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Tất cả sản phẩm</h2>
              <p className="admin-card-description">
                {totalProducts} sản phẩm {filterStatus !== 'all' && `(${filterStatus === 'active' ? 'đang bán' : 'ngừng bán'})`}
                {debouncedSearch && ` • Tìm kiếm: "${debouncedSearch}"`}
                {totalPages > 1 && ` • Trang ${currentPage}/${totalPages}`}
              </p>
            </div>
          </div>
          <div className="admin-table-container" style={{ border: 'none' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>SKU</th>
                  <th>Danh mục</th>
                  <th className="admin-table-cell-center">Tồn kho</th>
                  <th className="admin-table-cell-center">Yêu thích</th>
                  <th className="admin-table-cell-center">Lượt bán</th>
                  <th className="admin-table-cell-right">Giá</th>
                  <th className="admin-table-cell-center">Trạng thái</th>
                  <th className="admin-table-cell-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" style={{ 
                      textAlign: 'center', 
                      padding: 'var(--space-8)',
                      color: 'var(--text-tertiary)'
                    }}>
                      Đang tải...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ 
                      textAlign: 'center', 
                      padding: 'var(--space-8)',
                      color: 'var(--text-tertiary)'
                    }}>
                      Không tìm thấy sản phẩm nào
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: 'var(--radius-base)',
                            backgroundColor: 'var(--neutral-100)',
                            backgroundImage: `url(${getImageUrl(product.image)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }} />
                          <div>
                            <div style={{ fontWeight: 'var(--font-semibold)', marginBottom: '2px' }}>
                              {product.name}
                            </div>
                            <div style={{ 
                              fontSize: 'var(--text-xs)', 
                              color: 'var(--text-tertiary)' 
                            }}>
                              {product.brand.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-secondary)'
                        }}>
                          {product.sku}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 'var(--text-sm)' }}>
                          {product.category.name}
                        </span>
                      </td>
                      <td className="admin-table-cell-center">
                        <div>
                          <span style={{ 
                            fontWeight: 'var(--font-semibold)',
                            color: product.inventory.quantity <= product.inventory.low_stock_threshold 
                              ? 'var(--warning-600)' 
                              : 'var(--text)'
                          }}>
                            {product.inventory.quantity}
                          </span>
                          {product.inventory.quantity <= product.inventory.low_stock_threshold && (
                            <div style={{ 
                              fontSize: 'var(--text-xs)', 
                              color: 'var(--warning-600)',
                              marginTop: '2px'
                            }}>
                              Sắp hết
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="admin-table-cell-center">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <Heart size={14} style={{ color: 'var(--error-500)' }} />
                          <span style={{ fontSize: 'var(--text-sm)' }}>
                            {product.wishlist_count || 0}
                          </span>
                        </div>
                      </td>
                      <td className="admin-table-cell-center">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <TrendingUp size={14} style={{ color: 'var(--success-600)' }} />
                          <span style={{ 
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-semibold)',
                            color: 'var(--text)'
                          }}>
                            {product.sold_count || 0}
                          </span>
                        </div>
                      </td>
                      <td className="admin-table-cell-right">
                        <div>
                          <div style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text)' }}>
                            {formatCurrency(product.pricing.sale)}
                          </div>
                          {product.pricing.original && (
                            <div style={{ 
                              fontSize: 'var(--text-xs)', 
                              color: 'var(--text-tertiary)',
                              textDecoration: 'line-through'
                            }}>
                              {formatCurrency(product.pricing.original)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="admin-table-cell-center">
                        <span className={`admin-badge ${
                          product.status === 'active' 
                            ? 'admin-badge-success' 
                            : 'admin-badge-secondary'
                        }`}>
                          {product.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
                        </span>
                      </td>
                      <td className="admin-table-cell-center">
                        <div className="admin-table-actions">
                          <button 
                            className="admin-btn admin-btn-sm admin-btn-ghost"
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="admin-btn admin-btn-sm admin-btn-ghost"
                            title="Chỉnh sửa"
                            onClick={() => {
                              setSelectedProduct(product)
                              setShowAddForm(true)
                            }}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="admin-btn admin-btn-sm admin-btn-ghost"
                            title="Xóa"
                            style={{ color: 'var(--error-600)' }}
                            onClick={async () => {
                              if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) {
                                try {
                                  await productAPI.deleteProduct(product.id)
                                  
                                  // Clear cache và reload
                                  cacheRef.current = {}
                                  loadProducts(true)
                                  
                                  if (typeof window !== 'undefined') {
                                    window.dispatchEvent(new CustomEvent('showToast', { 
                                      detail: { message: 'Xóa sản phẩm thành công!', type: 'success', duration: 3000 } 
                                    }));
                                  }
                                } catch (error) {
                                  console.error('Error deleting product:', error)
                                  if (typeof window !== 'undefined') {
                                    window.dispatchEvent(new CustomEvent('showToast', { 
                                      detail: { message: 'Lỗi khi xóa sản phẩm: ' + error.message, type: 'error', duration: 3000 } 
                                    }));
                                  }
                                }
                              }
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-4)',
              borderTop: '1px solid var(--border)'
            }}>
              <button
                className="admin-btn admin-btn-sm admin-btn-ghost"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    className={`admin-btn admin-btn-sm ${currentPage === pageNum ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
                    onClick={() => goToPage(pageNum)}
                    style={{ minWidth: '36px' }}
                  >
                    {pageNum}
                  </button>
                )
              })}
              
              <button
                className="admin-btn admin-btn-sm admin-btn-ghost"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showAddForm && (
        <ProductFormModal
          product={selectedProduct}
          onClose={() => {
            setShowAddForm(false)
            setSelectedProduct(null)
          }}
          onSave={async (productData) => {
            try {
              const isUpdate = !!selectedProduct
              
              if (isUpdate) {
                // Cập nhật sản phẩm
                await productAPI.updateProduct(selectedProduct.id, productData)
              } else {
                // Tạo sản phẩm mới
                await productAPI.createProduct(productData)
              }
              
              // Đóng modal ngay để cải thiện UX
              setShowAddForm(false)
              setSelectedProduct(null)
              
              // Show success toast
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('showToast', { 
                  detail: { 
                    message: isUpdate ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!', 
                    type: 'success', 
                    duration: 3000 
                  } 
                }));
              }
              
              // Clear cache và reload trong background
              cacheRef.current = {}
              loadProducts(true)
              
            } catch (error) {
              console.error('Error saving product:', error)
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('showToast', { 
                  detail: { message: 'Lỗi khi lưu sản phẩm: ' + error.message, type: 'error', duration: 3000 } 
                }));
              }
            }
          }}
        />
      )}
    </div>
  )
}

