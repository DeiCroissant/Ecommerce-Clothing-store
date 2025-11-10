'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Folder,
  Image as ImageIcon,
  Package,
  ChevronRight
} from 'lucide-react'
import * as categoryAPI from '@/lib/api/categories'
import CategoryFormModal from '@/components/admin/categories/CategoryFormModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

export default function AdminCategoriesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all') // all, active, inactive
  const [showMainOnly, setShowMainOnly] = useState(true) // Chỉ hiển thị danh mục chính
  const [categoriesList, setCategoriesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [deleteMessage, setDeleteMessage] = useState('')

  // Load categories từ API
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true)
      try {
        console.log('Loading categories, showMainOnly:', showMainOnly)
        if (showMainOnly) {
          const categories = await categoryAPI.getMainCategories()
          console.log('Loaded main categories:', categories)
          setCategoriesList(categories || [])
        } else {
          const allCategories = await categoryAPI.getCategories({ status: 'active' })
          console.log('Loaded all categories:', allCategories)
          // Filter by search query
          const filtered = searchQuery 
            ? allCategories.filter(c => 
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.slug.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : allCategories
          setCategoriesList(filtered || [])
        }
      } catch (error) {
        console.error('Error loading categories:', error)
        setCategoriesList([])
      } finally {
        setLoading(false)
      }
    }
    
    loadCategories()
  }, [showMainOnly, searchQuery])

  // Tìm kiếm và lọc danh mục
  const filteredCategories = useMemo(() => {
    let allCategories = [...categoriesList]
    
    if (filterStatus !== 'all') {
      allCategories = allCategories.filter(c => 
        filterStatus === 'active' ? c.status === 'active' : c.status !== 'active'
      )
    }
    
    return allCategories
  }, [filterStatus, categoriesList])

  // Xóa danh mục và tất cả danh mục con, sản phẩm
  const handleDeleteCategory = async (categoryId) => {
    const category = categoriesList.find(c => c.id === categoryId)
    if (!category) return

    // Lấy danh mục con từ API
    const subCategories = await categoryAPI.getSubCategories(categoryId)

    let message = `Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`
    
    const subcategoriesCount = category.subcategories_count || 0
    const productsCount = category.product_count || 0
    
    if (subcategoriesCount > 0) {
      message += `\n\n⚠️ CẢNH BÁO: Hành động này sẽ xóa:\n- ${subcategoriesCount} danh mục con\n- ${productsCount} sản phẩm trong các danh mục này`
    } else {
      message += `\n\n⚠️ Sẽ xóa ${productsCount} sản phẩm trong danh mục này.`
    }
    
    message += `\n\nHành động này không thể hoàn tác!`

    setDeleteMessage(message)
    setDeleteTargetId(categoryId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteCategory = async () => {
    if (!deleteTargetId) return
    
    try {
      // Gọi API để xóa danh mục
      const result = await categoryAPI.deleteCategory(deleteTargetId)
      
      console.log('Đã xóa danh mục:', result.deleted_category)
      console.log('Đã xóa danh mục con:', result.deleted_subcategories)
      
      // Reload categories từ API
      if (showMainOnly) {
        const categories = await categoryAPI.getMainCategories()
        setCategoriesList(categories)
      } else {
        const allCategories = await categoryAPI.getCategories({ status: 'active' })
        const filtered = searchQuery 
          ? allCategories.filter(c => 
              c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.slug.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : allCategories
        setCategoriesList(filtered)
      }
      
      // Dispatch custom event để Header cập nhật ngay
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('categoryChanged'))
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Đã xóa danh mục thành công!', type: 'success', duration: 3000 } 
        }));
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Lỗi khi xóa danh mục: ' + error.message, type: 'error', duration: 3000 } 
        }));
      }
    } finally {
      setDeleteTargetId(null)
      setDeleteMessage('')
      setShowDeleteConfirm(false)
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
              Quản lý Danh mục
            </h1>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)'
            }}>
              Quản lý và tổ chức danh mục sản phẩm
            </p>
          </div>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => {
              setSelectedCategory(null)
              setShowAddForm(true)
            }}
          >
            <Plus size={20} />
            <span>Thêm danh mục</span>
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
              placeholder="Tìm kiếm danh mục (tên, slug)..."
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
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showMainOnly}
              onChange={(e) => setShowMainOnly(e.target.checked)}
            />
            <span style={{ fontSize: 'var(--text-sm)' }}>Chỉ danh mục chính</span>
          </label>
        </div>
      </div>

      {/* Categories List - Hiển thị như header */}
      <div className="admin-grid admin-grid-cols-1">
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Danh sách danh mục</h2>
              <p className="admin-card-description">
                {filteredCategories.length} danh mục {showMainOnly && '(chỉ danh mục chính)'}
              </p>
            </div>
          </div>
          <div className="admin-table-container" style={{ border: 'none' }}>
            {filteredCategories.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: 'var(--space-8)',
                color: 'var(--text-tertiary)'
              }}>
                Không tìm thấy danh mục nào
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Danh mục</th>
                    <th>Slug</th>
                    <th>Mô tả</th>
                    <th className="admin-table-cell-center">Danh mục con</th>
                    <th className="admin-table-cell-center">Sản phẩm</th>
                    <th className="admin-table-cell-center">Trạng thái</th>
                    <th className="admin-table-cell-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                        Đang tải...
                      </td>
                    </tr>
                  ) : filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
                        Không tìm thấy danh mục nào
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((category) => {
                    return (
                      <tr key={category.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <Folder size={20} style={{ color: 'var(--brand-500)' }} />
                            <div>
                              <div style={{ 
                                fontWeight: 'var(--font-semibold)',
                                fontSize: 'var(--text-base)',
                                marginBottom: '2px'
                              }}>
                                {category.name}
                              </div>
                              {category.parent_id && (
                                <div style={{ 
                                  fontSize: 'var(--text-xs)', 
                                  color: 'var(--text-tertiary)'
                                }}>
                                  Danh mục con
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ 
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--text-secondary)'
                          }}>
                            {category.slug}
                          </span>
                        </td>
                        <td>
                          <span style={{ 
                            fontSize: 'var(--text-sm)',
                            color: 'var(--text-secondary)',
                            maxWidth: '300px',
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {category.description}
                          </span>
                        </td>
                        <td className="admin-table-cell-center">
                          {category.parent_id === null ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                              <Folder size={14} style={{ color: 'var(--text-tertiary)' }} />
                              <span style={{ fontWeight: 'var(--font-medium)' }}>
                                {category.subcategories_count || 0}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                              -
                            </span>
                          )}
                        </td>
                        <td className="admin-table-cell-center">
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <Package size={14} style={{ color: 'var(--text-tertiary)' }} />
                            <span style={{ fontWeight: 'var(--font-medium)' }}>
                              {category.product_count || 0}
                            </span>
                          </div>
                        </td>
                        <td className="admin-table-cell-center">
                          <span className={`admin-badge ${
                            category.status === 'active' 
                              ? 'admin-badge-success' 
                              : 'admin-badge-secondary'
                          }`}>
                            {category.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                          </span>
                        </td>
                        <td className="admin-table-cell-center">
                          <div className="admin-table-actions">
                            {category.parent_id === null && (
                              <button
                                className="admin-btn admin-btn-sm admin-btn-primary"
                                onClick={() => router.push(`/admin/products/categories/${category.id}`)}
                                title="Vào danh mục"
                              >
                                <ChevronRight size={16} />
                                <span>Vào</span>
                              </button>
                            )}
                            <button 
                              className="admin-btn admin-btn-sm admin-btn-ghost"
                              title="Chỉnh sửa"
                              onClick={() => {
                                setSelectedCategory(category)
                                setShowAddForm(true)
                              }}
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="admin-btn admin-btn-sm admin-btn-ghost"
                              title="Xóa"
                              onClick={() => handleDeleteCategory(category.id)}
                              style={{ color: 'var(--error-600)' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      {showAddForm && (
        <CategoryFormModal
          category={selectedCategory}
          onClose={() => {
            setShowAddForm(false)
            setSelectedCategory(null)
          }}
          onSave={async (categoryData) => {
            try {
              if (selectedCategory) {
                // Cập nhật danh mục
                await categoryAPI.updateCategory(selectedCategory.id, categoryData)
              } else {
                // Tạo danh mục mới
                await categoryAPI.createCategory(categoryData)
              }
              
              setShowAddForm(false)
              setSelectedCategory(null)
              
              // Reload categories từ API
              if (showMainOnly) {
                const categories = await categoryAPI.getMainCategories()
                setCategoriesList(categories)
              } else {
                const allCategories = await categoryAPI.getCategories({ status: 'active' })
                const filtered = searchQuery 
                  ? allCategories.filter(c => 
                      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                  : allCategories
                setCategoriesList(filtered)
              }
              
              // Dispatch custom event để Header cập nhật ngay
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('categoryChanged'))
              }
            } catch (error) {
              console.error('Error saving category:', error)
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('showToast', { 
                  detail: { message: 'Lỗi khi lưu danh mục: ' + error.message, type: 'error', duration: 3000 } 
                }));
              }
            }
          }}
        />
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setDeleteTargetId(null)
          setDeleteMessage('')
        }}
        onConfirm={confirmDeleteCategory}
        title="Xác nhận xóa"
        message={deleteMessage}
        confirmText="Xóa"
        cancelText="Hủy"
        confirmButtonClass="btn-confirm-delete"
      />
    </div>
  )
}

