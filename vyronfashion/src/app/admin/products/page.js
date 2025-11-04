'use client'

import { useState, useMemo, useEffect } from 'react'
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
  MoreVertical
} from 'lucide-react'
import { formatCurrency } from '@/lib/formatCurrency'
import * as productAPI from '@/lib/api/products'
import ProductFormModal from '@/components/admin/products/ProductFormModal'

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all') // all, active, inactive
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Load products từ API
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        const response = await productAPI.getProducts({
          status: filterStatus === 'all' ? undefined : filterStatus,
          limit: 100 // Load nhiều để search client-side (có thể tối ưu sau)
        })
        
        let allProducts = response.products || []
        
        // Filter by search query
        if (searchQuery) {
          allProducts = allProducts.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.slug.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }
        
        setProducts(allProducts)
      } catch (error) {
        console.error('Error loading products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    
    loadProducts()
  }, [filterStatus, searchQuery])

  // Sản phẩm được yêu thích nhất (sắp xếp theo wishlist_count)
  const mostLikedProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.wishlist_count || 0) - (a.wishlist_count || 0))
      .slice(0, 5)
  }, [products])

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
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={20} />
            <span>Thêm sản phẩm</span>
          </button>
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
                          backgroundImage: `url(${product.image})`,
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
                {products.length} sản phẩm {filterStatus !== 'all' && `(${filterStatus === 'active' ? 'đang bán' : 'ngừng bán'})`}
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
                  <th className="admin-table-cell-right">Giá</th>
                  <th className="admin-table-cell-center">Trạng thái</th>
                  <th className="admin-table-cell-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ 
                      textAlign: 'center', 
                      padding: 'var(--space-8)',
                      color: 'var(--text-tertiary)'
                    }}>
                      Đang tải...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ 
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
                            backgroundImage: `url(${product.image})`,
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
                            {product.wishlist_count}
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
                                  
                                  // Reload products
                                  const response = await productAPI.getProducts({
                                    status: filterStatus === 'all' ? undefined : filterStatus,
                                    limit: 100
                                  })
                                  
                                  let allProducts = response.products || []
                                  if (searchQuery) {
                                    allProducts = allProducts.filter(p => 
                                      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                  }
                                  setProducts(allProducts)
                                } catch (error) {
                                  console.error('Error deleting product:', error)
                                  alert('Lỗi khi xóa sản phẩm: ' + error.message)
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
              if (selectedProduct) {
                // Cập nhật sản phẩm
                await productAPI.updateProduct(selectedProduct.id, productData)
              } else {
                // Tạo sản phẩm mới
                await productAPI.createProduct(productData)
              }
              
              // Reload products
              const response = await productAPI.getProducts({
                status: filterStatus === 'all' ? undefined : filterStatus,
                limit: 100
              })
              
              let allProducts = response.products || []
              if (searchQuery) {
                allProducts = allProducts.filter(p => 
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.slug.toLowerCase().includes(searchQuery.toLowerCase())
                )
              }
              setProducts(allProducts)
              
              setShowAddForm(false)
              setSelectedProduct(null)
            } catch (error) {
              console.error('Error saving product:', error)
              alert('Lỗi khi lưu sản phẩm: ' + error.message)
            }
          }}
        />
      )}
    </div>
  )
}

