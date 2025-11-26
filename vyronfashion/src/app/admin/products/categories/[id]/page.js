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
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { getImageUrl } from '@/lib/imageHelper'

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [deleteType, setDeleteType] = useState('subcategory') // 'subcategory' or 'product'
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
            console.log('🔍 Loading products for subcategory:', subCat.slug)
            const response = await productAPI.getProducts({
              category_slug: subCat.slug,
              status: 'active'
            })
            console.log('📦 Products response:', response)
            console.log('📦 Products type:', typeof response, Array.isArray(response))
            
            // Handle different response formats
            let productsArray = []
            if (Array.isArray(response)) {
              productsArray = response
            } else if (response?.products && Array.isArray(response.products)) {
              productsArray = response.products
            } else if (response?.data && Array.isArray(response.data)) {
              productsArray = response.data
            }
            
            console.log('✅ Setting products array:', productsArray.length, 'items')
            setProducts(productsArray)
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

  const handleDeleteSubCategory = (subCategoryId) => {
    setDeleteTargetId(subCategoryId)
    setDeleteType('subcategory')
    setShowDeleteConfirm(true)
  }

  const handleDeleteProduct = (productId) => {
    setDeleteTargetId(productId)
    setDeleteType('product')
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!deleteTargetId) return
    
    try {
      if (deleteType === 'subcategory') {
        await categoryAPI.deleteCategory(deleteTargetId)
        
        // Reload subcategories
        const subCategoriesData = await categoryAPI.getSubCategories(categoryId)
        setSubCategories(subCategoriesData || [])
        
        // Dispatch custom event để Header cập nhật ngay
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('categoryChanged'))
          window.dispatchEvent(new CustomEvent('showToast', { 
            detail: { message: 'Đã xóa danh mục con thành công!', type: 'success', duration: 3000 } 
          }));
        }
      } else if (deleteType === 'product') {
        console.log('🗑️ Deleting product:', deleteTargetId)
        await productAPI.deleteProduct(deleteTargetId)
        
        // Reload products using same logic as useEffect
        if (selectedSubCategoryId) {
          const subCat = subCategories.find(c => c.id === selectedSubCategoryId)
          if (subCat) {
            console.log('🔄 Reloading products for:', subCat.slug)
            const response = await productAPI.getProducts({
              category_slug: subCat.slug,
              status: 'active'
            })
            
            // Handle different response formats
            let productsArray = []
            if (Array.isArray(response)) {
              productsArray = response
            } else if (response?.products && Array.isArray(response.products)) {
              productsArray = response.products
            } else if (response?.data && Array.isArray(response.data)) {
              productsArray = response.data
            }
            
            console.log('✅ Reloaded products:', productsArray.length, 'items')
            setProducts(productsArray)
          }
        }
        
        // Reload subcategories để cập nhật product_count
        categoryAPI.getSubCategories(categoryId).then(subCategoriesData => {
          setSubCategories(subCategoriesData || [])
        }).catch(err => console.error('Error reloading subcategories:', err))
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('showToast', { 
            detail: { message: 'Đã xóa sản phẩm thành công!', type: 'success', duration: 3000 } 
          }));
        }
      }
    } catch (error) {
      console.error(`Error deleting ${deleteType}:`, error)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: `Lỗi khi xóa ${deleteType === 'product' ? 'sản phẩm' : 'danh mục con'}: ` + error.message, type: 'error', duration: 3000 } 
        }));
      }
    } finally {
      setDeleteTargetId(null)
      setDeleteType('subcategory')
      setShowDeleteConfirm(false)
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
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Lỗi khi lưu danh mục con: ' + error.message, type: 'error', duration: 3000 } 
        }));
      }
    }
  }

  const handleSaveProduct = async (productData) => {
    try {
      console.log('💾 handleSaveProduct called with:', JSON.stringify(productData.variants, null, 2))
      
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
      
      console.log('📦 Product with category:', JSON.stringify(productWithCategory.variants, null, 2))
      
      const isUpdate = !!selectedProduct
      
      if (isUpdate) {
        await productAPI.updateProduct(selectedProduct.id, productWithCategory)
      } else {
        await productAPI.createProduct(productWithCategory)
      }
      
      // Đóng modal ngay để cải thiện UX
      setShowProductForm(false)
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
      
      // Reload products và subcategories trong background
      if (selectedSubCategoryId && viewMode === 'products') {
        const subCat = subCategories.find(c => c.id === selectedSubCategoryId)
        if (subCat) {
          // Reload products
          productAPI.getProducts({
            category_slug: subCat.slug,
            status: 'active'
          }).then(response => {
            let productsArray = []
            if (Array.isArray(response)) {
              productsArray = response
            } else if (response?.products && Array.isArray(response.products)) {
              productsArray = response.products
            } else if (response?.data && Array.isArray(response.data)) {
              productsArray = response.data
            }
            setProducts(productsArray)
          }).catch(err => {
            console.error('Error reloading products:', err)
          })
        }
      }
      
      // Reload subcategories để cập nhật số lượng sản phẩm
      categoryAPI.getSubCategories(categoryId).then(subCategoriesData => {
        setSubCategories(subCategoriesData || [])
      }).catch(err => {
        console.error('Error reloading subcategories:', err)
      })
      
    } catch (error) {
      console.error('Error saving product:', error)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Lỗi khi lưu sản phẩm: ' + error.message, type: 'error', duration: 3000 } 
        }));
      }
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
                  Quản lý danh mục con của &quot;{category.name}&quot;
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
                  Sản phẩm trong &quot;{subCategories.find(c => c.id === selectedSubCategoryId)?.name || ''}&quot;
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
                              backgroundImage: `url(${getImageUrl(product.image)})`,
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
                              onClick={async () => {
                                // Fetch full product data (including color images)
                                try {
                                  const fullProduct = await productAPI.getProductById(product.id)
                                  setSelectedProduct(fullProduct)
                                  setShowProductForm(true)
                                } catch (error) {
                                  console.error('Error loading product:', error)
                                  // Fallback to list product if API fails
                                  setSelectedProduct(product)
                                  setShowProductForm(true)
                                }
                              }}
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="admin-btn admin-btn-sm admin-btn-ghost"
                              title="Xóa"
                              onClick={() => handleDeleteProduct(product.id)}
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

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setDeleteTargetId(null)
          setDeleteType('subcategory')
        }}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message={deleteType === 'product' 
          ? 'Bạn có chắc chắn muốn xóa sản phẩm này?' 
          : 'Bạn có chắc chắn muốn xóa danh mục con này?'
        }
        confirmText="Xóa"
        cancelText="Hủy"
        confirmButtonClass="btn-confirm-delete"
      />
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

