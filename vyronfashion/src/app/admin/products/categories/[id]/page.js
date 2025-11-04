'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Plus, 
  Edit, 
  Trash2,
  Folder,
  Package,
  ChevronRight
} from 'lucide-react'
import * as categoryAPI from '@/lib/api/categories'
import * as productAPI from '@/lib/api/products'
import CategoryFormModal from '@/components/admin/categories/CategoryFormModal'
import ProductFormModal from '@/components/admin/products/ProductFormModal'

export default function CategoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params.id
  
  const [category, setCategory] = useState(null)
  const [subCategories, setSubCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSubCategoryForm, setShowSubCategoryForm] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [selectedSubCategory, setSelectedSubCategory] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [viewMode, setViewMode] = useState('subcategories') // 'subcategories' or 'products'
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null)

  // Load category và subcategories
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [categoryData, subCategoriesData] = await Promise.all([
          categoryAPI.getCategoryById(categoryId),
          categoryAPI.getSubCategories(categoryId)
        ])
        setCategory(categoryData)
        setSubCategories(subCategoriesData || [])
      } catch (error) {
        console.error('Error loading category:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [categoryId])

  // Load products khi chọn subcategory
  useEffect(() => {
    const loadProducts = async () => {
      if (selectedSubCategoryId && viewMode === 'products') {
        try {
          const subCat = subCategories.find(c => c.id === selectedSubCategoryId)
      if (subCat) {
            const response = await productAPI.getProducts({
              category_slug: subCat.slug,
              status: 'active'
            })
            setProducts(response.products || [])
      }
        } catch (error) {
          console.error('Error loading products:', error)
          setProducts([])
        }
      } else {
        setProducts([])
      }
    }
    loadProducts()
  }, [selectedSubCategoryId, viewMode, subCategories])

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-6)' }}>
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          Đang tải...
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div style={{ padding: 'var(--space-6)' }}>
        <p>Không tìm thấy danh mục</p>
        <button 
          className="admin-btn admin-btn-ghost"
          onClick={() => router.push('/admin/products/categories')}
        >
          Quay lại
        </button>
      </div>
    )
  }

  const handleDeleteSubCategory = async (subCategoryId) => {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục con này?')) {
      try {
        await categoryAPI.deleteCategory(subCategoryId)
        
        // Reload subcategories
        const subCategoriesData = await categoryAPI.getSubCategories(categoryId)
        setSubCategories(subCategoriesData || [])
        
        // Dispatch custom event để Header cập nhật ngay
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('categoryChanged'))
        }
      } catch (error) {
        console.error('Error deleting subcategory:', error)
        alert('Lỗi khi xóa danh mục con: ' + error.message)
      }
    }
  }

  const handleSaveSubCategory = async (categoryData) => {
    try {
      const subCategoryData = {
        ...categoryData,
        parent_id: categoryId
      }
      
      if (selectedSubCategory) {
        await categoryAPI.updateCategory(selectedSubCategory.id, subCategoryData)
      } else {
        await categoryAPI.createCategory(subCategoryData)
      }
      
      // Reload subcategories
      const subCategoriesData = await categoryAPI.getSubCategories(categoryId)
      setSubCategories(subCategoriesData || [])
      
    setShowSubCategoryForm(false)
    setSelectedSubCategory(null)
      
      // Dispatch custom event để Header cập nhật ngay
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('categoryChanged'))
      }
    } catch (error) {
      console.error('Error saving subcategory:', error)
      alert('Lỗi khi lưu danh mục con: ' + error.message)
    }
  }

  const handleSaveProduct = async (productData) => {
    try {
    // Set category cho sản phẩm
    const categoryForProduct = selectedSubCategoryId 
        ? subCategories.find(c => c.id === selectedSubCategoryId)
      : category
    
    const productWithCategory = {
      ...productData,
      category: {
        name: categoryForProduct.name,
        slug: categoryForProduct.slug
      }
    }
    
      if (selectedProduct) {
        await productAPI.updateProduct(selectedProduct.id, productWithCategory)
      } else {
        await productAPI.createProduct(productWithCategory)
      }
      
      // Reload products
      if (selectedSubCategoryId && viewMode === 'products') {
        const subCat = subCategories.find(c => c.id === selectedSubCategoryId)
        if (subCat) {
          const response = await productAPI.getProducts({
            category_slug: subCat.slug,
            status: 'active'
          })
          setProducts(response.products || [])
        }
      }
      
    setShowProductForm(false)
    setSelectedProduct(null)
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Lỗi khi lưu sản phẩm: ' + error.message)
    }
  }

  return (
    <div style={{ padding: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <button
          className="admin-btn admin-btn-ghost admin-btn-sm"
          onClick={() => router.push('/admin/products/categories')}
          style={{ marginBottom: 'var(--space-4)' }}
        >
          <ArrowLeft size={16} />
          <span>Quay lại danh sách</span>
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--text)',
              marginBottom: 'var(--space-2)',
              fontFamily: 'var(--font-display)'
            }}>
              {category.name}
            </h1>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)'
            }}>
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-6)',
        borderBottom: '1px solid var(--border)'
      }}>
        <button
          className={`admin-btn admin-btn-ghost ${viewMode === 'subcategories' ? 'admin-btn-active' : ''}`}
          onClick={() => {
            setViewMode('subcategories')
            setSelectedSubCategoryId(null)
          }}
        >
          <Folder size={16} />
          <span>Danh mục con ({subCategories.length})</span>
        </button>
        {selectedSubCategoryId && (
          <button
            className={`admin-btn admin-btn-ghost ${viewMode === 'products' ? 'admin-btn-active' : ''}`}
            onClick={() => setViewMode('products')}
          >
            <Package size={16} />
            <span>Sản phẩm ({products.length})</span>
          </button>
        )}
      </div>

      {/* Subcategories View */}
      {viewMode === 'subcategories' && (
        <div className="admin-grid admin-grid-cols-1">
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Danh mục con</h2>
                <p className="admin-card-description">
                  Quản lý danh mục con của "{category.name}"
                </p>
              </div>
              <button
                className="admin-btn admin-btn-primary admin-btn-sm"
                onClick={() => {
                  setSelectedSubCategory(null)
                  setShowSubCategoryForm(true)
                }}
              >
                <Plus size={16} />
                <span>Thêm danh mục con</span>
              </button>
            </div>
            <div className="admin-table-container" style={{ border: 'none' }}>
              {subCategories.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: 'var(--space-8)',
                  color: 'var(--text-tertiary)'
                }}>
                  <Folder size={48} style={{ opacity: 0.3, marginBottom: 'var(--space-3)' }} />
                  <p>Chưa có danh mục con nào. Hãy thêm danh mục con đầu tiên!</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Danh mục con</th>
                      <th>Slug</th>
                      <th className="admin-table-cell-center">Số sản phẩm</th>
                      <th className="admin-table-cell-center">Trạng thái</th>
                      <th className="admin-table-cell-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subCategories.map((subCategory) => (
                      <tr key={subCategory.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <Folder size={20} style={{ color: 'var(--brand-500)' }} />
                            <div>
                              <div style={{ fontWeight: 'var(--font-semibold)' }}>
                                {subCategory.name}
                              </div>
                              <div style={{ 
                                fontSize: 'var(--text-xs)', 
                                color: 'var(--text-tertiary)'
                              }}>
                                {subCategory.description}
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
                            {subCategory.slug}
                          </span>
                        </td>
                        <td className="admin-table-cell-center">
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <Package size={14} style={{ color: 'var(--text-tertiary)' }} />
                            <span style={{ fontWeight: 'var(--font-medium)' }}>
                              {subCategory.product_count}
                            </span>
                          </div>
                        </td>
                        <td className="admin-table-cell-center">
                          <span className={`admin-badge ${
                            subCategory.status === 'active' 
                              ? 'admin-badge-success' 
                              : 'admin-badge-secondary'
                          }`}>
                            {subCategory.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                          </span>
                        </td>
                        <td className="admin-table-cell-center">
                          <div className="admin-table-actions">
                            <button 
                              className="admin-btn admin-btn-sm admin-btn-primary"
                              title="Xem sản phẩm"
                              onClick={() => {
                                setSelectedSubCategoryId(subCategory.id)
                                setViewMode('products')
                              }}
                            >
                              <Package size={16} />
                              <span>Sản phẩm</span>
                            </button>
                            <button 
                              className="admin-btn admin-btn-sm admin-btn-ghost"
                              title="Chỉnh sửa"
                              onClick={() => {
                                setSelectedSubCategory(subCategory)
                                setShowSubCategoryForm(true)
                              }}
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="admin-btn admin-btn-sm admin-btn-ghost"
                              title="Xóa"
                              onClick={() => handleDeleteSubCategory(subCategory.id)}
                              style={{ color: 'var(--error-600)' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products View */}
      {viewMode === 'products' && selectedSubCategoryId && (
        <div className="admin-grid admin-grid-cols-1">
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">
                  Sản phẩm trong "{subCategories.find(c => c.id === selectedSubCategoryId)?.name || ''}"
                </h2>
                <p className="admin-card-description">
                  {products.length} sản phẩm
                </p>
              </div>
              <button
                className="admin-btn admin-btn-primary admin-btn-sm"
                onClick={() => {
                  setSelectedProduct(null)
                  setShowProductForm(true)
                }}
              >
                <Plus size={16} />
                <span>Thêm sản phẩm</span>
              </button>
            </div>
            <div className="admin-table-container" style={{ border: 'none' }}>
              {products.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: 'var(--space-8)',
                  color: 'var(--text-tertiary)'
                }}>
                  <Package size={48} style={{ opacity: 0.3, marginBottom: 'var(--space-3)' }} />
                  <p>Chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên!</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>SKU</th>
                      <th className="admin-table-cell-center">Tồn kho</th>
                      <th className="admin-table-cell-right">Giá</th>
                      <th className="admin-table-cell-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
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
                              <div style={{ fontWeight: 'var(--font-semibold)' }}>
                                {product.name}
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
                          {product.inventory.quantity}
                        </td>
                        <td className="admin-table-cell-right">
                          {formatCurrency(product.pricing.sale)}
                        </td>
                        <td className="admin-table-cell-center">
                          <div className="admin-table-actions">
                            <button 
                              className="admin-btn admin-btn-sm admin-btn-ghost"
                              title="Chỉnh sửa"
                              onClick={() => {
                                setSelectedProduct(product)
                                setShowProductForm(true)
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* SubCategory Form Modal */}
      {showSubCategoryForm && (
        <CategoryFormModal
          category={selectedSubCategory}
          parentCategory={category}
          onClose={() => {
            setShowSubCategoryForm(false)
            setSelectedSubCategory(null)
          }}
          onSave={handleSaveSubCategory}
        />
      )}

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductFormModal
          product={selectedProduct}
          defaultCategory={selectedSubCategoryId ? subCategories.find(c => c.id === selectedSubCategoryId) : category}
          onClose={() => {
            setShowProductForm(false)
            setSelectedProduct(null)
          }}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  )
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

